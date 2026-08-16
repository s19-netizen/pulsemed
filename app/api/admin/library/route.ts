import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "sawdaj19@gmail.com";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/admin/library?section=vr&search=...&limit=60
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const section = sp.get("section") ?? "vr";
  const search  = sp.get("search") ?? "";
  const limit   = Math.min(100, Number(sp.get("limit")) || 60);

  // Fetch from admin_qs (admin-created questions)
  let q = db.from("admin_qs").select("id, section, q_type, subtype, difficulty, question_text, options, correct, explanations, sort_order, passage_id, admin_passages(content, chart)").eq("section", section).order("created_at", { ascending: false }).limit(limit);
  if (search) q = q.ilike("question_text", `%${search}%`);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also fetch from Supabase practice tables for each section
  let sourceRows: any[] = [];
  if (section === "dm") {
    let dq = db.from("dm_questions").select("id, family, difficulty, question, stimulus, format").limit(limit);
    if (search) dq = dq.ilike("question", `%${search}%`);
    const { data: dmData } = await dq;
    sourceRows = (dmData ?? []).map(r => ({ id: r.id, section: "dm", q_type: r.format === "YN-5" ? "yn5" : "mcq", subtype: r.family, difficulty: r.difficulty, question_text: r.question, context: r.stimulus, _source: "supabase_dm" }));
  } else if (section === "vr") {
    let vq = db.from("vr_questions").select("id, passage_code, format, difficulty, question_text, primary_subtype").limit(limit);
    if (search) vq = vq.ilike("question_text", `%${search}%`);
    const { data: vrData } = await vq;
    sourceRows = (vrData ?? []).map(r => ({ id: r.id, section: "vr", q_type: r.format === "TFCT" ? "tf" : "mcq", subtype: r.primary_subtype, difficulty: r.difficulty, question_text: r.question_text, _source: "supabase_vr" }));
  } else if (section === "qr") {
    let qq = db.from("qr_questions").select("id, difficulty, question_text, subtype").limit(limit);
    if (search) qq = qq.ilike("question_text", `%${search}%`);
    const { data: qrData } = await qq;
    sourceRows = (qrData ?? []).map(r => ({ id: r.id, section: "qr", q_type: "mcq", subtype: r.subtype, difficulty: r.difficulty, question_text: r.question_text, _source: "supabase_qr" }));
  }

  return NextResponse.json({
    adminQuestions: data ?? [],
    sourceQuestions: sourceRows,
  });
}
