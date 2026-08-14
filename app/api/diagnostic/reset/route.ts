import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  await Promise.all([
    supabase.from("diagnostic_reports").delete().eq("user_id", userId),
    supabase.from("question_responses").delete().eq("user_id", userId).eq("session_type", "diagnostic"),
    supabase.from("ai_study_plan").delete().eq("user_id", userId),
  ]);

  return NextResponse.json({ ok: true });
}
