import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "sawdaj19@gmail.com";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (body.type === "new_mock") {
    const { error } = await db.from("admin_mocks").insert({
      title: body.title,
      sections: {},
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Question edit/override
  const { questionId, mockId, section, question, options, correct, explanation, context, presentation } = body;

  const { error } = await db.from("admin_edits").upsert({
    question_id: questionId,
    mock_id: mockId,
    section,
    question_text: question,
    options,
    correct_index: correct,
    explanation,
    context,
    presentation,
    updated_at: new Date().toISOString(),
  }, { onConflict: "question_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
