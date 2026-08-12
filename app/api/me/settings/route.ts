import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { name, exam_date } = await req.json();

  const [usersResult, profileResult] = await Promise.all([
    supabase.from("users").update({ name }).eq("id", userId),
    supabase.from("user_profile").update({ test_date: exam_date || null }).eq("user_id", userId),
  ]);

  const error = usersResult.error ?? profileResult.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
