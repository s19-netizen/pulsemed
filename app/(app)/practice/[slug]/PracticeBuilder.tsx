"use client";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SJTPractice from "./SJTPractice";

const SECTION_DATA: Record<string, {
  label: string; short: string; color: string; deep: string; tint: string;
  groups: { id: string; label: string; items: { name: string; score: number; weak?: boolean }[] }[];
  recommendation: { difficulty: string };
}> = {
  vr: {
    label: "Verbal Reasoning", short: "VR", color: "#2D7FF9", deep: "#1A5FD0", tint: "#EAF2FF",
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
    recommendation: { difficulty: "Silver → Gold" },
  },
  dm: {
    label: "Decision Making", short: "DM", color: "#8B6BFF", deep: "#6846D9", tint: "#F1ECFF",
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
    recommendation: { difficulty: "Silver → Gold" },
  },
  qr: {
    label: "Quantitative Reasoning", short: "QR", color: "#3DBE6C", deep: "#238A4B", tint: "#EDFBF3",
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
    recommendation: { difficulty: "Gold" },
  },
  sjt: {
    label: "Situational Judgement", short: "SJT", color: "#FF6B5C", deep: "#D84A3E", tint: "#FFEDEA",
    groups: [
      { id: "formats", label: "Question formats", items: [
        { name: "Appropriateness", score: 79 },
        { name: "Importance", score: 71 },
        { name: "Most / least appropriate", score: 62, weak: true },
      ]},
      { id: "themes", label: "Professional themes", items: [
        { name: "Patient safety", score: 58, weak: true },
        { name: "Honesty", score: 81 },
        { name: "Confidentiality", score: 74 },
        { name: "Teamwork", score: 69 },
      ]},
    ],
    recommendation: { difficulty: "Gold" },
  },
};

const DIFFICULTIES = ["Bronze", "Silver", "Gold", "Diamond"];
const COUNTS: Record<string, number[]> = {
  vr:  [4, 8, 12, 20],
  dm:  [5, 10, 15, 20],
  qr:  [4, 8, 16, 20],
  sjt: [5, 10, 20, 35],
};

// Real UCAT section amounts
const UCAT_COUNT: Record<string, number> = {
  vr:  44,  // 11 passages × 4
  dm:  29,
  qr:  36,  // 9 datasets × 4
  sjt: 69,
};
const UCAT_SUBLABEL: Record<string, string> = {
  vr:  "11 passages",
  dm:  "29 questions",
  qr:  "9 data sets",
  sjt: "69 questions",
};

const GROUP_ICONS: Record<string, React.ReactNode> = {
  tfct: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  mcq: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  reasoning: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  data: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l6 6"/></svg>,
  arithmetic: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  applied: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  formats: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  themes: <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
};

