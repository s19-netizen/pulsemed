import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getScaledScore, getSJTBand } from "@/lib/diagnosticData";

export const maxDuration = 45;

const MAX_RAW: Record<string, number> = { vr: 20, dm: 24, qr: 18, sjt: 70 };
const SECTION_LABELS: Record<string, string> = {
  vr: "Verbal Reasoning",
  dm: "Decision Making",
  qr: "Quantitative Reasoning",
  sjt: "Situational Judgement",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session ? ((session.user as any).id ?? session.user?.email ?? "") : null;

  const { section, correct, total, avgMs, sessionId } = await req.json();
  if (!section || total == null || correct == null) {
    return NextResponse.json({ ok: false, error: "Missing params" });
  }

  // ── Predicted score ────────────────────────────────────────────────────────
  const accuracy = total > 0 ? correct / total : 0;
  let predictedScore: number | null = null;
  let sjtBand: number | null = null;

  if (section === "sjt") {
    const predictedPts = Math.round(accuracy * 70);
    sjtBand = getSJTBand(predictedPts);
  } else if (section in MAX_RAW) {
    const predictedRaw = Math.round(accuracy * MAX_RAW[section]);
    predictedScore = getScaledScore(section as "vr" | "dm" | "qr", predictedRaw);
  }

  // ── Per-topic breakdown from question_responses ───────────────────────────
  let tagBreakdown = "";
  if (sessionId && userId) {
    const { data: responses } = await supabase
      .from("question_responses")
      .select("question_tag, is_correct")
      .eq("session_id", sessionId)
      .eq("user_id", userId);

    if (responses?.length) {
      const stats: Record<string, { c: number; t: number }> = {};
      for (const r of responses) {
        const topic = (r.question_tag ?? "unknown").split("-").slice(1).join(" ").replace(/-/g, " ");
        if (!stats[topic]) stats[topic] = { c: 0, t: 0 };
        stats[topic].t++;
        if (r.is_correct) stats[topic].c++;
      }
      tagBreakdown = Object.entries(stats)
        .map(([t, s]) => `  ${t}: ${s.c}/${s.t}`)
        .join("\n");
    }
  }

  // ── Groq insights ─────────────────────────────────────────────────────────
  let insights = "";
  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey) {
    const pct = Math.round(accuracy * 100);
    const sectionLabel = SECTION_LABELS[section] ?? section.toUpperCase();
    const scoreStr = section === "sjt" ? `Band ${sjtBand}` : `${predictedScore}/900`;
    const targetTime: Record<string, number> = { vr: 32, dm: 61, qr: 39, sjt: 23 };
    const avgSec = avgMs > 0 ? Math.round(avgMs / 1000) : null;
    const paceNote = avgSec
      ? `Average time per question: ${avgSec}s (target: ${targetTime[section] ?? 40}s)`
      : "";

    const context = [
      `Section: ${sectionLabel}`,
      `Result: ${correct}/${total} correct (${pct}%)`,
      `Predicted score: ${scoreStr}`,
      paceNote,
      tagBreakdown ? `Topic breakdown:\n${tagBreakdown}` : "",
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqApiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a UCAT preparation coach writing a post-practice session report. Be specific, honest, and encouraging. Reference exact mark counts and topic names. Never be generic. Keep it tight — under 140 words.",
            },
            {
              role: "user",
              content: `Practice session data:\n${context}\n\nWrite a report using EXACTLY this format:\n\n**[One honest sentence naming their score and what it means]**\n\nWhat went well:\n• [specific positive — name the topic if available, or "Clean start — every session builds the baseline" if 0%]\n\nWhere to focus:\n• [most important weak area — name topic and explain briefly]\n• [second weak area if different topic, else omit]\n\n**Next step:** [one concrete action]`,
            },
          ],
          temperature: 0.6,
          max_tokens: 280,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        insights = d.choices?.[0]?.message?.content?.trim() ?? "";
      } else {
        console.error("Groq practice error:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Groq practice failed:", err);
    }
  }

  // ── Save session ──────────────────────────────────────────────────────────
  if (userId) {
    const { error } = await supabase.from("practice_sessions").insert({
      user_id: userId,
      section,
      correct,
      total,
      predicted_score: predictedScore,
      sjt_band: sjtBand,
      ai_insights: insights,
    });
    if (error) console.error("practice_sessions insert:", error.message);
  }

  return NextResponse.json({ ok: true, predictedScore, sjtBand, insights });
}
