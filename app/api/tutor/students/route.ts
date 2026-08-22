import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getTutorId(session: any): string | null {
  if (!session?.user || (session.user as any).role !== "tutor") return null;
  return (session.user as any).id;
}

// GET /api/tutor/students — list all students for this tutor
export async function GET() {
  const session = await getServerSession(authOptions);
  const tutorId = getTutorId(session);
  if (!tutorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: students, error } = await serviceSupabase
    .from("students")
    .select("id, name, username, exam_date, created_at")
    .eq("tutor_id", tutorId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch aggregate stats for all students in one query each
  const ids = (students ?? []).map(s => s.id);

  let sessionStats: Record<string, { sessions: number; correct: number; total: number; last_active: string | null }> = {};
  let timeStats: Record<string, number> = {};

  if (ids.length > 0) {
    const [{ data: sessions }, { data: responses }] = await Promise.all([
      serviceSupabase
        .from("practice_sessions")
        .select("user_id, correct, total, created_at")
        .in("user_id", ids),
      serviceSupabase
        .from("question_responses")
        .select("user_id, time_taken_ms")
        .in("user_id", ids),
    ]);

    for (const s of sessions ?? []) {
      if (!sessionStats[s.user_id]) sessionStats[s.user_id] = { sessions: 0, correct: 0, total: 0, last_active: null };
      sessionStats[s.user_id].sessions++;
      sessionStats[s.user_id].correct += s.correct ?? 0;
      sessionStats[s.user_id].total   += s.total ?? 0;
      if (!sessionStats[s.user_id].last_active || s.created_at > sessionStats[s.user_id].last_active!) {
        sessionStats[s.user_id].last_active = s.created_at;
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
  }));

  return NextResponse.json({ students: enriched });
}

// POST /api/tutor/students — create a new student
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const tutorId = getTutorId(session);
  if (!tutorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, username, password, exam_date } = await req.json();
  if (!name || !username || !password) {
    return NextResponse.json({ error: "Name, username, and password are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "_");

  const { data: existing } = await serviceSupabase
    .from("students")
    .select("id")
    .eq("username", cleanUsername)
    .single();

  if (existing) {
    return NextResponse.json({ error: `Username "${cleanUsername}" is already taken.` }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { data: student, error } = await serviceSupabase
    .from("students")
    .insert({ name: name.trim(), username: cleanUsername, password_hash, tutor_id: tutorId, exam_date: exam_date ?? null })
    .select("id, name, username, exam_date, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-insert into users + user_profile so existing app queries work
  await Promise.all([
    serviceSupabase.from("users").upsert({ id: student.id, name: student.name, email: `student::${student.username}` }, { onConflict: "id", ignoreDuplicates: true }),
    serviceSupabase.from("user_profile").upsert({ user_id: student.id, onboarding_complete: true, test_date: exam_date ?? null }, { onConflict: "user_id", ignoreDuplicates: true }),
  ]);

  return NextResponse.json({ student: { ...student, sessions: 0, avg_score: null, last_active: null, avg_time_s: null } });
}

// DELETE /api/tutor/students?id=xxx — remove a student
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const tutorId = getTutorId(session);
  if (!tutorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Verify student belongs to this tutor
  const { data: student } = await serviceSupabase
    .from("students").select("tutor_id").eq("id", id).single();

  if (!student || student.tutor_id !== tutorId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await serviceSupabase.from("students").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
