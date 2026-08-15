import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const VR_SUBTYPE_KEYS = ["direct-retrieval","inference","main-idea","author-viewpoint","meaning-in-context","comparisons","scope"];
const DM_SUBTYPE_KEYS = ["syllogism","logical-puzzle","strongest-arg","venn","probability"];

const VR_SUBTYPE_LABELS: Record<string,string> = {
  "direct-retrieval": "VR Direct Retrieval",
  "inference": "VR Inference",
  "main-idea": "VR Main Idea",
  "author-viewpoint": "VR Author Viewpoint",
  "meaning-in-context": "VR Meaning in Context",
  "comparisons": "VR Comparisons",
  "scope": "VR Scope & Evidence",
};
const DM_SUBTYPE_LABELS: Record<string,string> = {
  "syllogism": "DM Syllogisms",
  "logical-puzzle": "DM Logic Puzzles",
  "strongest-arg": "DM Strongest Arguments",
  "venn": "DM Venn Diagrams",
  "probability": "DM Probability & Stats",
};
const VR_SUBTYPE_HREF: Record<string,string> = {
  "direct-retrieval": "/learn/verbal_reasoning/tf/direct-retrieval",
  "inference": "/learn/verbal_reasoning/tf/inference",
  "main-idea": "/learn/verbal_reasoning/mcq/main-idea",
  "author-viewpoint": "/learn/verbal_reasoning/mcq/author-viewpoint",
  "meaning-in-context": "/learn/verbal_reasoning/mcq/meaning-in-context",
  "comparisons": "/learn/verbal_reasoning/tf/comparisons",
  "scope": "/learn/verbal_reasoning/tf/scope",
};
const DM_SUBTYPE_HREF: Record<string,string> = {
  "syllogism": "/practice/dm",
  "logical-puzzle": "/practice/dm",
  "strongest-arg": "/practice/dm",
  "venn": "/practice/dm",
  "probability": "/practice/dm",
};

