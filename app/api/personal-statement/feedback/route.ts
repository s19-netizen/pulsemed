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

function sample<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
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
  return `You are a UCAS medicine personal statement coach. Give honest coaching feedback — never rewrite the student's text.

ISSUE LABELS (use internally):
${taxonomyBlock}

WEAK→STRONG EXAMPLES (${q}):
${pairsBlock}

BORDERLINE CALIBRATION:
${casesBlock}

QUALITY SCALE:
${laddersBlock}

RULES:
1. Never rewrite the student's text
2. Reference actual phrases from their writing
3. For each issue, ask a coaching question that pushes them to think deeper
4. If something is already strong, say so briefly and move on
5. Max 220 words. Plain English. No bullet padding.`;
}

function buildSuggestPrompt(question: string): string {
  const { taxonomyBlock, pairsBlock, laddersBlock, q } = bankContext(question);
  return `You are a UCAS medicine personal statement editor. Your job is to show the student what their weakest sentences could look like if rewritten at a higher level — so they understand the direction to aim for, not a final answer to copy.

ISSUE LABELS (to identify what is weak):
${taxonomyBlock}

STRONG EXAMPLE WRITING (${q}) — use these as your quality benchmark:
${pairsBlock}

HIGH-QUALITY EXAMPLES (${q}):
${laddersBlock}

YOUR FORMAT — respond with exactly this structure for 2–4 weak phrases:

ORIGINAL: [quote the exact weak phrase from the student]
ISSUE: [one-line label — e.g. "Generic — no specific experience"]
SUGGESTED: [a rewritten version that is more specific, reflective, and evidenced]
WHY STRONGER: [one sentence explaining what the rewrite does differently]

RULES:
1. Only suggest rewrites for genuinely weak sentences — leave strong writing alone
2. Each suggestion must stay in the student's voice and use their general topic/theme
3. Suggestions show a direction, not a final answer — they should adapt, not copy
4. Max 4 suggestions. Be concise.`;
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
      temperature: mode === "suggest" ? 0.3 : 0.25,
      max_tokens:  500,
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
