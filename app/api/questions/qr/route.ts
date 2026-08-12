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

  // How many datasets to pull (each has 4 questions)
  const datasetCount = Math.ceil(totalCount / 4);

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

  // Fetch dataset text
  const { data: dsRows } = await supabase
    .from("qr_datasets")
    .select("id, title, figure_brief, scenario")
    .in("id", chosenDatasets);

  const dsMap: Record<string, { title: string; figure_brief: string; scenario: string }> = {};
  for (const ds of dsRows ?? []) {
    dsMap[ds.id] = { title: ds.title, figure_brief: ds.figure_brief, scenario: ds.scenario };
  }

  // Fetch questions for chosen datasets, filtered to requested difficulties
  const { data: qRows } = await supabase
    .from("qr_questions")
    .select("*")
    .in("dataset_id", chosenDatasets)
    .in("difficulty", difficulties)
    .order("id");

  const sessionQuestions: unknown[] = [];

  for (const q of qRows ?? []) {
    const ds = dsMap[q.dataset_id];
    const options = [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(Boolean);
    const context = ds
      ? (ds.figure_brief ? `[${ds.figure_brief}]\n\n${ds.scenario}` : ds.scenario)
      : "";

    sessionQuestions.push({
      id: q.id,
      tag: `qr-${q.topic?.toLowerCase().replace(/\s+/g, "-") ?? "general"}`,
      contextLabel: ds?.title ?? "Data set",
      context,
      question: q.question,
      options,
      correct: correctIndex(q.correct_answer),
      explanation: q.walkthrough ?? "",
      difficulty: q.difficulty,
      suggestedTimeSec: q.time_sec ?? 45,
    });
  }

  return NextResponse.json({
    questions: shuffle(sessionQuestions),
    sessionId: `qr-${Date.now()}`,
  });
}