function parseTag(tag: string) {
  if (tag.startsWith("vr-")) {
    let sub: string | null = null;
    if (tag.startsWith("vr-tf-") || tag.startsWith("vr-mcq-")) {
      // practice format: vr-tf-inference, vr-mcq-main-idea
      const fmt = tag.startsWith("vr-tf-") ? "tf" : "mcq";
      const rest = tag.slice(`vr-${fmt}-`.length);
      sub = VR_SUBTYPE_KEYS.find(k => rest.startsWith(k)) ?? null;
    } else {
      // diagnostic format: vr-main-idea, vr-inference, etc.
      sub = VR_SUBTYPE_KEYS.find(k => tag === `vr-${k}` || tag.startsWith(`vr-${k}-`)) ?? null;
    }
    return { section: "VR", subtype: sub };
  }
  if (tag.startsWith("dm-")) {
    const sub = DM_SUBTYPE_KEYS.find(k => tag.includes(k)) ?? null;
    return { section: "DM", subtype: sub };
  }
  if (tag.startsWith("qr-")) return { section: "QR", subtype: null };
  if (tag.startsWith("sjt-")) return { section: "SJT", subtype: null };
  return { section: "Other", subtype: null };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  // Check cache (24h)
  const { data: cached } = await supabase
    .from("ai_study_plan")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (cached?.plan_json && cached?.generated_at) {
    const ageHours = (Date.now() - new Date(cached.generated_at).getTime()) / 3600000;
    if (ageHours < 24) return NextResponse.json({ plan: cached.plan_json, cached: true });
  }

  // Fetch responses
  const { data: responses } = await supabase
    .from("question_responses")
    .select("question_tag, is_correct, time_taken_ms, session_type")
    .eq("user_id", userId);

  const all = responses ?? [];
  if (all.length < 10) return NextResponse.json({ plan: null, reason: "not_enough_data" });

  // Aggregate
  type Agg = { total: number; correct: number; totalMs: number };
  const sections: Record<string, Agg> = {};
  const subtypes: Record<string, Agg> = {};

  for (const r of all) {
    const { section, subtype } = parseTag(r.question_tag ?? "");
    if (section === "Other") continue;
    if (!sections[section]) sections[section] = { total: 0, correct: 0, totalMs: 0 };
    sections[section].total++;
    if (r.is_correct) sections[section].correct++;
    sections[section].totalMs += r.time_taken_ms ?? 0;

    if (subtype) {
      if (!subtypes[subtype]) subtypes[subtype] = { total: 0, correct: 0, totalMs: 0 };
      subtypes[subtype].total++;
      if (r.is_correct) subtypes[subtype].correct++;
      subtypes[subtype].totalMs += r.time_taken_ms ?? 0;
    }
  }

  const TARGET_SEC: Record<string, number> = { VR: 30, DM: 64, QR: 42, SJT: 23 };

  const sectionLines = Object.entries(sections).map(([sec, s]) => {
    const acc = Math.round((s.correct / s.total) * 100);
    const avg = Math.round(s.totalMs / s.total / 1000);
    const target = TARGET_SEC[sec] ?? 30;
    return `${sec}: ${acc}% accuracy (${s.total} qs), avg ${avg}s per question (target ${target}s, ${avg > target ? `${avg - target}s OVER` : "on pace"})`;
  }).join("\n");

  const subtypeLines = Object.entries(subtypes)
    .filter(([, s]) => s.total >= 3)
    .map(([sub, s]) => {
      const acc = Math.round((s.correct / s.total) * 100);
      const label = VR_SUBTYPE_LABELS[sub] ?? DM_SUBTYPE_LABELS[sub] ?? sub;
      const href = VR_SUBTYPE_HREF[sub] ?? DM_SUBTYPE_HREF[sub] ?? "";
      return `${label} (${acc}%, ${s.total} qs) href:${href}`;
    }).join("\n");

  const prompt = `You are a UCAT tutor. Give honest, specific, student-friendly analysis based on ALL the student's historical data — not just their most recent session.

STUDENT PERFORMANCE (all-time averages):
${sectionLines}

SUBTYPE BREAKDOWN (subtypes with 3+ attempts only):
${subtypeLines || "No subtype data yet"}

Return ONLY this JSON (no other text):
{
  "summary": "2-3 sentences: honest overall picture across ALL sections, name their strongest and weakest areas specifically",
  "timingNote": "one sentence about their timing vs targets, or null if timing looks fine",
  "strengths": [{"label": "e.g. VR Direct Retrieval", "detail": "e.g. 88% — consistently strong"}],
  "weaknesses": [{"label": "e.g. VR Inference", "href": "/learn/verbal_reasoning/tf/inference", "detail": "e.g. 54% — main drag on your VR score"}],
  "priority": [{"label": "e.g. VR Inference", "href": "/learn/verbal_reasoning/tf/inference", "reason": "e.g. Weakest skill at 54%"}],
  "weeklyPlan": "specific, actionable 1-2 sentence plan for this week naming exact skills to practise"
}

Rules:
- Base everything on ALL-TIME averages, not just recent sessions
- Be specific, name actual numbers and subtypes
- strengths: subtypes with 70%+ accuracy and at least 5 questions
- weaknesses: subtypes under 65% with at least 5 questions; spread across different sections if possible, max 3
- priority: rank attempted subtypes from most to least urgent, include hrefs
- weeklyPlan: balanced across sections — do not recommend only one section unless it is clearly the only weak area
- If a section has very few questions, note it as "not yet attempted" rather than calling it weak`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "{}";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ plan: null, reason: "parse_error" });

    const plan = JSON.parse(match[0]);

    await supabase.from("ai_study_plan").upsert({
      user_id: userId,
      plan_json: plan,
      generated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return NextResponse.json({ plan, cached: false });
  } catch (e) {
    console.error("Study plan Groq error:", e);
    return NextResponse.json({ plan: null, reason: "groq_error" });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  await supabase.from("ai_study_plan").delete().eq("user_id", userId);
  return NextResponse.json({ ok: true });
}
