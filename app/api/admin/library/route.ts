import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "sawdaj19@gmail.com";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function letterToIndex(letter: string): number {
  return Math.max(0, "ABCDE".indexOf(String(letter ?? "A").trim().toUpperCase()[0] ?? "A"));
}

// GET /api/admin/library?section=vr&search=...&limit=60
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const section = sp.get("section") ?? "vr";
  const search  = sp.get("search") ?? "";
  const limit   = Math.min(500, Number(sp.get("limit")) || 200);

  // Fetch from admin_qs (admin-created questions)
  let q = db.from("admin_qs")
    .select("id, section, q_type, subtype, difficulty, question_text, options, correct, explanations, sort_order, passage_id, admin_passages(content, chart)")
    .eq("section", section)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (search) q = q.ilike("question_text", `%${search}%`);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sourceRows: any[] = [];

  if (section === "dm") {
    let dq = db.from("dm_questions")
      .select("id, family, difficulty, question, stimulus, format, correct_answer, walkthrough")
      .limit(limit);
    if (search) dq = dq.ilike("question", `%${search}%`);
    const { data: dmData } = await dq;
    sourceRows = (dmData ?? []).map(r => ({
      id: r.id, section: "dm",
      q_type: r.format === "YN-5" ? "yn5" : "mcq",
      subtype: r.family, difficulty: r.difficulty,
      question_text: r.question,
      options: ["Yes", "No"],
      correct: String(r.correct_answer ?? "yes").toLowerCase() === "yes" ? 0 : 1,
      explanation: r.walkthrough ?? "",
      context: r.stimulus,
      groupKey: r.stimulus ?? r.id,
      groupLabel: (r.stimulus ?? "").slice(0, 80),
      _source: "supabase_dm",
    }));

  } else if (section === "vr") {
    let vq = db.from("vr_questions")
      .select("id, passage_code, format, difficulty, question, primary_subtype, option_a, option_b, option_c, option_d, correct_answer, explanation")
      .limit(limit);
    if (search) vq = vq.ilike("question", `%${search}%`);
    const { data: vrData } = await vq;

    const codes = [...new Set((vrData ?? []).map(r => r.passage_code))];
    const { data: passages } = codes.length
      ? await db.from("vr_passages").select("code, passage, title").in("code", codes)
      : { data: [] };
    const passageMap: Record<string, { passage: string; title: string }> = {};
    for (const p of passages ?? []) passageMap[p.code] = { passage: p.passage, title: p.title };

    sourceRows = (vrData ?? []).map(r => {
      const isTFCT = r.format === "TFCT";
      const options = isTFCT
        ? [r.option_a, r.option_b, r.option_c].filter(Boolean)
        : [r.option_a, r.option_b, r.option_c, r.option_d].filter(Boolean);
      const correctRaw = String(r.correct_answer ?? "A").trim().toUpperCase();
      const correct = isTFCT
        ? ["TRUE", "FALSE", "CAN'T TELL", "CANT TELL"].indexOf(correctRaw.toUpperCase()) >= 0
          ? ["TRUE", "FALSE", "CAN'T TELL"].findIndex(x => correctRaw.includes(x.replace("'", "").replace("CAN", "CAN")))
          : letterToIndex(correctRaw)
        : letterToIndex(correctRaw);
      return {
        id: r.id, section: "vr",
        q_type: isTFCT ? "tf" : "mcq",
        subtype: r.primary_subtype, difficulty: r.difficulty,
        question_text: r.question,
        options,
        correct: Math.max(0, correct),
        explanation: r.explanation ?? "",
        context: passageMap[r.passage_code]?.passage ?? "",
        contextLabel: passageMap[r.passage_code]?.title ?? "Passage",
        groupKey: r.passage_code,
        groupLabel: passageMap[r.passage_code]?.title ?? r.passage_code,
        _source: "supabase_vr",
      };
    });

  } else if (section === "qr") {
    let qq = db.from("qr_questions")
      .select("id, difficulty, question, topic, dataset_id, option_a, option_b, option_c, option_d, option_e, correct_answer, walkthrough")
      .limit(limit);
    if (search) qq = qq.ilike("question", `%${search}%`);
    const { data: qrData } = await qq;

    const dsIds = [...new Set((qrData ?? []).map(r => r.dataset_id))];
    const { data: datasets } = dsIds.length
      ? await db.from("qr_datasets").select("id, title, scenario, figure_brief").in("id", dsIds)
      : { data: [] };
    const dsMap: Record<string, { title: string; scenario: string; figure_brief: string }> = {};
    for (const d of datasets ?? []) dsMap[d.id] = { title: d.title, scenario: d.scenario, figure_brief: d.figure_brief };

    sourceRows = (qrData ?? []).map(r => {
      const ds = dsMap[r.dataset_id];
      const context = ds ? (ds.figure_brief ? `[${ds.figure_brief}]\n\n${ds.scenario}` : ds.scenario) : "";
      return {
        id: r.id, section: "qr", q_type: "mcq",
        subtype: r.topic, difficulty: r.difficulty,
        question_text: r.question,
        options: [r.option_a, r.option_b, r.option_c, r.option_d, r.option_e].filter(Boolean),
        correct: letterToIndex(r.correct_answer ?? "A"),
        explanation: r.walkthrough ?? "",
        context, contextLabel: ds?.title ?? "Data set",
        groupKey: r.dataset_id,
        groupLabel: ds?.title ?? "Data set",
        _source: "supabase_qr",
      };
    });

  } else if (section === "sjt") {
    let sq = db.from("sjt_questions")
      .select("id, format, difficulty, professional_theme, question, scenario, option_a, option_b, option_c, correct_answer, walkthrough")
      .limit(limit);
    if (search) sq = sq.ilike("question", `%${search}%`);
    const { data: sjtData } = await sq;

    const OPT_APPROP = ["A very appropriate thing to do", "Appropriate, but not ideal", "Inappropriate, but not awful", "A very inappropriate thing to do"];
    const OPT_IMPORT = ["Very important", "Important", "Of minor importance", "Not important at all"];

    sourceRows = (sjtData ?? []).map(r => {
      let options: string[] = [];
      let correct = 0;
      if (r.format === "most-least") {
        options = [r.option_a, r.option_b, r.option_c].filter(Boolean);
        // correct_answer stored as "most:0|least:2" — show as text for the editor
      } else {
        options = r.format === "importance" ? OPT_IMPORT : OPT_APPROP;
        correct = options.findIndex(o => o.toLowerCase() === String(r.correct_answer ?? "").toLowerCase());
        if (correct < 0) correct = 0;
      }
      return {
        id: r.id, section: "sjt", q_type: r.format,
        subtype: r.professional_theme, difficulty: r.difficulty,
        question_text: r.question,
        options,
        correct,
        explanation: r.walkthrough ?? "",
        context: r.scenario,
        contextLabel: "Scenario",
        groupKey: r.scenario ?? r.id,
        groupLabel: (r.scenario ?? "").slice(0, 80),
        _source: "supabase_sjt",
      };
    });
  }

  return NextResponse.json({
    adminQuestions: data ?? [],
    sourceQuestions: sourceRows,
  });
}
