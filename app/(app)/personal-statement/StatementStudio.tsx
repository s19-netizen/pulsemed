"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const QUESTIONS = [
  {
    id: "q1",
    label: "Q1",
    title: "Why do you want to study this course?",
    hint: "Examiners want to see genuine motivation backed by evidence. Show how your curiosity developed — through reading, work experience, or academic study. Avoid clichés like 'I have always wanted to help people.'",
    limit: 1000,
    color: "#2D7FF9",
    tint: "#EAF2FF",
  },
  {
    id: "q2",
    label: "Q2",
    title: "How have your qualifications and studies prepared you for this course?",
    hint: "Link specific topics, modules or skills from your A-levels (or equivalent) to the demands of the course. Show you understand what the course actually involves — not just that you like the subjects.",
    limit: 1000,
    color: "#8B6BFF",
    tint: "#F1ECFF",
  },
  {
    id: "q3",
    title: "What else have you done to prepare for this course, and why will this help you in the future?",
    label: "Q3",
    hint: "Work experience, volunteering, supercurriculars, independent reading. For each experience: what happened, what you noticed, what you learned. Avoid listing — reflect. The link back to your future matters.",
    limit: 2000,
    color: "#3DBE6C",
    tint: "#EDFBF3",
  },
];

const STORAGE_KEY = "ps_draft_v1";

function charColor(count: number, limit: number): string {
  const pct = count / limit;
  if (pct > 1) return "#d94b3e";
  if (pct > 0.92) return "#f59e0b";
  return "var(--ink-soft)";
}

function loadDraft(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { q1: "", q2: "", q3: "" };
  } catch {
    return { q1: "", q2: "", q3: "" };
  }
}

