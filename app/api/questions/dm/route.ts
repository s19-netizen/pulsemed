import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { shuffle } from "@/lib/utils";

// GET /api/questions/dm?family=Syllogisms,Interpreting+Information&difficulty=Silver,Gold&count=15
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const rawDifficulties = sp.get("difficulty") ?? "Silver,Gold";
  const difficulties = rawDifficulties.split(",").map(d => d.trim()).filter(Boolean);
  const rawFamilies = sp.get("family") ?? "";
  const families = rawFamilies ? rawFamilies.split(",").map(f => f.trim()).filter(Boolean) : [];
  const count = Math.max(1, Number(sp.get("count")) || 15);

  let query = supabase
    .from("dm_questions")
    .select("*")
    .in("difficulty", difficulties);

  if (families.length > 0) {
    query = query.in("family", families);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pool = shuffle(data ?? []);

  // Group YN-5 questions by set_id so they stay together
  const setMap = new Map<string, typeof pool>();
  const mcqPool: typeof pool = [];

  for (const q of pool) {
    if (q.format === "YN-5") {
      const set = setMap.get(q.set_id) ?? [];
      set.push(q);
      setMap.set(q.set_id, set);
    } else {
      mcqPool.push(q);
    }
  }

  // Build question list — include full YN-5 sets or individual MCQ questions
  const questions: object[] = [];
  let remaining = count;

  for (const [, setQs] of setMap) {
    if (remaining <= 0) break;
    const sorted = setQs.sort((a, b) => a.id.localeCompare(b.id));
    // Always include the full set — never cut mid-way
    for (const q of sorted) questions.push(formatQuestion(q));
    remaining--;
  }

  for (const q of mcqPool) {
    if (remaining <= 0) break;
    questions.push(formatQuestion(q));
    remaining--;
  }

  // Also include admin-imported DM questions
  const { data: adminQs } = await supabase
    .from("admin_qs")
    .select("id, question_text, options, correct, explanations, subtype, difficulty, passage_id, admin_passages(content, chart)")
    .eq("section", "dm")
    .limit(count);

  for (const aq of adminQs ?? []) {
    const context: string = (aq.admin_passages as any)?.content ?? "";
    const chartFigure = (aq.admin_passages as any)?.chart ?? null;
    const opts: string[] = Array.isArray(aq.options) ? aq.options : ["Yes", "No"];

    const correctRaw = String(aq.correct ?? opts[0] ?? "").trim().toLowerCase();
    let correctIdx = opts.findIndex(o => String(o).trim().toLowerCase() === correctRaw);
    if (correctIdx < 0 && /^[a-e]$/.test(correctRaw)) correctIdx = "abcde".indexOf(correctRaw);
    if (correctIdx < 0) correctIdx = 0;

    const expObj: Record<string, string> = (aq.explanations as any) ?? {};
    const correctLabel = opts[correctIdx] ?? "";
    const explanation =
      expObj[correctLabel] ??
      Object.entries(expObj).find(([k]) => k.toLowerCase() === correctLabel.toLowerCase())?.[1] ??
      Object.values(expObj)[0] ??
      "";

    questions.push({
      id: aq.id,
      tag: `dm-${String(aq.subtype ?? "").toLowerCase().replace(/\s+/g, "-") || "admin"}`,
      contextLabel: "SCENARIO",
      context,
      chartFigure,
      question: aq.question_text,
      options: opts,
      correct: correctIdx,
      explanation,
      difficulty: aq.difficulty ?? "Silver",
      questionType: aq.subtype ?? "Decision Making",
      suggestedTimeSec: 55,
    });
  }

  return NextResponse.json({ questions, sessionId: `dm-${Date.now()}` });
}

function formatQuestion(q: Record<string, any>) {
  const isYN = q.format === "YN-5";
  const options = isYN ? ["Yes", "No"] : [q.option_a, q.option_b].filter(Boolean) as string[];

  let correct = 0;
  if (isYN) {
    correct = String(q.correct_answer).trim().toLowerCase() === "yes" ? 0 : 1;
  } else {
    const ans = String(q.correct_answer).trim().toLowerCase();
    const idx = options.findIndex(o => String(o).trim().toLowerCase() === ans);
    correct = idx >= 0 ? idx : 0;
  }

  return {
    id: q.id,
    tag: `dm-${String(q.family ?? "").toLowerCase().replace(/\s+/g, "-")}`,
    contextLabel: isYN ? "RULES" : "SCENARIO",
    context: q.stimulus,
    chartFigure: q.chart ?? null,
    question: q.question,
    options,
    correct,
    explanation: q.walkthrough,
    difficulty: q.difficulty,
    questionType: q.family,
    suggestedTimeSec: Number(q.time_sec) || 55,
    setId: isYN ? q.set_id : undefined,
  };
}
