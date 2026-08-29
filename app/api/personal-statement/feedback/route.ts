import { NextRequest, NextResponse } from "next/server";
import bank from "@/lib/data/ps-bank.json";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "openai/gpt-oss-120b";

type Pair     = { question: string; topic: string; weak: { extract: string; label: string; ideal_comment: string }; strong: { extract: string } };
type Case     = { question: string; text: string; should_comment: boolean; ideal_comment: string; gold_label: string };
type Ladder   = { question: string; rating: number; band: string; extract: string };
type TaxItem  = { label: string; definition: string; behaviour: string; example: string };

const pairs:      Pair[]    = bank.pairs      as Pair[];
const borderline: Case[]    = bank.borderline as Case[];
const ladders:    Ladder[]  = bank.ladders    as Ladder[];
const taxonomy:   TaxItem[] = bank.taxonomy   as TaxItem[];

const QMAP: Record<string, string>   = { q1: "Q1", q2: "Q2", q3: "Q3" };
const QLABELS: Record<string, string> = {
  q1: "Why do you want to study this course?",
  q2: "How have your qualifications and studies prepared you?",
  q3: "What else have you done to prepare, and why will it help?",
};

const FEEDBACK_ANGLES = [
  `Your primary lens: find the exact sentence where an admissions tutor who has read 200 statements today would stop caring — explain the psychological reason their attention drifts at that point.`,
  `Your primary lens: find the claim the student makes with zero evidence behind it. A claim without a moment, patient, experiment, or conversation is invisible to a reader. Name the claim and the missing evidence.`,
  `Your primary lens: find the person, patient, or moment that is conspicuously absent. The student has told us what they did — but who was actually there? What did they see or hear that changed something?`,
  `Your primary lens: find where the student describes an experience but appears to feel nothing about it. Emotion is not sentimentality — it is the reader's proof that the event actually happened to a human being.`,
  `Your primary lens: find the sentence any of the 50,000 other UCAS medicine applicants this year could have written. That sentence is the threat. Everything else is secondary.`,
  `Your primary lens: find the gap between what the student did and what they actually learned. Listing an experience is not reflection. Ask: what changed in how they think or see, because of that exact experience?`,
];

const SUGGEST_ANGLES = [
  `Your primary lens: find the phrase that sounds like it came from a template — the kind a student writes when they do not yet know what specific memory to put there instead.`,
  `Your primary lens: find the place where the student gestures at an experience without entering it. A rewrite should take the reader inside the room, the ward, the lab, the conversation.`,
  `Your primary lens: find the claim that is asserted but not earned. A strong rewrite replaces the assertion with the evidence that earns it.`,
  `Your primary lens: find the sentence where the student's voice disappears and a generic "medicine applicant" voice takes over. The rewrite should sound unmistakably like one person.`,
  `Your primary lens: find the reflection that tells the reader what the student concluded rather than showing the moment of realisation. Rewrite to show the turn — the before and the after.`,
];

function sample<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function pickAngle(angles: string[]): string {
  return angles[Math.floor(Math.random() * angles.length)];
}

function bankContext(question: string) {
  const q = QMAP[question] ?? "Q1";
  const taxonomyBlock = taxonomy.map(t => `• ${t.label}: ${t.definition} → ${t.behaviour}`).join("\n");
  const qPairs = pairs.filter(p => p.question === q);
  const pairsBlock = sample(qPairs, 5).map(p =>
    `WEAK (${p.weak.label}): "${p.weak.extract}"\nSTRONG: "${p.strong.extract}"\nCOMMENT: "${p.weak.ideal_comment}"`
  ).join("\n---\n");
  const qCases = borderline.filter(c => c.question === q);
  const casesBlock = [
    ...sample(qCases.filter(c => c.should_comment), 2),
    ...sample(qCases.filter(c => !c.should_comment), 2),
  ].map(c =>
    `TEXT: "${c.text}"\nSHOULD COMMENT: ${c.should_comment ? "YES" : "NO"}\nIDEAL: "${c.ideal_comment}"`
  ).join("\n---\n");
  const qLadders = ladders.filter(l => l.question === q);
  const laddersBlock = [
    ...sample(qLadders.filter(l => l.rating <= 3), 1),
    ...sample(qLadders.filter(l => l.rating >= 5 && l.rating <= 6), 1),
    ...sample(qLadders.filter(l => l.rating >= 8), 1),
  ].map(l => `Rating ${l.rating}/10: "${l.extract}"`).join("\n---\n");
  return { taxonomyBlock, pairsBlock, casesBlock, laddersBlock, q };
}