export default function StatementStudio() {
  const [active, setActive] = useState("q1");
  const [texts, setTexts] = useState<Record<string, string>>({ q1: "", q2: "", q3: "" });
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = loadDraft();
    setTexts(draft);
  }, []);

  // Debounced autosave
  const scheduleSave = useCallback((newTexts: Record<string, string>) => {
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTexts));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
      }
    }, 800);
  }, []);

  function handleChange(id: string, val: string) {
    const next = { ...texts, [id]: val };
    setTexts(next);
    scheduleSave(next);
    // Clear feedback when text changes significantly
    if (feedback[id] && Math.abs(val.length - texts[id].length) > 20) {
      setFeedback(f => ({ ...f, [id]: "" }));
    }
  }

  async function getFeedback(id: string) {
    const text = texts[id];
    if (!text.trim() || text.trim().length < 40) return;
    setLoading(l => ({ ...l, [id]: true }));
    setFeedback(f => ({ ...f, [id]: "" }));
    try {
      const res = await fetch("/api/personal-statement/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: id, text }),
      });
      const data = await res.json();
      setFeedback(f => ({ ...f, [id]: data.feedback ?? data.error ?? "No feedback returned." }));
    } catch {
      setFeedback(f => ({ ...f, [id]: "Could not get feedback — please try again." }));
    } finally {
      setLoading(l => ({ ...l, [id]: false }));
    }
  }

  const totalChars = Object.values(texts).reduce((a, t) => a + t.length, 0);
  const totalLimit = 4000;

  const q = QUESTIONS.find(q => q.id === active)!;
  const text = texts[active] ?? "";
  const chars = text.length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 20, height: "calc(100vh - 120px)", maxHeight: 780 }}>

      {/* ── Left: editor ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>

        {/* Header */}
        <div className="page-header" style={{ paddingBottom: 0 }}>
          <div>
            <p className="eyebrow">Application</p>
            <div className="title-row">
              <span className="section-badge" style={{ background: "#EAF2FF", color: "#2D7FF9" }}>PS</span>
              <h1>Personal Statement</h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>
              UCAS 2025 format · 3 questions · 4,000 chars total
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {QUESTIONS.map(q => {
            const qChars = texts[q.id]?.length ?? 0;
            const isActive = active === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setActive(q.id)}
                type="button"
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 10, border: "none",
                  background: isActive ? q.color : "var(--surface)",
                  color: isActive ? "#fff" : "var(--ink)",
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                  boxShadow: isActive ? `0 2px 8px ${q.color}40` : "none",
                  transition: "all .15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}
              >
                <span style={{ fontSize: 13 }}>{q.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, opacity: isActive ? 0.85 : 0.5 }}>
                  {qChars} / {q.limit}
                </span>
              </button>
            );
          })}
        </div>

        {/* Question card */}
        <div className="content-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, minHeight: 0, overflow: "hidden", borderTop: `3px solid ${q.color}` }}>

          {/* Question title + hint toggle */}
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 750, lineHeight: 1.45, margin: 0, flex: 1 }}>
                {q.title}
              </p>
              <button
                type="button"
                onClick={() => setHints(h => ({ ...h, [q.id]: !h[q.id] }))}
                style={{ flexShrink: 0, background: q.tint, border: "none", color: q.color, borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                {hints[q.id] ? "Hide tips" : "Tips"}
              </button>
            </div>
            {hints[q.id] && (
              <p style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6, marginTop: 8, marginBottom: 0, background: q.tint, borderRadius: 8, padding: "8px 12px" }}>
                {q.hint}
              </p>
            )}
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={e => handleChange(q.id, e.target.value)}
            placeholder={`Write your response to ${q.label} here…`}
            style={{
              flex: 1, width: "100%", resize: "none", border: "none", outline: "none",
              padding: "16px 20px", fontSize: 14, lineHeight: 1.7,
              color: "var(--ink)", background: "transparent",
              fontFamily: "inherit", boxSizing: "border-box", minHeight: 0,
            }}
          />

          {/* Footer: char count + feedback button */}
          <div style={{ padding: "10px 20px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: charColor(chars, q.limit), flex: 1 }}>
              {chars.toLocaleString()} / {q.limit.toLocaleString()} characters
              {chars > q.limit && <span style={{ marginLeft: 6 }}>({chars - q.limit} over)</span>}
            </span>
            <button
              type="button"
              onClick={() => getFeedback(q.id)}
              disabled={loading[q.id] || chars < 40}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700,
                background: chars < 40 ? "var(--surface)" : q.color,
                color: chars < 40 ? "var(--ink-soft)" : "#fff",
                cursor: chars < 40 ? "default" : "pointer",
                transition: "background .15s",
              }}
            >
              {loading[q.id] ? "Thinking…" : "Get feedback →"}
            </button>
          </div>

          {/* AI Feedback panel */}
          {(loading[q.id] || feedback[q.id]) && (
            <div style={{
              borderTop: "1px solid var(--line)", padding: "14px 20px", background: q.tint,
              flexShrink: 0, maxHeight: 200, overflowY: "auto",
            }}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: q.color, margin: "0 0 8px" }}>
                Feedback
              </p>
              {loading[q.id] ? (
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>Reading your response…</p>
              ) : (
                <p style={{ fontSize: 13, lineHeight: 1.65, margin: 0, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                  {feedback[q.id]}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: progress panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Total counter */}
        <div className="content-card" style={{ padding: "16px 18px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 6px" }}>
            Total characters
          </p>
          <p style={{
            fontSize: 28, fontWeight: 900, margin: "0 0 4px", lineHeight: 1,
            color: totalChars > totalLimit ? "#d94b3e" : totalChars > totalLimit * 0.9 ? "#f59e0b" : "var(--ink)",
          }}>
            {totalChars.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: "0 0 10px" }}>
            of {totalLimit.toLocaleString()} total
          </p>
          <div style={{ height: 6, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${Math.min((totalChars / totalLimit) * 100, 100)}%`,
              background: totalChars > totalLimit ? "#d94b3e" : totalChars > totalLimit * 0.9 ? "#f59e0b" : "#2D7FF9",
              transition: "width .3s",
            }} />
          </div>
        </div>

        {/* Per-question bars */}
        <div className="content-card" style={{ padding: "14px 18px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 12px" }}>
            Per question
          </p>
          {QUESTIONS.map(q => {
            const qChars = texts[q.id]?.length ?? 0;
            const pct = Math.min((qChars / q.limit) * 100, 100);
            return (
              <div key={q.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: q.color }}>{q.label}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{qChars} / {q.limit}</span>
                </div>
                <div style={{ height: 4, borderRadius: 3, background: "var(--line)" }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: q.color, transition: "width .3s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Save status */}
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--surface)", display: "flex", alignItems: "center", gap: 7, border: "1px solid var(--line)" }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
            background: saveStatus === "saved" ? "#3DBE6C" : saveStatus === "saving" ? "#f59e0b" : "#d94b3e",
          }} />
          <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>
            {saveStatus === "saved" ? "Draft saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}
          </span>
        </div>

        {/* Tips */}
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "#EAF2FF", border: "1px solid #c7dcff" }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#2D7FF9", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 6px" }}>
            Remember
          </p>
          <ul style={{ fontSize: 11, color: "#2D7FF9", margin: 0, paddingLeft: 14, lineHeight: 1.7 }}>
            <li>Reflect, don't just describe</li>
            <li>Evidence every claim you make</li>
            <li>Link experiences to your course</li>
            <li>Your voice should come through</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
