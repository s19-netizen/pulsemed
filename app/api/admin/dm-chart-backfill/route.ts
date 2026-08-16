import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "sawdaj19@gmail.com";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const EXTRACT_PROMPT = `You are a data extraction assistant for UCAT Decision Making questions.

Analyse the following stimulus text. If it contains structured data — such as a table of values, line graph data points, or bar chart data — extract it and return a JSON object. If it is just prose text with no numeric/tabular data to visualise, return null.

Stimulus:
"""
{STIMULUS}
"""

Return ONLY valid JSON (no explanation, no markdown) using exactly one of these schemas, or the literal word null:

For a data table:
{"type":"table","title":"optional short title","headers":["Col1","Col2","Col3"],"rows":[["A","84%","£118"],["B","79%","£105"]]}

For a line chart (data over time or sequence):
{"type":"line","title":"optional short title","yLabel":"optional unit label","xLabel":"optional","series":[{"label":"Week 1","value":420},{"label":"Week 2","value":390}]}

For a bar chart (comparisons across categories):
{"type":"bar","title":"optional short title","yLabel":"optional unit label","xLabel":"optional","series":[{"label":"Category A","value":55},{"label":"Category B","value":72}]}

Rules:
- Only extract data that is explicitly numeric and structured. Do not invent values.
- Prefer "table" when there are multiple columns of mixed data types.
- Prefer "line" when data shows change over time or a sequence.
- Prefer "bar" when comparing discrete categories without a time dimension.
- Keep labels short (≤12 chars).
- Return null if the stimulus is pure prose with no chart-worthy data.`;

async function extractChart(stimulus: string): Promise<object | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: EXTRACT_PROMPT.replace("{STIMULUS}", stimulus.slice(0, 1200)) }],
        temperature: 0.1,
        max_tokens: 600,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content?.trim() ?? "null";
    if (text === "null" || !text.startsWith("{")) return null;

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    if (!["table", "line", "bar"].includes(parsed.type)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Fetch all dm_questions where chart is null
  const { data: questions, error } = await db
    .from("dm_questions")
    .select("id, stimulus, chart")
    .is("chart", null)
    .not("stimulus", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!questions?.length) return NextResponse.json({ ok: true, updated: 0, skipped: 0, message: "No questions need updating." });

  let updated = 0;
  let skipped = 0;
  const results: { id: string; found: boolean }[] = [];

  for (const q of questions) {
    // Small delay to respect Groq rate limits
    await new Promise(r => setTimeout(r, 120));

    const chart = await extractChart(String(q.stimulus ?? ""));

    if (chart) {
      const { error: upErr } = await db
        .from("dm_questions")
        .update({ chart })
        .eq("id", q.id);

      if (!upErr) {
        updated++;
        results.push({ id: String(q.id), found: true });
      } else {
        skipped++;
        results.push({ id: String(q.id), found: false });
      }
    } else {
      skipped++;
      results.push({ id: String(q.id), found: false });
    }
  }

  return NextResponse.json({
    ok: true,
    total: questions.length,
    updated,
    skipped,
    results,
  });
}
