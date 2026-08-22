import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = "sawdaj19@gmail.com";

function getTutorId(session: any): string | null {
  if (!session?.user) return null;
  const role  = (session.user as any).role;
  const email = session.user.email;
  if (role === "tutor") return (session.user as any).id;
  if (email === ADMIN_EMAIL) return "admin";
  return null;
}

// GET /api/tutor/students/[id] — full stats for one student
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const tutorId = getTutorId(session);
  if (!tutorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  const { data: student } = await serviceSupabase
    .from("students")
    .select("id, name, username, exam_date, tutor_id, created_at")
    .eq("id", id)
    .single();

  if (!student || (tutorId !== "admin" && student.tutor_id !== tutorId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [
    { data: sessions },
    { data: responses },
    { data: diagnostic },
  ] = await Promise.all([
    serviceSupabase
      .from("practice_sessions")
      .select("section, correct, total, predicted_score, sjt_band, created_at, ai_insights")
      .eq("user_id", id)
      .order("created_at", { ascending: true }),
    serviceSupabase
      .from("question_responses")
      .select("is_correct, question_tag, time_taken_ms, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(500),
    serviceSupabase
      .from("diagnostic_reports")
      .select("total_score, vr_score, dm_score, qr_score, sjt_band, created_at")
      .eq("user_id", id)
      .single(),
  ]);

  // Per-section aggregates
  const sectionMap: Record<string, { correct: number; total: number; scores: number[]; times: number[] }> = {};
  for (const s of sessions ?? []) {
    if (!sectionMap[s.section]) sectionMap[s.section] = { correct: 0, total: 0, scores: [], times: [] };
    sectionMap[s.section].correct += s.correct ?? 0;
    sectionMap[s.section].total   += s.total   ?? 0;
    if (s.predicted_score) sectionMap[s.section].scores.push(s.predicted_score);
  }
  for (const r of responses ?? []) {
    if (r.time_taken_ms) {
      const tag = r.question_tag?.split("-")[0] ?? "unknown";
      if (!sectionMap[tag]) sectionMap[tag] = { correct: 0, total: 0, scores: [], times: [] };
      sectionMap[tag].times.push(r.time_taken_ms);
    }
  }

  const sectionStats = Object.entries(sectionMap).map(([section, d]) => ({
    section,
    accuracy:    d.total ? Math.round((d.correct / d.total) * 100) : null,
    avg_score:   d.scores.length ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : null,
    avg_time_s:  d.times.length  ? Math.round(d.times.reduce((a, b) => a + b, 0) / d.times.length / 1000) : null,
    session_count: (sessions ?? []).filter(s => s.section === section).length,
  }));

  // Topic breakdown from question_responses tags
  const tagMap: Record<string, { correct: number; total: number }> = {};
  for (const r of responses ?? []) {
    const tag = r.question_tag ?? "unknown";
    if (!tagMap[tag]) tagMap[tag] = { correct: 0, total: 0 };
    tagMap[tag].total++;
    if (r.is_correct) tagMap[tag].correct++;
  }
  const topicBreakdown = Object.entries(tagMap)
    .map(([tag, d]) => ({ tag, correct: d.correct, total: d.total, pct: Math.round((d.correct / d.total) * 100) }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({
    student,
    sessions:        sessions ?? [],
    sectionStats,
    topicBreakdown,
    diagnostic:      diagnostic ?? null,
    totalSessions:   (sessions ?? []).length,
    totalQuestions:  (responses ?? []).length,
    overallAccuracy: (responses ?? []).length
                       ? Math.round(((responses ?? []).filter(r => r.is_correct).length / (responses ?? []).length) * 100)
                       : null,
  });
}

// PATCH /api/tutor/students/[id] — reset student password
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const tutorId = getTutorId(session);
  if (!tutorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const { password } = await req.json();
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const { data: student } = await serviceSupabase
    .from("students").select("tutor_id").eq("id", id).single();

  if (!student || (tutorId !== "admin" && student.tutor_id !== tutorId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  await serviceSupabase.from("students").update({ password_hash }).eq("id", id);
  return NextResponse.json({ ok: true });
}
