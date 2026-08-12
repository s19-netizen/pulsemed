"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SECTION_DATA: Record<string, {
  label: string; short: string; color: string; deep: string; tint: string;
  intro: string;
  guide: string;
  stats: { label: string; value: string; delta: string; tone: string }[];
  notes: { title: string; description: string; progress: number }[];
  groups: { id: string; label: string; items: { name: string; score: number; weak?: boolean }[] }[];
  recommendation: { focus: string; reason: string; steps: [string, string][] };
  completed: number;
}> = {
  vr: {
    label: "Verbal Reasoning", short: "VR", color: "#2D7FF9", deep: "#1A5FD0", tint: "#EAF2FF",
    intro: "Critically evaluate written information and answer using only the evidence in the passage.",
    guide: "Start with the question, isolate its key words, then scan for the precise evidence. Outside knowledge is irrelevant: the passage alone decides the answer.",
    stats: [
      { label: "Predicted score", value: "650", delta: "↑ 35", tone: "primary" },
      { label: "Average time", value: "32 sec", delta: "↓ 3 sec", tone: "yellow" },
      { label: "Accuracy", value: "72%", delta: "↑ 6%", tone: "primary" },
      { label: "Questions completed", value: "148", delta: "↑ 26", tone: "primary" },
    ],
    notes: [
      { title: "True, False, Can't Tell", description: "Prove, disprove or recognise when the passage cannot confirm a statement.", progress: 80 },
      { title: "Multiple Choice", description: "Choose the best-supported option and reject answers that are only partly right.", progress: 65 },
      { title: "Timing & passage strategy", description: "Know when to scan, when to read closely and when to move on.", progress: 70 },
    ],
    groups: [
      { id: "tfct", label: "True, False, Can't Tell", items: [
        { name: "Direct retrieval", score: 85 },
        { name: "Inference", score: 48, weak: true },
        { name: "Comparisons", score: 71 },
        { name: "Logical deduction", score: 75 },
      ]},
      { id: "mcq", label: "Multiple Choice", items: [
        { name: "Main idea", score: 74 },
        { name: "Writer's view", score: 46, weak: true },
        { name: "Meaning in context", score: 69 },
        { name: "Assumptions", score: 70 },
        { name: "Argument evaluation", score: 73 },
      ]},
    ],
    recommendation: {
      focus: "Focus on Inference next",
      reason: "You are accurate on direct retrieval, but inference is costing you time and marks.",
      steps: [
        ["Review the inference study note", "8 minutes"],
        ["Complete 12 guided questions", "Guidance after each answer"],
        ["Finish with a timed set", "10 questions · exam pace"],
      ],
    },
    completed: 148,
  },
  dm: {
    label: "Decision Making", short: "DM", color: "#8B6BFF", deep: "#6846D9", tint: "#F1ECFF",
    intro: "Make sound decisions using complex information by applying logic, evaluating arguments and interpreting data.",
    guide: "Turn each statement into a clear rule before testing the answer options. Draw only when the relationships are hard to hold mentally, and separate what must be true from what could be true.",
    stats: [
      { label: "Predicted score", value: "680", delta: "↑ 30", tone: "primary" },
      { label: "Average time", value: "61 sec", delta: "↓ 5 sec", tone: "yellow" },
      { label: "Accuracy", value: "74%", delta: "↑ 4%", tone: "primary" },
      { label: "Questions completed", value: "126", delta: "↑ 18", tone: "primary" },
    ],
    notes: [
      { title: "Syllogisms", description: "Translate every statement and test whether each conclusion must follow.", progress: 58 },
      { title: "Arguments & assumptions", description: "Judge relevance and strength without letting personal opinion interfere.", progress: 72 },
      { title: "Probability, Venns & data", description: "Organise sets and numbers before calculating or comparing outcomes.", progress: 66 },
    ],
    groups: [
      { id: "reasoning", label: "Reasoning & arguments", items: [
        { name: "Syllogisms", score: 52, weak: true },
        { name: "Interpreting information", score: 73 },
        { name: "Recognising assumptions", score: 68 },
      ]},
      { id: "data", label: "Data & probability", items: [
        { name: "Venn diagrams", score: 61 },
        { name: "Probability", score: 57, weak: true },
        { name: "Figures & tables", score: 76 },
      ]},
    ],
    recommendation: {
      focus: "Build confidence in Syllogisms",
      reason: "Your data interpretation is strong, but long chains of set relationships are reducing your accuracy.",
      steps: [
        ["Review the set-relationship method", "10 minutes"],
        ["Draw 8 guided diagrams", "One relationship at a time"],
        ["Complete a timed mixed set", "6 questions · exam pace"],
      ],
    },
    completed: 126,
  },
  qr: {
    label: "Quantitative Reasoning", short: "QR", color: "#3DBE6C", deep: "#238A4B", tint: "#EDFBF3",
    intro: "Critically evaluate numerical information and solve practical problems accurately at speed.",
    guide: "Identify what the question actually asks, estimate the size of the answer, then calculate. Use units to guide your method and let the answer options help you spot avoidable calculator errors.",
    stats: [
      { label: "Predicted score", value: "710", delta: "↑ 40", tone: "primary" },
      { label: "Average time", value: "39 sec", delta: "↓ 4 sec", tone: "yellow" },
      { label: "Accuracy", value: "78%", delta: "↑ 7%", tone: "primary" },
      { label: "Questions completed", value: "164", delta: "↑ 31", tone: "primary" },
    ],
    notes: [
      { title: "Percentages", description: "Handle percentage change, reverse percentages and repeated change quickly.", progress: 82 },
      { title: "Ratios, rates & conversions", description: "Keep units consistent and distinguish totals, parts and rates.", progress: 61 },
      { title: "Graphs, tables & calculator", description: "Extract only the figures you need and calculate efficiently.", progress: 76 },
    ],
    groups: [
      { id: "arithmetic", label: "Core arithmetic", items: [
        { name: "Fractions & decimals", score: 82 },
        { name: "Percentages", score: 75 },
        { name: "Ratios", score: 68 },
        { name: "Rates & measurements", score: 56, weak: true },
      ]},
      { id: "applied", label: "Applied problems", items: [
        { name: "Data interpretation", score: 79 },
        { name: "Geometry", score: 72 },
        { name: "Algebra", score: 65 },
        { name: "Currency & finance", score: 61, weak: true },
      ]},
    ],
    recommendation: {
      focus: "Target Rates & Measurements",
      reason: "Your arithmetic is reliable, but unit conversions are slowing you down and creating avoidable errors.",
      steps: [
        ["Review the conversion ladder", "7 minutes"],
        ["Complete 12 guided rate questions", "Speed, dosage and unit price"],
        ["Finish with a calculator sprint", "8 questions · exam pace"],
      ],
    },
    completed: 164,
  },
  sjt: {
    label: "Situational Judgement", short: "SJT", color: "#FF6B5C", deep: "#D84A3E", tint: "#FFEDEA",
    intro: "Read realistic clinical situations and decide how a professional should respond — not how a kind person might, but how a responsible one must.",
    guide: "Before you rank anything, ask three questions: Is someone at risk? Is this mine to handle? What's the smallest action that keeps things safe? Then rank what's described — not what you wish had happened.",
    stats: [
      { label: "Predicted band", value: "Band 2", delta: "On track", tone: "primary" },
      { label: "Average time", value: "23 sec", delta: "↓ 2 sec", tone: "yellow" },
      { label: "Agreement", value: "76%", delta: "↑ 5%", tone: "primary" },
      { label: "Scenarios completed", value: "84", delta: "↑ 14", tone: "primary" },
    ],
    notes: [
      { title: "Whose problem is this?", description: "Before acting, place ownership. Is this yours to fix, a senior's call, or the patient's decision to make? Getting this wrong is the most common SJT mistake.", progress: 62 },
      { title: "Scale the response", description: "Not every issue needs an emergency escalation. Match the weight of your action to the weight of the risk — proportionality is a skill, not an instinct.", progress: 71 },
      { title: "Honest but not blunt", description: "Many scenarios test whether you can stay truthful under social pressure. Practise separating what feels kind from what is actually right.", progress: 79 },
    ],
    groups: [
      { id: "judgment", label: "Judgment skills", items: [
        { name: "Ownership & role", score: 62, weak: true },
        { name: "Proportionality", score: 71 },
        { name: "Escalation timing", score: 58, weak: true },
        { name: "Ranking under pressure", score: 74 },
      ]},
      { id: "principles", label: "Professional principles", items: [
        { name: "Patient safety", score: 58, weak: true },
        { name: "Honesty", score: 81 },
        { name: "Confidentiality", score: 74 },
        { name: "Teamwork", score: 69 },
      ]},
    ],
    recommendation: {
      focus: "Nail ownership before escalation",
      reason: "You handle honesty well but often escalate too early or too late — the trigger is usually unclear role boundaries.",
      steps: [
        ["Ask: is this mine to handle?", "5 minutes — map your role vs senior's role"],
        ["Then ask: what's the minimum safe action?", "Not all risk needs an emergency call"],
        ["Do 10 escalation scenarios", "After each one, explain what tipped you"],
      ],
    },
    completed: 84,
  },
};

