import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "sawdaj19@gmail.com";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const questions = await req.json();
  if (!Array.isArray(questions))
    return NextResponse.json({ error: "Expected array" }, { status: 400 });

  let inserted = 0;
  const errors: string[] = [];

  for (const q of questions) {
    let statements = null;
    if (q.type === "yn5" && Array.isArray(q.statements)) {
      const answers = String(q.correct_answer ?? "").split(",").map((s: string) => s.trim());
      statements = q.statements.map((text: string, i: number) => ({
        text,
        correct: answers[i] === "Y" ? "Yes" : "No",
      }));
    }

    const row: Record<string, unknown> = {
      stimulus: q.stimulus ?? q.context ?? "",
      type: q.type ?? "mcq",
      question: q.question ?? (q.type === "yn5" ? "For each statement, decide whether it necessarily follows." : ""),
      option_a: q.option_a ?? null,
      option_b: q.option_b ?? null,
      option_c: q.option_c ?? null,
      option_d: q.option_d ?? null,
      option_e: q.option_e ?? null,
      correct_answer: q.correct_answer ?? "A",
      difficulty: q.difficulty ?? "Gold",
      topic: q.topic ?? "",
      walkthrough: q.walkthrough ?? "",
      statements,
      answer_figure: q.answer_figure ?? null,
      chart: q.chart ?? null,
    };

    const { error } = await db.from("dm_questions").insert(row);
    if (error) {
      errors.push(`[${q.type ?? "mcq"}] ${q.topic ?? "unknown"}: ${error.message}`);
    } else {
      inserted++;
    }
  }

  return NextResponse.json({ ok: true, inserted, errors });
}
