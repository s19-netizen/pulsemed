import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "sawdaj19@gmail.com";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function parseHighlightTag(text: string): { hl: string; clean: string } {
  const m = String(text ?? "").match(/^\s*\[Highlight:\s*"([^"]+)"\]\s*/);
  return m ? { hl: m[1], clean: text.slice(m[0].length) } : { hl: "", clean: String(text ?? "") };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { section, content, chart, questions } = body;

  if (!section || !content || !Array.isArray(questions)) {
    return NextResponse.json({ error: "Missing section, content, or questions" }, { status: 400 });
  }

  // Insert passage into admin_passages (for admin editing)
  const { data: passage, error: pErr } = await db.from("admin_passages").insert({ section, content, chart: chart ?? null }).select("id").single();
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // Insert each question into admin_qs
  const rows = questions.map((q: any) => ({
    passage_id: passage.id,
    section,
    q_type: q.q_type ?? q.type ?? null,
    subtype: q.subtype ?? null,
    difficulty: q.difficulty ?? null,
    question_text: q.question_text ?? null,
    options: q.options ?? null,
    correct: q.correct ?? null,
    explanations: q.explanations ?? null,
    venn: q.venn ?? null,
    sort_order: q.sort_order ?? 0,
    ...(q.statements ? { options: q.statements } : {}),
  }));

  const { error: qErr } = await db.from("admin_qs").insert(rows);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  // For VR: also promote to vr_passages + vr_questions so students can practice them
  if (section === "vr" && body.passage_code) {
    const { error: vpErr } = await db.from("vr_passages").upsert({
      code: body.passage_code,
      title: body.title ?? "",
      passage: content,
      word_count: content.split(/\s+/).filter(Boolean).length,
    }, { onConflict: "code" });
    if (vpErr) console.error("vr_passages upsert:", vpErr.message);

    for (const q of questions) {
      if (!q.vr_id) continue;

      const explanationsObj: Record<string, string> = q.explanations ?? {};
      const correctRaw = String(q.correct_answer ?? q.correct ?? "True").trim();

      // Find the correct option's explanation to extract [Highlight: "..."] → supporting_evidence
      const correctExpRaw =
        explanationsObj[correctRaw] ??
        Object.entries(explanationsObj).find(([k]) => k.toLowerCase() === correctRaw.toLowerCase())?.[1] ??
        "";
      const { hl: supportingEvidence, clean: correctExpClean } = parseHighlightTag(correctExpRaw);

      // Build a human-readable explanation from all options (stripped of highlight tags)
      const explanationStr = Object.entries(explanationsObj)
        .map(([k, v]) => {
          const { clean } = parseHighlightTag(v);
          return `${k}: ${clean}`;
        })
        .join(" | ") || correctExpClean;

      const { error: vqErr } = await db.from("vr_questions").upsert({
        id: q.vr_id,
        passage_code: body.passage_code,
        format: q.format ?? "TFCT",
        difficulty: q.difficulty ?? "Silver",
        primary_subtype: q.primary_subtype ?? "Direct Retrieval",
        skill_focus: q.skill_focus ?? "",
        question: q.question_text,
        option_a: q.option_a ?? "True",
        option_b: q.option_b ?? "False",
        option_c: q.option_c ?? "Can't Tell",
        option_d: q.option_d ?? null,
        correct_answer: correctRaw,
        supporting_evidence: supportingEvidence,
        explanation: correctExpClean || explanationStr,
      }, { onConflict: "id" });
      if (vqErr) console.error("vr_questions upsert:", vqErr.message, q.vr_id);
    }
  }

  return NextResponse.json({ ok: true, passageId: passage.id });
}