const ICON_TARGET = <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const ICON_TIMER = <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ICON_CHECK = <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const ICON_CHART = <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const ICON_NOTE = <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const ICON_PLAY = <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const ICON_STAR = <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ICON_CAL = <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>;
const ICON_SECTION = <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;


const GMC_URL = "https://www.gmc-uk.org/cdn/documents/agmp-2024-for-medical-students-english_pdf-108649541.pdf";

type Props = {
  slug: string;
  responses: { question_tag: string; is_correct: boolean; created_at: string }[];
  isGuest?: boolean;
};

export default function SectionClient({ slug, responses, isGuest }: Props) {
  const router = useRouter();
  const [planStarted, setPlanStarted] = useState(false);

  const config = SECTION_DATA[slug] ?? SECTION_DATA.vr;

  // Real data from Supabase
  const totalDone = responses.length;
  const totalCorrect = responses.filter(r => r.is_correct).length;
  const accuracy = totalDone > 0 ? Math.round((totalCorrect / totalDone) * 100) : 0;

  // Week activity
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weekActivity = weekDays.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return { day, active: responses.some(r => r.created_at?.startsWith(dateStr)) };
  });
  const weekDone = weekActivity.filter(w => w.active).length;

  // Skip predicted score (index 0) — show avg time, accuracy, questions completed
  const displayStats = config.stats.slice(1).map((stat, i) => {
    if (i === 1 && totalDone > 0) return { ...stat, value: `${accuracy}%`, delta: accuracy >= 70 ? "↑ on track" : "↑ improving" };
    if (i === 2 && totalDone > 0) return { ...stat, value: String(totalDone) };
    return stat;
  });

  const statIcons = [ICON_TIMER, ICON_CHECK, ICON_CHART];

  return (
    <div style={{ "--section": config.color, "--section-deep": config.deep, "--section-tint": config.tint } as React.CSSProperties}>
      <header className="page-header">
        <div>
          <p className="eyebrow">Learn <span>/</span> {config.label}</p>
          <div className="title-row">
            <span className="section-badge">{config.short}</span>
            <h1>{config.label}</h1>
          </div>
          <p>{isGuest ? config.intro : "Understand your progress and know exactly what to study next."}</p>
        </div>
      </header>

      {/* Guide overview */}
      <section className="section-intro">
        <span className="intro-icon">{ICON_SECTION}</span>
        <div>
          <h2>What is {config.label}?</h2>
          <p>{config.intro}</p>
        </div>
        <div className="intro-actions">
          <button onClick={() => router.push(`/study-guide/${slug}`)} type="button">
            View {config.short} guide <span>→</span>
          </button>
          {slug === "sjt" && (
            <a href={GMC_URL} target="_blank" rel="noreferrer">GMC guidance ↗</a>
          )}
        </div>
      </section>

      {/* Single combined card */}
      <div className="content-card" style={{ padding: 0, overflow: "hidden" }}>

        {/* Stat strip — logged-in only */}
        {!isGuest && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "1px solid var(--line)" }}>
            {displayStats.map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: "20px 24px",
                  borderRight: i < 2 ? "1px solid var(--line)" : undefined,
                  display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <span className={`stat-icon ${stat.tone}`} style={{ flexShrink: 0 }}>{statIcons[i]}</span>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".04em" }}>{stat.label}</span>
                  <strong style={{ display: "block", fontSize: 22, fontWeight: 850, lineHeight: 1.1, margin: "2px 0" }}>{stat.value}</strong>
                  <small style={{ fontSize: 10, color: i === 0 ? "var(--section)" : "var(--ink-soft)" }}>{stat.delta}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main body */}
        <div style={{ display: "grid", gridTemplateColumns: isGuest ? "1fr" : "1fr 1fr", gap: 0 }}>

          {/* Left: study topics */}
          <div style={{ padding: "24px", borderRight: isGuest ? undefined : "1px solid var(--line)" }}>
            <p className="section-kicker" style={{ marginBottom: 14 }}>STUDY TOPICS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {config.notes.map(note => (
                <div key={note.title} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong style={{ fontSize: 12, fontWeight: 750 }}>{note.title}</strong>
                    {!isGuest && <small style={{ fontSize: 10, color: "var(--ink-soft)", fontWeight: 600 }}>{note.progress}%</small>}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>{note.description}</p>
                  {!isGuest && <div className="mini-progress"><span style={{ width: `${note.progress}%` }} /></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Right: focus + week — logged-in only */}
          {!isGuest && (
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p className="section-kicker" style={{ marginBottom: 10 }}>TODAY'S FOCUS</p>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--section)", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>{ICON_STAR}</span>
                  <strong style={{ fontSize: 13, fontWeight: 750, lineHeight: 1.4 }}>{config.recommendation.focus}</strong>
                </div>
                <p style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 10px" }}>{config.recommendation.reason}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {config.recommendation.steps.map((step, i) => (
                    <div key={step[0]} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ width: 18, height: 18, borderRadius: 6, background: "var(--section)", color: "white", fontSize: 9, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                      <div>
                        <strong style={{ fontSize: 11, fontWeight: 700, display: "block" }}>{step[0]}</strong>
                        <small style={{ fontSize: 10, color: "var(--ink-soft)" }}>{step[1]}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p className="section-kicker" style={{ margin: 0 }}>THIS WEEK</p>
                  <small style={{ fontSize: 10, color: "var(--ink-soft)", fontWeight: 600 }}>{weekDone} of 5 days</small>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {weekActivity.map(({ day, active }) => (
                    <div key={day} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 4 }}>{day}</div>
                      <div style={{
                        width: "100%", aspectRatio: "1", borderRadius: 6, display: "grid", placeItems: "center",
                        background: active ? "var(--section)" : "var(--section-tint)",
                        color: active ? "white" : "var(--ink-soft)", fontSize: 10,
                      }}>
                        {active ? "✓" : ""}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="week-progress"><span style={{ width: `${(weekDone / 5) * 100}%` }} /></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--line)" }}>
          <button
            style={{ flex: 1, minHeight: 42, border: "1px solid var(--line)", borderRadius: 11, background: "white", fontWeight: 750, cursor: "pointer", fontSize: 13 }}
            onClick={() => router.push(`/study-guide/${slug}`)}
            type="button"
          >
            View all notes
          </button>
          <button
            className="plan-button"
            style={{ flex: 1, margin: 0 }}
            onClick={() => { setPlanStarted(true); router.push(`/practice/${slug}`); }}
            type="button"
          >
            {planStarted ? "Plan ready — begin →" : "Start practice →"}
          </button>
        </div>
      </div>

    </div>
  );
}
