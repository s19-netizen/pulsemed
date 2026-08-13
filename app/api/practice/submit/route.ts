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

  // ── Fetch baseline and recent history for context ─────────────────────────
  let baselineContext = "";
  let trendContext = "";
  if (userId) {
    const [{ data: diagReport }, { data: recentSessions }] = await Promise.all([
      supabase.from("diagnostic_reports")
        .select("vr_score,dm_score,qr_score,sjt_band,total_score")
        .eq("user_id", userId)
        .single(),
      supabase.from("practice_sessions")
        .select("correct,total,predicted_score,sjt_band,created_at")
        .eq("user_id", userId)
        .eq("section", section)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (diagReport) {
      baselineContext = section === "sjt"
        ? `Diagnostic baseline: SJT Band ${diagReport.sjt_band}`
        : `Diagnostic baseline: ${section.toUpperCase()} ${diagReport[`${section}_score` as "vr_score" | "dm_score" | "qr_score"]}/900 (total cognitive ${diagReport.total_score}/2700)`;
    }

    if (recentSessions?.length) {
      const history = [...recentSessions].reverse().map(s => {
        const p = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
        return `${p}%`;
      }).join(" → ");
      trendContext = `Recent ${section.toUpperCase()} sessions (oldest→newest): ${history} → this session: ${Math.round(accuracy * 100)}%`;
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
      ? `Avg time per question: ${avgSec}s (target: ${targetTime[section] ?? 40}s)`
      : "";

    const context = [
      `Section: ${sectionLabel}`,
      `This session: ${correct}/${total} correct (${pct}%)`,
      `Predicted score: ${scoreStr}`,
      paceNote,
      baselineContext,
      trendContext,
      tagBreakdown ? `Topic breakdown:\n${tagBreakdown}` : "",
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqApiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a UCAT preparation coach. Respond with ONLY valid JSON using this exact structure:
{"verdict":"string","trend":"improving|declining|steady|first","strong":[{"topic":"string","score":"X/Y"}],"weak":[{"topic":"string","score":"X/Y","tip":"string"}]}
Rules: verdict = 1 honest sentence about this session score and what it means. trend = compare to recent sessions ("first" if no history, "improving"/"declining"/"steady" otherwise). strong = max 2, topics above 65%. weak = max 2, topics below 60%, tip = 1 sentence specific action. Reference exact mark counts and topic names.`,
            },
            {
              role: "user",
              content: `Practice session data:\n${context}`,
            },
          ],
          temperature: 0.6,
          max_tokens: 400,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        const rawContent = d.choices?.[0]?.message?.content?.trim() ?? "";
        try {
          const parsed = JSON.parse(rawContent);
          if (parsed?.verdict) insights = rawContent;
        } catch {
          insights = rawContent;
        }
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
