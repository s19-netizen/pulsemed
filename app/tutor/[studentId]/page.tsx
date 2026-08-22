import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import StudentDetailClient from "./StudentDetailClient";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = "sawdaj19@gmail.com";

export default async function StudentDetailPage({ params }: { params: { studentId: string } }) {
  const session  = await getServerSession(authOptions);
  const role     = (session?.user as any)?.role;
  const email    = session?.user?.email;
  const isAdmin  = email === ADMIN_EMAIL;

  if (!session?.user || (role !== "tutor" && !isAdmin)) redirect("/auth/tutor");

  const tutorId   = role === "tutor" ? (session.user as any).id : null;
  const studentId = params.studentId;

  const { data: student } = await serviceSupabase
    .from("students")
    .select("id, name, username, password_plain, exam_date, tutor_id, created_at")
    .eq("id", studentId)
    .single();

  if (!student || (tutorId !== null && student.tutor_id !== tutorId)) notFound();

  const [
    { data: sessions },
    { data: responses },
    { data: diagnostic },
  ] = await Promise.all([
    serviceSupabase
      .from("practice_sessions")
      .select("section, correct, total, predicted_score, sjt_band, created_at, ai_insights")
      .eq("user_id", studentId)
      .order("created_at", { ascending: true }),
    serviceSupabase
      .from("question_responses")
      .select("is_correct, question_tag, time_taken_ms, created_at")
      .eq("user_id", studentId)
      .order("created_at", { ascending: false })
      .limit(500),
    serviceSupabase
      .from("diagnostic_reports")
      .select("total_score, vr_score, dm_score, qr_score, sjt_band, created_at")
      .eq("user_id", studentId)
      .single(),
  ]);

  return (
    <StudentDetailClient
      student={student}
      sessions={sessions ?? []}
      responses={responses ?? []}
      diagnostic={diagnostic ?? null}
    />
  );
}
