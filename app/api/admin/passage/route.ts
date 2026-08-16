import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "sawdaj19@gmail.com";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { section, content, chart, questions } = body;

  if (!section || !content || !Array.isArray(questions)) {
    return NextResponse.json({ error: "Missing section, content, or questions" }, { status: 400 });
  }

  // Insert passage
  const { data: passage, error: pErr } = await db.from("admin_passages").insert({ section, content, chart: chart ?? null }).select("id").single();
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // Insert each question
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
    // For DM YN-5 sets, store statements inside options as extra data
    ...(q.statements ? { options: q.statements } : {}),
  }));

  const { error: qErr } = await db.from("admin_qs").insert(rows);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, passageId: passage.id });
}
