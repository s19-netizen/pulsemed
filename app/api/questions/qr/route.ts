import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { shuffle } from "@/lib/utils";

function correctIndex(raw: string): number {
  const m = raw.trim().match(/^([A-E])/i);
  return m ? "ABCDE".indexOf(m[1].toUpperCase()) : 0;
}

// GET /api/questions/qr?difficulty=Silver,Gold&count=20
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const rawDifficulties = sp.get("difficulty") ?? "Gold";
  const difficulties = rawDifficulties.split(",").map(d => d.trim()).filter(Boolean);
  const totalCount = Math.max(4, Number(sp.get("count")) || 20);

  // Each dataset has 1 question, so pull exactly totalCount datasets
  const datasetCount = totalCount;

  // Fetch dataset IDs that have questions at the requested difficulties
  const { data: matching, error: mErr } = await supabase
    .from("qr_questions")
    .select("dataset_id, difficulty")
    .in("difficulty", difficulties);

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

  const eligible = [...new Set((matching ?? []).map(r => r.dataset_id))];
  if (eligible.length === 0) {
    return NextResponse.json({ error: "No questions found for the selected difficulty." }, { status: 404 });
  }

  const chosenDatasets = shuffle(eligible).slice(0, datasetCount);

  // Fetch dataset text + chart data
  const { data: dsRows } = await supabase
    .from("qr_datasets")
    .select("id, title, scenario, figure_brief")
    .in("id", chosenDatasets);

  const dsMap: Record<string, { title: string; scenario: string; chart: object | null }> = {};
  for (const ds of dsRows ?? []) {
    // figure_brief stores chart JSON (if imported by the new script) or raw text (legacy)
    let chart: object | null = null;
    try {
      const parsed = JSON.parse(ds.figure_brief ?? "");
      if (parsed && typeof parsed.type === "string") chart = parsed;
    } catch { /* raw text — no chart */ }
    dsMap[ds.id] = { title: ds.title, scenario: ds.scenario, chart };
  }

  // Fetch questions for chosen datasets, filtered to requested difficulties
  const { data: qRows } = await supabase
    .from("qr_questions")
    .select("*")
    .in("dataset_id", chosenDatasets)
    .in("difficulty", difficulties)
    .order("id");

  // Build questions grouped by dataset (shuffle dataset order, keep within-dataset order)
  const datasetGroups: Record<string, unknown[]> = {};
  for (const dsId of chosenDatasets) datasetGroups[dsId] = [];

  for (const q of qRows ?? []) {
    const ds = dsMap[q.dataset_id];
    const options = [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(Boolean);
    (datasetGroups[q.dataset_id] ??= []).push({
      id: q.id,
      datasetId: q.dataset_id,
      tag: `qr-${q.topic?.toLowerCase().replace(/\s+/g, "-") ?? "general"}`,
      contextLabel: ds?.title ?? "Data set",
      context: ds?.scenario ?? "",
      chartFigure: ds?.chart ?? null,
      question: q.question,
      options,
      correct: correctIndex(q.correct_answer),
      explanation: q.walkthrough ?? "",
      difficulty: q.difficulty,
      suggestedTimeSec: q.time_sec ?? 45,
    });
  }

  // Shuffle dataset order, preserve question order within each dataset
  const orderedQuestions = shuffle(Object.values(datasetGroups)).flat();

  return NextResponse.json({
    questions: orderedQuestions,
    sessionId: `qr-${Date.now()}`,
  });
}
