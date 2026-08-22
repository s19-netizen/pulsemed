import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import TutorDashboard from "./TutorDashboard";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function TutorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "tutor") redirect("/auth/tutor");

  const tutorId = (session.user as any).id;

  const { data: tutor } = await serviceSupabase
    .from("tutors")
    .select("name, email")
    .eq("id", tutorId)
    .single();

  const { data: students } = await serviceSupabase
    .from("students")
    .select("id, name, username, exam_date, created_at")
    .eq("tutor_id", tutorId)
    .order("created_at", { ascending: false });

  const ids = (students ?? []).map(s => s.id);

  let sessionStats: Record<string, { sessions: number; correct: number; total: number; last_active: string | null }> = {};
  let timeStats: Record<string, number> = {};
  let sectionBests: Record<string, Record<string, number>> = {};

  if (ids.length > 0) {
    const [{ data: practiceSessions }, { data: responses }] = await Promise.all([
      serviceSupabase.from("practice_sessions").select("user_id, section, correct, total, created_at").in("user_id", ids),
      serviceSupabase.from("question_responses").select("user_id, time_taken_ms").in("user_id", ids),
    ]);

    for (const s of practiceSessions ?? []) {
      if (!sessionStats[s.user_id]) sessionStats[s.user_id] = { sessions: 0, correct: 0, total: 0, last_active: null };
      sessionStats[s.user_id].sessions++;
      sessionStats[s.user_id].correct += s.correct ?? 0;
      sessionStats[s.user_id].total   += s.total   ?? 0;
      if (!sessionStats[s.user_id].last_active || s.created_at > sessionStats[s.user_id].last_active!) {
        sessionStats[s.user_id].last_active = s.created_at;
      }
      // Track per-section accuracy
      if (!sectionBests[s.user_id]) sectionBests[s.user_id] = {};
      const sec = s.section;
      if (!sectionBests[s.user_id][sec]) sectionBests[s.user_id][sec] = 0;
      if (s.total > 0) {
        const pct = Math.round((s.correct / s.total) * 100);
        if (pct > (sectionBests[s.user_id][sec] ?? 0)) sectionBests[s.user_id][sec] = pct;
      }
    }

    const timeBuckets: Record<string, number[]> = {};
    for (const r of responses ?? []) {
      if (!timeBuckets[r.user_id]) timeBuckets[r.user_id] = [];
      if (r.time_taken_ms) timeBuckets[r.user_id].push(r.time_taken_ms);
    }
    for (const [uid, times] of Object.entries(timeBuckets)) {
      timeStats[uid] = Math.round(times.reduce((a, b) => a + b, 0) / times.length / 1000);
    }
  }

  const enriched = (students ?? []).map(s => ({
    ...s,
    sessions:    sessionStats[s.id]?.sessions ?? 0,
    avg_score:   sessionStats[s.id]?.total
                   ? Math.round((sessionStats[s.id].correct / sessionStats[s.id].total) * 100)
                   : null,
    last_active: sessionStats[s.id]?.last_active ?? null,
    avg_time_s:  timeStats[s.id] ?? null,
    section_bests: sectionBests[s.id] ?? {},
  }));

  return <TutorDashboard tutor={tutor ?? { name: "Tutor", email: "" }} students={enriched} />;
}
