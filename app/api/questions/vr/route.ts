import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { shuffle } from "@/lib/utils";

function correctIndex(letter: string): number {
  return Math.max(0, "ABCD".indexOf(letter.trim().toUpperCase()[0]));
}

function parseHighlightTag(text: string): { highlight: string; clean: string } {
  const m = String(text ?? "").match(/^\s*\[Highlight:\s*"([^"]+)"\]\s*/);
  return m ? { highlight: m[1], clean: text.slice(m[0].length) } : { highlight: "", clean: String(text ?? "") };
}

function mapDifficulty(d: string): string {
  return d === "Diamond" ? "Platinum" : d;
}

// Extract set key from ID: "VRP-001-TFCT-S2-G" → "TFCT-S2"
function setKeyFromId(id: string): string {
  const m = id.match(/-((?:TFCT|MCQ)-S\d+)-[A-Z]$/);
  return m ? m[1] : "";
}

// GET /api/questions/vr?difficulty=Bronze,Gold&count=12
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const rawDifficulties = sp.get("difficulty") ?? "Gold";
  const difficulties = rawDifficulties.split(",").map(d => mapDifficulty(d.trim())).filter(Boolean);
  const totalCount = Math.max(4, Number(sp.get("count")) || 12);
  const setCount = Math.round(totalCount / 4); // one set = 4 questions

  const rawSubtype = sp.get("subtype") ?? "";

  // Fetch all questions at requested difficulties
  let qQuery = supabase
    .from("vr_questions")
    .select("id, passage_code, format, difficulty")
    .in("difficulty", difficulties);

  if (rawSubtype) {
    qQuery = qQuery.ilike("primary_subtype", `%${rawSubtype.replace(/-/g, " ")}%`);
  }

  const { data: matchingQ, error: mqErr } = await qQuery;

  if (mqErr) return NextResponse.json({ error: mqErr.message }, { status: 500 });

  // Build map: passageCode → Set<setKey>  (only sets that have a question at target difficulty)
  const passageSets: Record<string, Set<string>> = {};
  for (const row of matchingQ ?? []) {
    const key = setKeyFromId(row.id);
    if (!key) continue;
    if (!passageSets[row.passage_code]) passageSets[row.passage_code] = new Set();
    passageSets[row.passage_code].add(key);
  }

  const availablePassages = Object.keys(passageSets);
  if (availablePassages.length === 0) {
    return NextResponse.json({ error: "No questions found for the selected difficulty." }, { status: 404 });
  }

  // Randomly pick passages, then one set per passage
  const chosenPassages = shuffle(availablePassages).slice(0, setCount);

  // Collect all set keys to fetch (passageCode + setKey pairs)
  const setsToFetch: { passageCode: string; setKey: string }[] = [];
  for (const code of chosenPassages) {
    const sets = shuffle([...passageSets[code]]);
    const chosen = sets[0]; // one pre-designed set per passage
    setsToFetch.push({ passageCode: code, setKey: chosen });
  }

  // Fetch passage texts
  const { data: passageRows } = await supabase
    .from("vr_passages")
    .select("code, title, passage")
    .in("code", chosenPassages);

  const passageMap: Record<string, { title: string; passage: string }> = {};
  for (const p of passageRows ?? []) {
    passageMap[p.code] = { title: p.title, passage: p.passage };
  }

  // Fetch all questions belonging to each chosen set
  const sessionQuestions: any[] = [];

  for (const { passageCode, setKey } of setsToFetch) {
    const [format, setNum] = setKey.split("-"); // "TFCT", "S2"

    // Match IDs like "VRP-XXX-TFCT-S2-*"
    const idPrefix = `${passageCode}-${format}-${setNum}-`;

    const { data: setQs } = await supabase
      .from("vr_questions")
      .select("*")
      .like("id", `${idPrefix}%`)
      .order("id"); // B → G → P → S — consistent order

    if (!setQs || setQs.length === 0) continue;

    const psg = passageMap[passageCode];

    // Sort by difficulty within the set: Bronze → Silver → Gold → Platinum
    const diffOrder = ["Bronze", "Silver", "Gold", "Platinum"];
    const sorted = [...setQs].sort(
      (a, b) => diffOrder.indexOf(a.difficulty) - diffOrder.indexOf(b.difficulty)
    );

    for (const q of sorted) {
      const options =
        q.format === "TFCT"
          ? [q.option_a, q.option_b, q.option_c].filter(Boolean)
          : [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);

      sessionQuestions.push({
        id: q.id,
        passageCode,
        passageTitle: psg?.title ?? "",
        setKey,
        format: q.format,
        difficulty: q.difficulty === "Platinum" ? "Diamond" : q.difficulty,
        tag: `vr-${(q.primary_subtype ?? "").toLowerCase().replace(/[\s/]+/g, "-")}`,
        contextLabel: psg?.title ?? "Passage",
        context: psg?.passage ?? "",
        question: q.question,
        options,
        correct: correctIndex(q.correct_answer),
        explanation: q.explanation ?? "",
        supportingEvidence: q.supporting_evidence ?? "",
        primarySubtype: q.primary_subtype ?? "",
        skillFocus: q.skill_focus ?? "",
      });
    }
  }

  // Also include admin-imported VR questions (with [Highlight: "..."] support)
  const { data: adminQs } = await supabase
    .from("admin_qs")
    .select("id, question_text, options, correct, explanations, passage_id, difficulty, subtype, admin_passages(content)")
    .eq("section", "vr")
    .limit(totalCount);

  for (const aq of adminQs ?? []) {
    const passageContent: string = (aq.admin_passages as any)?.content ?? "";
    const options: string[] = Array.isArray(aq.options) ? aq.options : ["True", "False", "Can't Tell"];

    // Resolve correct answer to numeric index
    const correctRaw = String(aq.correct ?? "True").trim();
    let correctIdx = options.findIndex(o => o.toLowerCase() === correctRaw.toLowerCase());
    if (correctIdx < 0 && /^[A-E]$/i.test(correctRaw)) correctIdx = "ABCDE".indexOf(correctRaw.toUpperCase());
    if (correctIdx < 0) correctIdx = 0;

    // Extract [Highlight: "..."] from the correct option's explanation → supportingEvidence
    const explanationsObj: Record<string, string> = (aq.explanations as any) ?? {};
    const correctLabel = options[correctIdx] ?? correctRaw;
    const correctExpRaw =
      explanationsObj[correctLabel] ??
      Object.entries(explanationsObj).find(([k]) => k.toLowerCase() === correctLabel.toLowerCase())?.[1] ??
      "";
    const { highlight: supportingEvidence, clean: correctExpClean } = parseHighlightTag(correctExpRaw);

    // Build per-option explanation array so each option box shows its own reason
    const optionExplanations = options.map(opt => {
      const raw =
        explanationsObj[opt] ??
        Object.entries(explanationsObj).find(([k]) => k.toLowerCase() === opt.toLowerCase())?.[1] ??
        "";
      return parseHighlightTag(raw).clean;
    });

    sessionQuestions.push({
      id: aq.id,
      passageCode: aq.passage_id,
      passageTitle: "Passage",
      setKey: aq.passage_id,
      format: options.length <= 3 && options[0] === "True" ? "TFCT" : "MCQ",
      difficulty: aq.difficulty ?? "Gold",
      tag: `vr-${String(aq.subtype ?? "").toLowerCase().replace(/[\s/]+/g, "-") || "admin"}`,
      contextLabel: "Passage",
      context: passageContent,
      question: aq.question_text,
      options,
      correct: correctIdx,
      explanation: correctExpClean,
      optionExplanations,
      supportingEvidence,
      primarySubtype: aq.subtype ?? "",
      skillFocus: "",
    });
  }

  return NextResponse.json({
    questions: sessionQuestions,
    sessionId: `vr-${Date.now()}`,
  });
}
