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

const QMAP: Record<string, string> = { q1: "Q1", q2: "Q2", q3: "Q3" };
const QLABELS: Record<string, string> = {
  q1: "Why do you want to study this course?",
  q2: "How have your qualifications and studies prepared you?",
  q3: "What else have you done to prepare, and why will it help?",
};

// ── Diversity: random angle injected per call ─────────────────────────────────
const FEEDBACK_ANGLES = [
  `Your primary lens this call: find the sentence where an admissions tutor who has read 200 statements today would stop caring — identify the psychological reason their attention drifts at that exact point.`,
  `Your primary lens this call: find the claim the student makes that has zero evidence behind it. A claim without a moment, patient, experiment, or conversation is invisible to a reader. Name the claim, name the missing evidence.`,
  `Your primary lens this call: find the person, patient, or moment that is conspicuously absent. The student has told us what they did or thought — but who was actually there? What did they see or hear that changed something? That missing detail is the whole story.`,
  `Your primary lens this call: find where the student describes an experience but does not appear to feel anything about it. Emotion is not sentimentality — it is the reader's proof that the event actually happened to a human being.`,
  `Your primary lens this call: find the sentence that could have been written by any of the 50,000 other UCAS medicine applicants this year. That sentence is the threat. Everything else is secondary.`,
  `Your primary lens this call: find the gap between what the student did and what they actually learned. Listing an experience is not reflection. Ask: what specifically changed in how they think or see, because of that experience?`,
];

const SUGGEST_ANGLES = [
  `Your primary lens: find the phrase that sounds like it came from a personal statement template — the kind of sentence a student writes when they do not yet know what specific memory to put there instead.`,
  `Your primary lens: find the place where the student gestures at an experience without entering it. A rewrite should take the reader inside the room, the ward, the lab, the conversation — make it visually specific.`,
  `Your primary lens: find the claim that is asserted but not earned. A strong rewrite replaces the assertion with the evidence that earns it.`,
  `Your primary lens: find the sentence where the student's voice disappears and a generic "medicine applicant voice" takes over. The rewrite should sound unmistakably like one person.`,
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

  const taxonomyBlock = taxonomy.map(t =>
    `• ${t.label}: ${t.definition} → ${t.behaviour}`
  ).join("\n");

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

  return `You are a brutally honest UCAS medicine admissions coach. You have read over a thousand personal statements. You do not pad feedback. You do not repeat yourself. You never rewrite the student's text.

ANGLE FOR THIS SESSION:
${angle}

ISSUE LABELS (use internally to identify what is wrong — never quote these labels to the student):
${taxonomyBlock}

WEAK→STRONG EXAMPLES (${q}) — calibrate your standards here:
${pairsBlock}

BORDERLINE CALIBRATION:
${casesBlock}

QUALITY SCALE:
${laddersBlock}

RULES — follow every one or your response is invalid:
1. Never rewrite the student's text — coaching questions only
2. Quote the exact phrase from their writing when you identify a problem
3. For each issue, ask one coaching question that forces them to recall a specific moment, person, or realisation — not a generic "reflect more"
4. If something is genuinely strong, say so in one clause and move on — do not praise generically
5. Max 220 words. Plain English. No bullet padding. No numbered lists.
6. FORBIDDEN — you may not use any of these words or phrases: specific, specificity, reflect, reflection, elaborate, expand, show don't tell, more detail, dig deeper, develop, explore, demonstrate, convey, ensure, consider, showcase, highlight. Find other words.
7. Do not start your response with "Your", "This", "While", "Overall", "The", or "I notice". Find a different opening every time.
8. One dominant insight beats four surface observations. Lead with what matters most.`;
}

function buildSuggestPrompt(question: string): string {
  const { taxonomyBlock, pairsBlock, laddersBlock, q } = bankContext(question);
  const angle = pickAngle(SUGGEST_ANGLES);

  return `You are a UCAS medicine personal statement editor who has seen every cliché in existence. Your job is to show the student what their weakest phrases could look like rewritten — so they understand the direction to aim for, not a final answer to copy.

ANGLE FOR THIS SESSION:
${angle}

ISSUE LABELS (use internally to identify weakness — do not quote label names to the student):
${taxonomyBlock}

STRONG EXAMPLE WRITING (${q}) — your quality benchmark:
${pairsBlock}

HIGH-QUALITY EXAMPLES (${q}):
${laddersBlock}

YOUR FORMAT — respond with exactly this structure for 2–4 weak phrases:

ORIGINAL: [quote the exact weak phrase from the student]
ISSUE: [one punchy label — e.g. "Claim without evidence" or "Could be anyone's statement"]
SUGGESTED: [a rewritten version that is visually specific, anchored in a real moment, unmistakably personal]
WHY STRONGER: [one sentence — what does the rewrite do that the original cannot?]

RULES — follow every one or your response is invalid:
1. Only rewrite genuinely weak phrases — leave strong writing alone
2. Each suggestion must stay in the student's voice and topic
3. The suggested version must be shockingly more specific than the original — if a reader could have written it without having lived the experience, it is not good enough
4. FORBIDDEN in your suggested rewrites: "I have always", "Throughout my", "This experience taught me", "I realised that", "my passion for", "ever since", "I knew I wanted". These are the phrases you are replacing.
5. FORBIDDEN in your commentary: specific, reflect, elaborate, expand, show don't tell, more detail, develop, explore, ensure, consider, showcase, highlight
6. Max 4 suggestions. Be concise. The student should feel the difference immediately.`;
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

${mode === "suggest" ? "Identify the weakest phrases and show suggested rewrites." : "Give focused coaching feedback."}`;

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
      temperature: mode === "suggest" ? 0.45 : 0.4,
      max_tokens:  600,
    }),
  });

  if (!res.ok) {
    console.error("Groq error:", await res.text());
    return NextResponse.json({ error: "AI unavailable right now — try again." }, { status: 502 });
  }

  const data = await res.json();
  const feedback = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ feedback });
}
