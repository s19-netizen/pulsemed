import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { data } = await supabase
    .from("user_profile")
    .select("test_date")
    .eq("user_id", userId)
    .single();

  return NextResponse.json({ test_date: data?.test_date ?? null });
}
