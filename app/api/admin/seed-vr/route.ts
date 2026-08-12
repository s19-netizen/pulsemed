import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import passages from "@/lib/vr-passages.json";
import questions from "@/lib/vr-questions.json";

// POST /api/admin/seed-vr
// Seeds vr_passages and vr_questions from the JSON bank.
// Protect this with the SEED_SECRET env var.
export async function POST(req: Request) {
  const { secret } = await req.json().catch(() => ({}));
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Upsert passages
  const passageRows = (passages as any[]).map(p => ({
    code: p.code,
    title: p.title,
    passage: p.text,
    word_count: p.word_count,
  }));

  const { error: pErr } = await supabase
    .from("vr_passages")
    .upsert(passageRows, { onConflict: "code" });

  if (pErr) return NextResponse.json({ error: "passages: " + pErr.message }, { status: 500 });

  // Upsert questions in batches of 200
  const questionRows = (questions as any[]).map(q => ({
    id: q.id,
    passage_code: q.passage_code,
    format: q.format,
    difficulty: q.difficulty,
    primary_subtype: q.primary_subtype ?? "",
    skill_focus: q.skill_focus ?? "",
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c ?? "",
    option_d: q.option_d ?? "",
    correct_answer: q.correct_answer,
    supporting_evidence: q.supporting_evidence ?? "",
    explanation: q.explanation ?? "",
  }));

  const BATCH = 200;
  for (let i = 0; i < questionRows.length; i += BATCH) {
    const { error: qErr } = await supabase
      .from("vr_questions")
      .upsert(questionRows.slice(i, i + BATCH), { onConflict: "id" });
    if (qErr) return NextResponse.json({ error: `questions batch ${i}: ` + qErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, passages: passageRows.length, questions: questionRows.length });
}
