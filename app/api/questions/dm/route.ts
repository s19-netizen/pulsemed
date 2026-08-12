import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DM_BANK } from "@/lib/dm-questions";
import { shuffle } from "@/lib/utils";

// Standard MCQ question types (exclude Syllogisms, Inference, Venn Diagrams which need special rendering)
const MCQ_TYPES = new Set(["Strongest Arguments", "Probability", "Logical Puzzles"]);

// GET /api/questions/dm?difficulty=Silver,Gold&count=15
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const rawDifficulties = sp.get("difficulty") ?? "Gold";
  const difficulties = new Set(rawDifficulties.split(",").map(d => d.trim()).filter(Boolean));
  const count = Math.max(1, Number(sp.get("count")) || 15);

  const eligible = DM_BANK.filter(
    q => MCQ_TYPES.has(q.questionType) && difficulties.has(q.difficulty)
  );

  if (eligible.length === 0) {
    return NextResponse.json({ error: "No questions found for the selected difficulty." }, { status: 404 });
  }

  const questions = shuffle(eligible).slice(0, count).map(q => ({
    id: q.id,
    section: "dm" as const,
    tag: q.tag,
    contextLabel: q.contextLabel ?? "SCENARIO",
    context: q.context ?? "",
    question: q.question,
    options: q.options as string[],
    correct: q.correct as number,
    suggestedTimeSec: q.suggestedTimeSec ?? 63,
  }));

  return NextResponse.json({ questions, sessionId: `dm-${Date.now()}` });
}
