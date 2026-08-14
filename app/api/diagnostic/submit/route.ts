import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const maxDuration = 60;
import { supabase } from "@/lib/supabase";
import {
  DIAGNOSTIC_QUESTIONS,
  scoreSJTItem, scoreMultiStatement, getSJTBand, getScaledScore,
  COGNITIVE_CLASSIFICATIONS,
  type DiagQuestion,
} from "@/lib/diagnosticData";

type Answers = Record<string, number>;
type MultiAnswers = Record<string, boolean[]>;
type MostLeastAnswers = Record<string, { most: number | null; least: number | null }>;

interface SubtypeScore {
  correct: number;
  total: number;
  rawPts: number;
  maxPts: number;
  label: string;
  section: string;
}

function scoreQuestion(
  q: DiagQuestion,
  answers: Answers,
  multiAnswers: MultiAnswers,
  mostLeastAnswers: MostLeastAnswers
): { raw: number; max: number; isCorrect: boolean } {
  // Multi-statement DM (0/1/2 marks)
  if (q.format === "multi") {
    const sel = multiAnswers[q.id];
    const raw = scoreMultiStatement(q, sel);
    return { raw, max: 2, isCorrect: raw === 2 };
  }

  // SJT Most/Least (0/1/2 marks)
  if (q.format === "mostleast") {
    const ml = mostLeastAnswers[q.id];
    const raw = scoreSJTItem(q, undefined, ml ?? undefined);
    return { raw, max: 2, isCorrect: raw === 2 };
  }

  // SJT Appropriateness / Importance (0/1/2 marks via distance)
  if (q.format === "approp" || q.format === "import") {
    const sel = answers[q.id];
    const raw = scoreSJTItem(q, sel, undefined);
    return { raw, max: 2, isCorrect: raw === 2 };
  }

  // MCQ / TFCT (0/1 mark)
  const sel = answers[q.id];
  const isCorrect = sel !== undefined && sel === q.correct;
  return { raw: isCorrect ? 1 : 0, max: 1, isCorrect };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // auth.ts stores user.email as the userId — simple and reliable across Google OAuth
  const userId: string = (session.user as any).id ?? session.user?.email ?? "";
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Could not identify your account." }, { status: 400 });
  }

  const body = await req.json();
  const answers: Answers = body.answers ?? {};
  const multiAnswers: MultiAnswers = body.multiAnswers ?? {};
  const mostLeastAnswers: MostLeastAnswers = body.mostLeastAnswers ?? {};

  // ── Score every question ───────────────────────────────────────────────────

  let vrRaw = 0, dmRaw = 0, qrRaw = 0, sjtRaw = 0;
  let criticalErrors = 0;
  const subtypeScores: Record<string, SubtypeScore> = {};

  for (const q of DIAGNOSTIC_QUESTIONS) {
    const { raw, max, isCorrect } = scoreQuestion(q, answers, multiAnswers, mostLeastAnswers);

    // Section raw accumulation
    if (q.section === "vr") vrRaw += raw;
    if (q.section === "dm") dmRaw += raw;
    if (q.section === "qr") qrRaw += raw;
    if (q.section === "sjt") sjtRaw += raw;

    // Critical-safety tracking (SJT only — 0/2 on a critical item = error)
    if (q.critical_safety && q.section === "sjt" && raw === 0) {
      criticalErrors++;
    }

    // Subtype breakdown
    const key = `${q.section}-${q.subtype}`;
    if (!subtypeScores[key]) {
      subtypeScores[key] = { correct: 0, total: 0, rawPts: 0, maxPts: 0, label: q.subtype, section: q.section };
    }
    subtypeScores[key].total++;
    subtypeScores[key].rawPts += raw;
    subtypeScores[key].maxPts += max;
    if (isCorrect) subtypeScores[key].correct++;
  }

  // ── Scaled scores ──────────────────────────────────────────────────────────

  const vrScore  = getScaledScore("vr",  vrRaw);
  const dmScore  = getScaledScore("dm",  dmRaw);
  const qrScore  = getScaledScore("qr",  qrRaw);
  const totalScore = vrScore + dmScore + qrScore;

  // ── SJT Band ───────────────────────────────────────────────────────────────

  const sjtRawBand = getSJTBand(sjtRaw);

  // Critical-safety cap: 0 errors → Band 1 max, 1 → Band 2 max, 2 → Band 3 max, 3+ → Band 4
  const sjtCap: 1 | 2 | 3 | 4 = criticalErrors === 0 ? 1 : criticalErrors === 1 ? 2 : criticalErrors === 2 ? 3 : 4;
  const sjtBandValue = Math.max(sjtRawBand, sjtCap) as 1 | 2 | 3 | 4;

  // Cognitive classification
  const classLabel = COGNITIVE_CLASSIFICATIONS.find(c => totalScore >= c.min)?.label ?? "Priority development";

  // ── Build Groq context ────────────────────────────────────────────────────

  // Per-subtype breakdown sorted by section then performance
  const subtypeLines = Object.entries(subtypeScores)
    .sort((a, b) => a[1].section.localeCompare(b[1].section) || (a[1].rawPts / a[1].maxPts) - (b[1].rawPts / b[1].maxPts))
    .map(([, v]) => {
      const pct = v.maxPts > 0 ? Math.round((v.rawPts / v.maxPts) * 100) : 0;
      return `  ${v.section.toUpperCase()} – ${v.label}: ${v.rawPts}/${v.maxPts} marks (${pct}%)`;
    })
    .join("\n");

  const scoreContext = [
    `VR: ${vrScore}/900 (raw ${vrRaw}/20 marks)`,
    `DM: ${dmScore}/900 (raw ${dmRaw}/24 marks)`,
    `QR: ${qrScore}/900 (raw ${qrRaw}/18 marks)`,
    `Cognitive total: ${totalScore}/2700 — ${classLabel}`,
    `SJT: ${sjtRaw}/70 points → Band ${sjtBandValue}${criticalErrors > 0 ? ` (${criticalErrors} critical safety error(s) — band capped)` : ""}`,
    `\nSubtype breakdown:\n${subtypeLines}`,
  ].join("\n");

  // ── AI analysis (Groq) ────────────────────────────────────────────────────

  let groqAnalysis = "";
  let groqStudyPlan = "";

  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey) {
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqApiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a UCAT preparation expert. Respond with ONLY valid JSON using this exact structure:
{"sections":{"vr":{"verdict":"string","strong":[{"subtype":"string","score":"X/Y"}],"weak":[{"subtype":"string","score":"X/Y","missedMarks":N}]},"dm":{"verdict":"string","strong":[...],"weak":[...]},"qr":{"verdict":"string","strong":[...],"weak":[...]},"sjt":{"verdict":"string","band":N}},"overallVerdict":"string","weeks":[{"title":"string","focus":"string","tasks":["string","string","string"]}]}
Rules: verdict = 1–2 warm honest sentences referencing exact marks. strong = subtypes scoring 70%+. weak = subtypes below 50%, missedMarks must be an integer. weeks = exactly 4. tasks = exactly 3 strings per week. Always use the student's actual subtype names and mark counts from the data.`,
            },
            {
              role: "user",
              content: `A student just completed their UCAT diagnostic. Here are their full results:\n\n${scoreContext}\n\nGenerate personalised section verdicts with strong/weak subtypes, an overall verdict, and a 4-week study plan targeting their weakest areas.`,
            },
          ],
          temperature: 0.6,
          max_tokens: 1400,
        }),
      });

      if (!groqRes.ok) {
        console.error("Groq API error:", groqRes.status, await groqRes.text());
      } else {
        const groqData = await groqRes.json();
        const rawContent: string = groqData.choices?.[0]?.message?.content ?? "";
        try {
          const parsed = JSON.parse(rawContent);
          if (parsed.sections && Array.isArray(parsed.weeks)) {
            groqAnalysis = JSON.stringify({ sections: parsed.sections, overallVerdict: parsed.overallVerdict ?? "" });
            groqStudyPlan = JSON.stringify(parsed.weeks);
          }
        } catch {
          console.error("Groq returned non-JSON:", rawContent.slice(0, 300));
          groqAnalysis = rawContent;
        }
      }
    } catch (err) {
      console.error("Groq fetch failed:", err);
    }
  } else {
    console.warn("GROQ_API_KEY not set — skipping AI analysis");
  }

  if (!groqAnalysis) {
    groqAnalysis = `Your diagnostic is complete. VR: ${vrScore}/900 · DM: ${dmScore}/900 · QR: ${qrScore}/900 · Total: ${totalScore}/2700 (${classLabel}) · SJT: Band ${sjtBandValue}. Full AI analysis will appear here — please reload in a moment.`;
  }

  // ── Save per-question responses ────────────────────────────────────────────

  const sessionId = `diagnostic-${userId}-${Date.now()}`;

  const responseRows = DIAGNOSTIC_QUESTIONS.map((q, idx) => {
    const { raw } = scoreQuestion(q, answers, multiAnswers, mostLeastAnswers);
    const selectedRaw =
      q.format === "multi"
        ? JSON.stringify(multiAnswers[q.id] ?? null)
        : q.format === "mostleast"
        ? JSON.stringify(mostLeastAnswers[q.id] ?? null)
        : String(answers[q.id] ?? -1);
    const correctRaw =
      q.format === "multi"
        ? JSON.stringify(q.correctStatements)
        : q.format === "mostleast"
        ? JSON.stringify({ most: q.correctMost, least: q.correctLeast })
        : String(q.correct ?? "");

    return {
      user_id: userId,
      session_id: sessionId,
      session_type: "diagnostic",
      question_index: idx,
      question_tag: `${q.section}-${q.subtype.toLowerCase().replace(/\s+/g, "-")}`,
      is_correct: raw > 0,
      time_taken_ms: null,
      selected_answer: selectedRaw,
      correct_answer: correctRaw,
    };
  });

  if (responseRows.length > 0) {
    const { error: responsesError } = await supabase.from("question_responses").insert(responseRows);
    if (responsesError) console.error("Failed to save question responses:", responsesError.message);
  }

  // ── Save diagnostic report ─────────────────────────────────────────────────

  const { data: report, error: reportError } = await supabase
    .from("diagnostic_reports")
    .upsert(
      {
        user_id: userId,
        vr_score: vrScore,
        dm_score: dmScore,
        qr_score: qrScore,
        total_score: totalScore,
        sjt_band: sjtBandValue,
        subtype_scores: subtypeScores,
        groq_analysis: groqAnalysis,
        groq_study_plan: groqStudyPlan,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (reportError) {
    return NextResponse.json({
      ok: false,
      error: reportError.message,
      scores: { vrScore, dmScore, qrScore, totalScore, sjtBandValue, subtypeScores, groqAnalysis, groqStudyPlan },
    });
  }

  return NextResponse.json({ ok: true, reportId: report.id });
}
