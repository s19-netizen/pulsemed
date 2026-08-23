import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { shuffle } from "@/lib/utils";

// GET /api/questions/sjt?format=appropriateness&theme=any&difficulty=Gold,Diamond&count=10
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const fmt = sp.get("format") ?? "appropriateness";           // appropriateness | importance | most-least
  const theme = sp.get("theme") ?? "any";                      // any | patient-safety | honesty | confidentiality | teamwork
  const rawDifficulties = sp.get("difficulty") ?? "Gold";
  const difficulties = rawDifficulties.split(",").map(d => d.trim()).filter(Boolean);
  const count = Math.max(1, Number(sp.get("count")) || 10);

  let query = supabase
    .from("sjt_questions")
    .select("*")
    .eq("format", fmt)
    .in("difficulty", difficulties);

  if (theme !== "any") {
    const THEME_MAP: Record<string, string> = {
      "patient-safety": "Safety",
      "honesty":        "Honesty",
      "confidentiality": "Confidential",
      "teamwork":       "Teamwork",
    };
    const keyword = THEME_MAP[theme];
    if (keyword) {
      query = query.ilike("professional_theme", `%${keyword}%`);
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pool = shuffle(data ?? []).slice(0, count);

  const questions = pool.map(q => {
    if (q.format === "most-least") {
      const mostMatch  = q.correct_answer.match(/most:(\d)/);
      const leastMatch = q.correct_answer.match(/least:(\d)/);
      return {
        id: q.id,
        format: q.format,
        scenario: q.scenario,
        professionalTheme: q.professional_theme,
        difficulty: q.difficulty,
        question: q.question,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        mostCor:  mostMatch  ? Number(mostMatch[1])  : 0,
        leastCor: leastMatch ? Number(leastMatch[1]) : 2,
        walkthrough: q.walkthrough,
      };
    }

    // appropriateness / importance
    const OPTIONS_AR = [
      "A very appropriate thing to do",
      "Appropriate, but not ideal",
      "Inappropriate, but not awful",
      "A very inappropriate thing to do",
    ];
    const OPTIONS_IR = [
      "Very important",
      "Important",
      "Of minor importance",
      "Not important at all",
    ];
    const opts = q.format === "importance" ? OPTIONS_IR : OPTIONS_AR;
    const correctIdx = opts.findIndex(o => o.toLowerCase() === q.correct_answer.toLowerCase());

    return {
      id: q.id,
      format: q.format,
      scenario: q.scenario,
      professionalTheme: q.professional_theme,
      difficulty: q.difficulty,
      question: q.question,
      options: opts,
      correct: correctIdx >= 0 ? correctIdx : 0,
      walkthrough: q.walkthrough,
    };
  });

  return NextResponse.json({ questions, sessionId: `sjt-${Date.now()}` });
}
