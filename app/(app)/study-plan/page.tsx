import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { requirePaid } from "@/lib/isPaid";
import StudyPlanClient from "./StudyPlanClient";

export default async function StudyPlanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const u = session.user as any;
  const userId = u.id;
  await requirePaid(userId, u.role ?? "user", u.email ?? "");

  const [
    { data: responses },
    { data: diagnosticReport },
    { data: userRow },
  ] = await Promise.all([
    supabase
      .from("question_responses")
      .select("question_tag, is_correct, time_taken_ms, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("diagnostic_reports")
      .select("vr_score, dm_score, qr_score, total_score, sjt_band, subtype_scores, groq_analysis, groq_study_plan, created_at")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("users")
      .select("exam_date, name")
      .eq("id", userId)
      .single(),
  ]);

  return (
    <StudyPlanClient
      responses={responses ?? []}
      diagnosticReport={diagnosticReport ?? null}
      examDate={userRow?.exam_date ?? null}
    />
  );
}
