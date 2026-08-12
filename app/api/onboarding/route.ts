import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { test_date } = await req.json();

  const { error } = await supabase.from("user_profile").upsert({
    user_id: userId,
    test_date: test_date || null,
    onboarding_complete: true,
    created_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  if (error) {
    console.error("Onboarding upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
