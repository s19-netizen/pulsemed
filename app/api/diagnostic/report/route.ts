import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const { data, error } = await supabase
    .from("diagnostic_reports")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return NextResponse.json({ report: null });
  return NextResponse.json({ report: data });
}
