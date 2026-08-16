import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "sawdaj19@gmail.com";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const EXTRACT_PROMPT = `You are a data extraction assistant for UCAT Quantitative Reasoning questions.

Analyse the following dataset description. Extract the structured data and return a JSON chart object for rendering. QR always has numerical data — identify the best chart type.

Figure description: "{FIGURE_BRIEF}"

Dataset scenario/text:
"""
{SCENARIO}
"""

Return ONLY valid JSON (no explanation, no markdown) using exactly one of these schemas:

Line chart (data changes over time or ordered sequence):
{"type":"line","title":"short title","yLabel":"unit","xLabel":"optional","series":[{"label":"Jan","value":420},{"label":"Feb","value":390}]}

Multi-series line chart (two or more lines on same graph):
{"type":"multiline","title":"short title","yLabel":"unit","xLabels":["2019","2020","2021"],"series":[{"label":"Company A","values":[120,145,138]},{"label":"Company B","values":[98,103,115]}]}

Bar chart (comparing categories):
{"type":"bar","title":"short title","yLabel":"unit","series":[{"label":"Category A","value":55},{"label":"Category B","value":72}]}

Pie chart (parts of a whole / proportions):
{"type":"pie","title":"short title","series":[{"label":"Category A","value":40},{"label":"Category B","value":60}]}

Data table (multiple columns of mixed data):
{"type":"table","title":"short title","headers":["Name","Value","Change"],"rows":[["A","£120","5%"],["B","£98","2%"]]}

Rules:
- Always return a chart — QR datasets always have quantifiable data.
- Extract actual numeric values from the text; do not invent them.
- Keep labels short (≤14 chars).
- If the scenario describes multiple separate figures, pick the primary/most detailed one.
- Prefer "multiline" when two or more data series share the same x-axis.
- Use "table" when there are 3+ columns of heterogeneous data.`;

async function extractChart(figureBrief: string, scenario: string): Promise<object | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  try {
    const prompt = EXTRACT_PROMPT
      .replace("{FIGURE_BRIEF}", figureBrief?.slice(0, 300) ?? "")
      .replace("{SCENARIO}", scenario?.slice(0, 1500) ?? "");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 800,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content?.trim() ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    if (!["line", "bar", "pie", "table", "multiline"].includes(parsed.type)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Fetch all qr_datasets where chart is null
  const { data: datasets, error } = await db
    .from("qr_datasets")
    .select("id, title, figure_brief, scenario, chart")
    .is("chart", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!datasets?.length) return NextResponse.json({ ok: true, updated: 0, skipped: 0, message: "All datasets already have charts." });

  let updated = 0, skipped = 0;
  const results: { id: string; title: string; found: boolean; type?: string }[] = [];

  for (const ds of datasets) {
    await new Promise(r => setTimeout(r, 150));

    const chart = await extractChart(ds.figure_brief ?? "", ds.scenario ?? "");

    if (chart) {
      const { error: upErr } = await db
        .from("qr_datasets")
        .update({ chart })
        .eq("id", ds.id);

      if (!upErr) {
        updated++;
        results.push({ id: ds.id, title: ds.title ?? ds.id, found: true, type: (chart as any).type });
      } else {
        skipped++;
        results.push({ id: ds.id, title: ds.title ?? ds.id, found: false });
      }
    } else {
      skipped++;
      results.push({ id: ds.id, title: ds.title ?? ds.id, found: false });
    }
  }

  return NextResponse.json({ ok: true, total: datasets.length, updated, skipped, results });
}
