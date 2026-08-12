import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    session_id,
    session_type,
    question_index,
    question_tag,
    is_correct,
    time_taken_ms,
    selected_answer,
    correct_answer,
  } = body;

  const { error } = await supabase.from("question_responses").insert({
    user_id: (session.user as any).id,
    session_id,
    session_type,
    question_index,
    question_tag,
    is_correct,
    time_taken_ms,
    selected_answer,
    correct_answer,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
