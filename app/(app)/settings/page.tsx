import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const [{ data: userRow }, { data: profile }, { data: practiceSessions }] = await Promise.all([
    supabase.from("users").select("name, email").eq("id", userId).single(),
    supabase.from("user_profile").select("test_date").eq("user_id", userId).single(),
    supabase.from("practice_sessions")
      .select("section, correct, total, predicted_score, sjt_band, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  return (
    <SettingsClient
      user={session!.user as any}
      userRow={{ ...userRow, exam_date: profile?.test_date }}
      practiceSessions={practiceSessions ?? []}
    />
  );
}
