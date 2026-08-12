import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const [{ data: userRow }, { data: profile }] = await Promise.all([
    supabase.from("users").select("name, email").eq("id", userId).single(),
    supabase.from("user_profile").select("test_date").eq("user_id", userId).single(),
  ]);
  return <SettingsClient user={session!.user as any} userRow={{ ...userRow, exam_date: profile?.test_date }} />;
}
