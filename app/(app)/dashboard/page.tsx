import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;

  const [{ data: userRow }, { data: responses }, { data: profile }, { data: diagnosticReport }, { data: practiceSessions }] = await Promise.all([
    supabase.from("users").select("name, exam_date, onboarded").eq("id", userId).single(),
    supabase.from("question_responses").select("is_correct, question_tag, created_at, time_taken_ms").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
    supabase.from("user_profile").select("test_date").eq("user_id", userId).single(),
    supabase.from("diagnostic_reports").select("id, total_score, vr_score, dm_score, qr_score, sjt_band").eq("user_id", userId).single(),
    supabase.from("practice_sessions").select("section, correct, total, predicted_score, sjt_band, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
  ]);

  return (
    <DashboardClient
      user={session!.user as any}
      userRow={userRow}
      responses={responses ?? []}
      testDate={profile?.test_date ?? null}
      diagnosticDone={!!diagnosticReport}
      diagnosticScore={diagnosticReport?.total_score ?? null}
      diagnosticBand={diagnosticReport?.sjt_band ?? null}
      diagnosticVr={diagnosticReport?.vr_score ?? null}
      diagnosticDm={diagnosticReport?.dm_score ?? null}
      diagnosticQr={diagnosticReport?.qr_score ?? null}
      practiceSessions={practiceSessions ?? []}
    />
  );
}