function buildFeedbackPrompt(question: string): string {
  const { taxonomyBlock, pairsBlock, casesBlock, laddersBlock, q } = bankContext(question);
  const angle = pickAngle(FEEDBACK_ANGLES);

  return `You are a brutally honest UCAS medicine admissions coach. You have read over a thousand personal statements. You do not pad feedback. You never rewrite the student's text.

ANGLE FOR THIS SESSION:
${angle}

ISSUE LABELS (use internally — never quote these label names verbatim in output):
${taxonomyBlock}

WEAK→STRONG EXAMPLES (${q}) — calibrate your quality bar here:
${pairsBlock}

BORDERLINE CALIBRATION:
${casesBlock}

QUALITY SCALE:
${laddersBlock}

RULES for annotation comments:
1. Never rewrite the student's text — coaching questions only
2. phrase field must be copied verbatim from the student's text (exact characters, no paraphrasing)
3. Each comment asks one question that forces recall of a specific moment, person, or realisation
4. If something is genuinely strong, severity = "note" and say so in one clause
5. FORBIDDEN words — never use in comment text: specific, specificity, reflect, reflection, elaborate, expand, "show don't tell", "more detail", "dig deeper", develop, explore, demonstrate, convey, ensure, consider, showcase, highlight
6. Do not start any comment with: Your, This, While, Overall, The, I notice
7. One sharp insight per annotation. Max 35 words per comment.

OUTPUT — return valid JSON only. No markdown fences. No text outside the JSON object:
{
  "score": <integer 1–10>,
  "band": <"Needs work" | "Developing" | "Good" | "Strong" | "Outstanding">,
  "summary": <one punchy sentence — the single most important overall observation, max 20 words>,
  "annotations": [
    {
      "phrase": <exact verbatim phrase copied from the student's text — must appear word-for-word in their writing>,
      "issue": <punchy label max 5 words e.g. "Claim without evidence" or "Could be anyone's line">,
      "comment": <coaching observation + one question, max 35 words>,
      "severity": <"high" | "medium" | "note">
    }
  ]
}

Return 2–4 annotations. severity: "high" = significant weakness, "medium" = moderate issue, "note" = positive strength worth naming. Score overall quality against the 1–10 examples above.`;
}

function buildSuggestPrompt(question: string): string {
  const { taxonomyBlock, pairsBlock, laddersBlock, q } = bankContext(question);
  const angle = pickAngle(SUGGEST_ANGLES);
  return `You are a UCAS medicine personal statement editor who has seen every cliché in existence. Your job is to show the student what their weakest phrases could look like rewritten — so they understand the direction to aim for, not a final answer to copy.

ANGLE FOR THIS SESSION:
${angle}

ISSUE LABELS (use internally — do not quote label names to the student):
${taxonomyBlock}

STRONG EXAMPLE WRITING (${q}) — your quality benchmark:
${pairsBlock}

HIGH-QUALITY EXAMPLES (${q}):
${laddersBlock}

RULES:
1. Only rewrite genuinely weak phrases — leave strong writing alone
2. Each phrase must be copied verbatim from the student's text (exact characters, no paraphrasing)
3. The suggested version must be shockingly more specific — if a reader could have written it without having lived the experience, it is not good enough
4. FORBIDDEN in suggested rewrites: "I have always", "Throughout my", "This experience taught me", "I realised that", "my passion for", "ever since", "I knew I wanted"
5. FORBIDDEN in whyStronger: specific, reflect, elaborate, expand, "show don't tell", "more detail", develop, explore, ensure, consider, showcase, highlight
6. Max 4 suggestions.

OUTPUT — return valid JSON only. No markdown fences. No text outside the JSON object:
{
  "suggestions": [
    {
      "phrase": <exact verbatim phrase copied from the student's text — must appear word-for-word in their writing>,
      "issue": <punchy label max 5 words — e.g. "Generic claim" or "No evidence behind this">,
      "suggested": <rewritten version that is specific, evidenced, and unmistakably personal>,
      "whyStronger": <one sentence — what does the rewrite do that the original cannot?>
    }
  ]
}

Return 2–4 suggestions. Each phrase must be copied exactly from the student's writing.`;
}

export async function POST(req: NextRequest) {
  const { question, text, mode = "feedback" } = await req.json();

  if (!text?.trim() || text.trim().length < 30) {
    return NextResponse.json({ error: "Write at least a sentence before requesting feedback." }, { status: 400 });
  }

  const systemPrompt = mode === "suggest"
    ? buildSuggestPrompt(question)
    : buildFeedbackPrompt(question);

  const userMessage = `UCAS ${QMAP[question] ?? "Q1"}: ${QLABELS[question] ?? ""}

Student's writing:
"""
${text.trim()}
"""

${mode === "suggest" ? "Identify the weakest phrases and show suggested rewrites." : "Analyse and return JSON feedback."}`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
      temperature: mode === "suggest" ? 0.45 : 0.35,
      max_tokens:  700,
    }),
  });

  if (!res.ok) {
    console.error("Groq error:", await res.text());
    return NextResponse.json({ error: "AI unavailable right now — try again." }, { status: 502 });
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content ?? "";

  // Both modes try JSON parse first; fall back to plain text
  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
    const parsed = JSON.parse(cleaned);
    if (mode === "feedback" && parsed && typeof parsed.score === "number" && Array.isArray(parsed.annotations)) {
      return NextResponse.json({ structured: parsed });
    }
    if (mode === "suggest" && parsed && Array.isArray(parsed.suggestions)) {
      return NextResponse.json({ structured: parsed });
    }
  } catch { /* fall through to plain text */ }
  return NextResponse.json({ feedback: rawText });

  return NextResponse.json({ feedback: rawText });
}