export default function PracticeBuilder({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const config = SECTION_DATA[slug]!;

  const fromPlan = params.get("from") === "plan";
  const planFocus = params.get("focus") ?? "";
  const planReason = params.get("reason") ?? "";
  const [planDismissed, setPlanDismissed] = useState(false);

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([config.groups[0].id]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<Set<string>>(new Set());
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    slug === "vr" ? ["Silver", "Gold"] : ["Gold"]
  );
  const counts = COUNTS[slug] ?? COUNTS.dm;
  const [count, setCount] = useState(counts[1] ?? counts[0]);

  function toggleGroup(id: string) {
    setSelectedGroupIds(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(g => g !== id) : prev
        : [...prev, id]
    );
    setSelectedSubtypes(new Set());
  }

  function toggleSubtype(name: string) {
    setSelectedSubtypes(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function toggleDifficulty(level: string) {
    setSelectedDifficulties(prev =>
      prev.includes(level)
        ? prev.length > 1 ? prev.filter(d => d !== level) : prev
        : [...prev, level]
    );
  }

  const availableSubtypes = useMemo(
    () => config.groups.filter(g => selectedGroupIds.includes(g.id)).flatMap(g => g.items),
    [config, selectedGroupIds]
  );

  function handleStart() {
    const qs = new URLSearchParams({
      section: slug,
      type: selectedGroupIds.join(","),
      subtypes: selectedSubtypes.size > 0 ? Array.from(selectedSubtypes).join(",") : "all",
      difficulty: selectedDifficulties.join(","),
      count: String(count),
    });
    router.push(`/question?${qs}`);
  }

  function handlePlanStart() {
    const qs = new URLSearchParams({
      section: slug,
      type: config.groups.map(g => g.id).join(","),
      subtypes: "all",
      difficulty: selectedDifficulties.join(","),
      count: String(count),
    });
    router.push(`/question?${qs}`);
  }

  if (slug === "sjt") return <SJTPractice />;

  return (
    <div style={{ "--section": config.color, "--section-deep": config.deep, "--section-tint": config.tint } as React.CSSProperties}>

      {fromPlan && !planDismissed && (
        <div style={{
          background: `linear-gradient(135deg, ${config.tint} 0%, #fff 100%)`,
          border: `2px solid ${config.color}`,
          borderRadius: 16, padding: "16px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: config.color,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: config.color, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Study plan recommendation</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2A3A", margin: "0 0 2px" }}>{planFocus}</p>
            {planReason && <p style={{ fontSize: 12, color: "#6B7A8C", margin: 0 }}>{planReason}</p>}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={handlePlanStart}
              style={{
                background: config.color, color: "#fff", border: "none",
                borderRadius: 10, padding: "9px 16px", fontWeight: 700,
                fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Practise →
            </button>
            <button
              type="button"
              onClick={() => router.push(`/section/${slug}`)}
              style={{
                background: "#fff", color: config.color, border: `1.5px solid ${config.color}`,
                borderRadius: 10, padding: "9px 14px", fontWeight: 700,
                fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Read notes
            </button>
            <button
              type="button"
              onClick={() => setPlanDismissed(true)}
              style={{
                background: "transparent", color: "#6B7A8C", border: "1.5px solid #EAEEF4",
                borderRadius: 10, padding: "9px 12px", fontWeight: 600,
                fontSize: 12, cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <p className="eyebrow">Practice</p>
          <div className="title-row">
            <span className="section-badge">{config.short}</span>
            <h1>{config.label}</h1>
          </div>
          <p>Build a focused session — pick your type, topics, difficulty and length.</p>
        </div>
      </div>

      <div className="practice-layout">
        <section className="content-card practice-builder">

          {/* Step 1 */}
          <div className="builder-step">
            <span>1</span>
            <div>
              <p className="section-kicker">QUESTION TYPE</p>
              <h2>What do you want to practise?</h2>
            </div>
          </div>
          <div className="builder-groups">
            {config.groups.map(group => (
              <button
                key={group.id}
                className={selectedGroupIds.includes(group.id) ? "selected" : ""}
                onClick={() => toggleGroup(group.id)}
                type="button"
              >
                <div className="builder-icon-box">
                  {GROUP_ICONS[group.id]}
                </div>
                <strong>{group.label}</strong>
                <small>&nbsp;</small>
              </button>
            ))}
          </div>

          {/* Step 2 */}
          <div className="builder-step">
            <span>2</span>
            <div>
              <p className="section-kicker">SUBTYPE</p>
              <h2>Which topics?</h2>
            </div>
          </div>
          <div className="subtype-pills">
            {availableSubtypes.map(item => (
              <button
                key={item.name}
                type="button"
                className={`subtype-pill${selectedSubtypes.has(item.name) ? " selected" : ""}`}
                onClick={() => toggleSubtype(item.name)}
              >
                {item.name}
              </button>
            ))}
          </div>
          {selectedSubtypes.size > 0 && (
            <p className="subtype-hint">
              {selectedSubtypes.size} selected ·{" "}
              <button type="button" className="subtype-clear" onClick={() => setSelectedSubtypes(new Set())}>
                clear
              </button>
            </p>
          )}

          {/* Step 3 */}
          <div className="builder-step">
            <span>3</span>
            <div>
              <p className="section-kicker">DIFFICULTY</p>
              <h2>Choose your level</h2>
            </div>
          </div>
          <div className="difficulty-row">
            {DIFFICULTIES.map(level => (
              <button
                key={level}
                className={selectedDifficulties.includes(level) ? `selected ${level.toLowerCase()}` : level.toLowerCase()}
                onClick={() => toggleDifficulty(level)}
                type="button"
              >
                {level}
              </button>
            ))}
          </div>

          {/* Step 4 */}
          <div className="builder-step">
            <span>4</span>
            <div>
              <p className="section-kicker">SESSION LENGTH</p>
              <h2>How many questions?</h2>
            </div>
          </div>
          <div className="count-row">
            {counts.map(n => (
              <button
                key={n}
                className={count === n ? "selected" : ""}
                onClick={() => setCount(n)}
                type="button"
              >
                <strong>{n}</strong>
                <small>{slug === "vr" ? `${n / 4} passage${n / 4 !== 1 ? "s" : ""}` : slug === "qr" ? `${n / 4} data set${n / 4 !== 1 ? "s" : ""}` : "questions"}</small>
              </button>
            ))}
            <button
              className={`count-ucat${count === UCAT_COUNT[slug] ? " selected" : ""}`}
              onClick={() => setCount(UCAT_COUNT[slug])}
              type="button"
            >
              <strong>{UCAT_COUNT[slug]}</strong>
              <small>{UCAT_SUBLABEL[slug]}</small>
              <span className="ucat-badge">UCAT</span>
            </button>
          </div>

          <button className="start-session" onClick={handleStart} type="button">
            Start {count}-question session <span>→</span>
          </button>
        </section>

        <aside className="practice-side">
          <section className="recommend-mini">
            <p>Recommended difficulty</p>
            <h2>{config.recommendation.difficulty}</h2>
            <span>Based on your recent accuracy and speed.</span>
          </section>

          <div className="practice-summary">
            <p className="section-kicker">SESSION SUMMARY</p>
            <div className="summary-row">
              <span>Types</span>
              <strong>{selectedGroupIds.map(id => config.groups.find(g => g.id === id)?.label).join(", ")}</strong>
            </div>
            <div className="summary-row">
              <span>Subtypes</span>
              <strong>{selectedSubtypes.size === 0 ? "All" : `${selectedSubtypes.size} selected`}</strong>
            </div>
            <div className="summary-row">
              <span>Difficulty</span>
              <strong>{selectedDifficulties.join(", ")}</strong>
            </div>
            <div className="summary-row">
              <span>Questions</span>
              <strong>{count}</strong>
            </div>
          </div>

          <button
            className="back-link"
            onClick={() => router.push(`/section/${slug}`)}
            type="button"
          >
            ← Back to {config.short} dashboard
          </button>
        </aside>
      </div>
    </div>
  );
}
