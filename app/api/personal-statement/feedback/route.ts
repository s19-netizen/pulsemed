import { NextRequest, NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const QUESTION_CONTEXT: Record<string, string> = {
  q1: "Why do you want to study this course? (UCAS Q1)",
  q2: "How have your qualifications and studies prepared you for this course? (UCAS Q2)",
  q3: "What else have you done to prepare for this course, and why will this help you in the future? (UCAS Q3)",
};

const SYSTEM_PROMPT = `You are a rigorous UCAS personal statement coach. Your job is to give honest, specific coaching feedback on a student's writing — not to rewrite it for them.

Rules you must follow:
- Never rewrite any part of the student's text
- Identify 2–4 specific issues with references to actual phrases or sentences from their text
- Ask coaching questions that prompt the student to think deeper ("What specifically changed in your understanding after this?")
- If a claim is made without evidence, point to the exact claim and ask for the moment that demonstrates it
- If description replaces reflection, name what's missing
- If something is already strong, say so briefly and move on
- Be direct, not encouraging for its own sake
- No bullet padding — only raise a point if it genuinely matters
- Write in plain English, max 200 words total

Common issues to watch for:
- Generic opening lines or clichés
- Description of what happened without saying what the student learned or how their thinking changed
- Claims ("I am resilient", "I am caring") with no evidence
- Name-dropping books or research without genuine engagement
- Overclaiming or self-congratulation
- Forced or vague links to medicine or the course
- Answering a different question than the one asked`;

export async function POST(req: NextRequest) {
  const { question, text } = await req.json();

  if (!text?.trim() || text.trim().length < 30) {
    return NextResponse.json({ error: "Write at least a sentence before requesting feedback." }, { status: 400 });
  }

  const qContext = QUESTION_CONTEXT[question] ?? QUESTION_CONTEXT.q1;

  const userMessage = `UCAS question: ${qContext}

Student's writing:
"""
${text.trim()}
"""

Give focused coaching feedback on this specific response. Be honest and direct.`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 350,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Groq error:", err);
    return NextResponse.json({ error: "AI feedback unavailable right now." }, { status: 502 });
  }

  const data = await res.json();
  const feedback = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ feedback });
}
