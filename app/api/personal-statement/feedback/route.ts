import { NextRequest, NextResponse } from "next/server";
import bank from "@/lib/data/ps-bank.json";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "openai/gpt-oss-120b";

type Pair = { question: string; topic: string; weak: { extract: string; label: string; ideal_comment: string }; strong: { extract: string } };
type Case = { question: string; text: string; should_comment: boolean; ideal_comment: string; gold_label: string };
type Ladder = { question: string; rating: number; band: string; extract: string; reflection: number; specificity: number };
type TaxItem = { label: string; definition: string; behaviour: string; example: string };

const pairs:     Pair[]    = bank.pairs     as Pair[];
const borderline: Case[]   = bank.borderline as Case[];
const ladders:   Ladder[]  = bank.ladders   as Ladder[];
const taxonomy:  TaxItem[] = bank.taxonomy  as TaxItem[];

const QMAP: Record<string, string> = {
  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
};

function sample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildSystemPrompt(question: string): string {
  const q = QMAP[question] ?? "Q1";

  // Taxonomy — all 24 labels, always included
  const taxonomyBlock = taxonomy.map(t =>
    `• ${t.label}: ${t.definition}\n  → Behaviour: ${t.behaviour}\n  → Example pattern: "${t.example}"`
  ).join("\n\n");

  // 5 annotated pairs for this question
  const qPairs = pairs.filter(p => p.question === q);
  const selectedPairs = sample(qPairs, 5);
  const pairsBlock = selectedPairs.map(p => `
TOPIC: ${p.topic}
WEAK (label: ${p.weak.label}):
"${p.weak.extract}"
→ Ideal comment: "${p.weak.ideal_comment}"

STRONG version of same topic:
"${p.strong.extract}"`
  ).join("\n\n---\n");

  // 4 borderline cases: 2 that need comment, 2 that don't
  const qCases = borderline.filter(c => c.question === q);
  const needsComment = sample(qCases.filter(c => c.should_comment), 2);
  const noComment    = sample(qCases.filter(c => !c.should_comment), 2);
  const casesBlock = [...needsComment, ...noComment].map(c => `
TEXT: "${c.text}"
SHOULD COMMENT: ${c.should_comment ? "YES" : "NO"}
IDEAL RESPONSE: "${c.ideal_comment}"`
  ).join("\n\n---\n");

  // 3 rating ladder extracts: one low (1-3), one mid (5-6), one high (8-10)
  const qLadders = ladders.filter(l => l.question === q);
  const low  = sample(qLadders.filter(l => l.rating <= 3), 1);
  const mid  = sample(qLadders.filter(l => l.rating >= 5 && l.rating <= 6), 1);
  const high = sample(qLadders.filter(l => l.rating >= 8), 1);
  const laddersBlock = [...low, ...mid, ...high].map(l => `
Rating ${l.rating}/10 (${l.band}):
"${l.extract}"`
  ).join("\n\n---\n");

  return `You are a UCAS personal statement coach specialising in medicine applications. You give honest, specific coaching feedback — you never rewrite the student's text.

══ ISSUE LABELS ══
These are the exact issues you may identify. Use these labels internally to guide your response:

${taxonomyBlock}

══ ANNOTATED EXAMPLES (${q}) ══
Study these weak extracts, their labels, and the ideal coaching comment:

${pairsBlock}

══ BORDERLINE CALIBRATION ══
These examples show when to comment and when to leave writing alone:

${casesBlock}

══ QUALITY CALIBRATION ══
These are real examples at different quality levels for ${q}:

${laddersBlock}

══ YOUR RULES ══
1. Never rewrite the student's text
2. Identify 2–4 specific issues — reference actual phrases from their writing
3. For each issue: name what is happening, then ask a coaching question that pushes them to think deeper
4. If something is already strong, say so in one sentence and move on
5. If the writing is too short to assess properly, say so
6. Max 220 words total. Plain English. No bullet padding.
7. Do NOT label your issues explicitly (don't write "GENERIC:" in your response) — just address them naturally`;
}

export async function POST(req: NextRequest) {
  const { question, text } = await req.json();

  if (!text?.trim() || text.trim().length < 30) {
    return NextResponse.json({ error: "Write at least a sentence before requesting feedback." }, { status: 400 });
  }

  const qLabel = { q1: "Why do you want to study this course?", q2: "How have your qualifications and studies prepared you?", q3: "What else have you done to prepare, and why will it help?" }[question as string] ?? "";

  const userMessage = `UCAS question: ${qLabel}

Student's writing:
"""
${text.trim()}
"""

Give focused coaching feedback on this response.`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(question) },
        { role: "user",   content: userMessage },
      ],
      temperature: 0.25,
      max_tokens:  420,
    }),
  });

  if (!res.ok) {
    console.error("Groq error:", await res.text());
    return NextResponse.json({ error: "AI feedback unavailable right now." }, { status: 502 });
  }

  const data = await res.json();
  const feedback = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ feedback });
}
