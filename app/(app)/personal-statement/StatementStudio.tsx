"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const QUESTIONS = [
  {
    id: "q1", label: "Q1",
    title: "Why do you want to study this course?",
    hint: "Examiners want to see genuine motivation backed by evidence. Show how your curiosity developed — through reading, work experience, or academic study. Avoid clichés like 'I have always wanted to help people.'",
    limit: 1000, color: "#2D7FF9", tint: "#EAF2FF",
  },
  {
    id: "q2", label: "Q2",
    title: "How have your qualifications and studies prepared you for this course?",
    hint: "Link specific topics, modules or skills from your A-levels (or equivalent) to the demands of the course. Show you understand what the course actually involves — not just that you like the subjects.",
    limit: 1000, color: "#8B6BFF", tint: "#F1ECFF",
  },
  {
    id: "q3", label: "Q3",
    title: "What else have you done to prepare for this course, and why will this help you in the future?",
    hint: "Work experience, volunteering, supercurriculars, independent reading. For each experience: what happened, what you noticed, what you learned. Avoid listing — reflect. The link back to your future matters.",
    limit: 2000, color: "#3DBE6C", tint: "#EDFBF3",
  },
];

const STORAGE_KEY = "ps_draft_v1";

// ── Types ────────────────────────────────────────────────────────────────────

type FeedbackAnnotation = {
  phrase: string;
  issue: string;
  comment: string;
  severity: "high" | "medium" | "note";
};

type FeedbackData = {
  score: number;
  band: string;
  summary: string;
  annotations: FeedbackAnnotation[];
};

type SuggestionBlock = {
  original: string;
  issue: string;
  suggested: string;
  whyStronger: string;
};

// ── Utilities ─────────────────────────────────────────────────────────────────

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

function scoreColor(s: number) {
  if (s <= 3) return "#d94b3e";
  if (s <= 5) return "#f59e0b";
  if (s <= 7) return "#2D7FF9";
  return "#3DBE6C";
}

function scoreTint(s: number) {
  if (s <= 3) return "#FEE2E2";
  if (s <= 5) return "#FEF3C7";
  if (s <= 7) return "#EAF2FF";
  return "#DCFCE7";
}

function sevColors(sev: string) {
  if (sev === "high")   return { bg: "#FEE2E2", border: "#F87171", label: "#991B1B", dot: "#EF4444" };
  if (sev === "medium") return { bg: "#FEF9C3", border: "#FDE047", label: "#854D0E", dot: "#EAB308" };
  return                       { bg: "#DCFCE7", border: "#86EFAC", label: "#166534", dot: "#22C55E" };
}

function buildSegments(text: string, annotations: FeedbackAnnotation[]) {
  type Pos = { start: number; end: number; idx: number };
  const positions: Pos[] = [];
  for (let idx = 0; idx < annotations.length; idx++) {
    const phrase = (annotations[idx].phrase ?? "").trim().replace(/^["'""]|["'""]$/g, "");
    if (!phrase || phrase.length < 4) continue;
    const pos = text.toLowerCase().indexOf(phrase.toLowerCase());
    if (pos < 0) continue;
    const overlaps = positions.some(p => pos < p.end && pos + phrase.length > p.start);
    if (!overlaps) positions.push({ start: pos, end: pos + phrase.length, idx });
  }
  positions.sort((a, b) => a.start - b.start);
  const segs: Array<{ text: string; annotationIdx: number | null }> = [];
  let cursor = 0;
  for (const p of positions) {
    if (p.start > cursor) segs.push({ text: text.slice(cursor, p.start), annotationIdx: null });
    segs.push({ text: text.slice(p.start, p.end), annotationIdx: p.idx });
    cursor = p.end;
  }
  if (cursor < text.length) segs.push({ text: text.slice(cursor), annotationIdx: null });
  return segs;
}

function parseSuggestions(raw: string): SuggestionBlock[] {
  const blocks: SuggestionBlock[] = [];
  const chunks = raw.split(/\n(?=ORIGINAL:)/i).filter(Boolean);
  for (const chunk of chunks) {
    const get = (key: string) => {
      const m = chunk.match(new RegExp(`${key}:\\s*([\\s\\S]*?)(?=\\n(?:ORIGINAL|ISSUE|SUGGESTED|WHY STRONGER):|$)`, "i"));
      return m ? m[1].trim().replace(/^\[|\]$/g, "") : "";
    };
    const original = get("ORIGINAL");
    const suggested = get("SUGGESTED");
    if (original || suggested) blocks.push({ original, issue: get("ISSUE"), suggested, whyStronger: get("WHY STRONGER") });
  }
  return blocks;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StatementStudio() {
  const [active, setActive]           = useState("q1");
  const [texts, setTexts]             = useState<Record<string, string>>({ q1: "", q2: "", q3: "" });
  const [hints, setHints]             = useState<Record<string, boolean>>({});
  const [feedbackData, setFeedbackData] = useState<Record<string, FeedbackData>>({});
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});   // plain-text fallback
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [activePanel, setActivePanel] = useState<Record<string, "feedback" | "suggest">>({});
  const [activeAnn, setActiveAnn]     = useState<Record<string, number | null>>({});
  const [inEdit, setInEdit]           = useState<Record<string, boolean>>({});
  const [loading, setLoading]         = useState<Record<string, "feedback" | "suggest" | null>>({});
  const [saveStatus, setSaveStatus]   = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setTexts(loadDraft()); }, []);

  const scheduleSave = useCallback((next: Record<string, string>) => {
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setSaveStatus("saved"); }
      catch { setSaveStatus("unsaved"); }
    }, 800);
  }, []);

  function handleChange(id: string, val: string) {
    const next = { ...texts, [id]: val };
    setTexts(next);
    scheduleSave(next);
    // Exit review when user starts editing
    if (feedbackData[id] && !inEdit[id]) setInEdit(e => ({ ...e, [id]: true }));
  }

  async function callAI(id: string, mode: "feedback" | "suggest") {
    const text = texts[id];
    if (!text.trim() || text.trim().length < 40) return;
    setLoading(l => ({ ...l, [id]: mode }));
    setActivePanel(p => ({ ...p, [id]: mode }));
    if (mode === "feedback") {
      setFeedbackData(f => { const n = { ...f }; delete n[id]; return n; });
      setFeedbackText(f => ({ ...f, [id]: "" }));
    } else {
      setSuggestions(s => ({ ...s, [id]: "" }));
    }

    try {
      const res  = await fetch("/api/personal-statement/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: id, text, mode }),
      });
      const data = await res.json();
      if (mode === "feedback") {
        if (data.structured) {
          setFeedbackData(f => ({ ...f, [id]: data.structured }));
          setInEdit(e => ({ ...e, [id]: false }));
          setActiveAnn(a => ({ ...a, [id]: null }));
        } else {
          setFeedbackText(f => ({ ...f, [id]: data.feedback ?? data.error ?? "No feedback returned." }));
        }
      } else {
        setSuggestions(s => ({ ...s, [id]: data.feedback ?? data.error ?? "No response returned." }));
      }
    } catch {
      const err = "Could not connect — please try again.";
      if (mode === "feedback") setFeedbackText(f => ({ ...f, [id]: err }));
      else setSuggestions(s => ({ ...s, [id]: err }));
    } finally {
      setLoading(l => ({ ...l, [id]: null }));
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const totalChars = Object.values(texts).reduce((a, t) => a + t.length, 0);
  const totalLimit = 4000;
  const q          = QUESTIONS.find(q => q.id === active)!;
  const text       = texts[active] ?? "";
  const chars      = text.length;
  const isLoading  = loading[active];
  const panel      = activePanel[active];
  const fd         = feedbackData[active];
  const isInReview = panel === "feedback" && !!fd && !inEdit[active] && !isLoading;
  const segments   = isInReview ? buildSegments(text, fd.annotations) : [];
  const annIdx     = activeAnn[active] ?? null;
  const selAnn     = isInReview && annIdx !== null ? fd.annotations[annIdx] : null;
  const hasFbText  = !!feedbackText[active];
  const hasSuggest = !!suggestions[active];
  const showBottom = !isInReview && (isLoading || hasFbText || (hasSuggest && panel === "suggest"));
  const parsedSuggestions = hasSuggest && panel === "suggest" ? parseSuggestions(suggestions[active]) : [];

  const btnBase = (active: boolean, color: string, disabled: boolean) => ({
    padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
    background: disabled ? "var(--surface)" : active ? color : "var(--surface)",
    color: disabled ? "var(--ink-soft)" : active ? "#fff" : color,
    border: `1.5px solid ${disabled ? "var(--line)" : color}`,
    cursor: disabled ? "default" : "pointer",
    transition: "all .15s",
  } as React.CSSProperties);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 20, height: "calc(100vh - 120px)", maxHeight: 780 }}>

      {/* ── Left column ── */}
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
          {QUESTIONS.map(qTab => {
            const qChars  = texts[qTab.id]?.length ?? 0;
            const isActive = active === qTab.id;
            return (
              <button key={qTab.id} onClick={() => setActive(qTab.id)} type="button" style={{
                flex: 1, padding: "10px 12px", borderRadius: 10, border: "none",
                background: isActive ? qTab.color : "var(--surface)",
                color: isActive ? "#fff" : "var(--ink)",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                boxShadow: isActive ? `0 2px 8px ${qTab.color}40` : "none",
                transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                <span style={{ fontSize: 13 }}>{qTab.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, opacity: isActive ? 0.85 : 0.5 }}>
                  {qChars} / {qTab.limit}
                </span>
              </button>
            );
          })}
        </div>

        {/* Question card */}
        <div className="content-card" style={{
          flex: 1, display: "flex", flexDirection: "column", padding: 0,
          minHeight: 0, overflow: "hidden", borderTop: `3px solid ${q.color}`,
        }}>

          {/* Question title + hint */}
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 750, lineHeight: 1.45, margin: 0, flex: 1 }}>{q.title}</p>
              <button type="button" onClick={() => setHints(h => ({ ...h, [q.id]: !h[q.id] }))} style={{
                flexShrink: 0, background: q.tint, border: "none", color: q.color,
                borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>
                {hints[q.id] ? "Hide tips" : "Tips"}
              </button>
            </div>
            {hints[q.id] && (
              <p style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6, marginTop: 8, marginBottom: 0, background: q.tint, borderRadius: 8, padding: "8px 12px" }}>
                {q.hint}
              </p>
            )}
          </div>

          {/* ── Score bar (review mode only) ── */}
          {isInReview && (
            <div style={{
              padding: "10px 20px", borderBottom: "1px solid var(--line)", flexShrink: 0,
              background: scoreTint(fd.score), display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, color: scoreColor(fd.score) }}>
                {fd.score}
              </span>
              <span style={{ fontSize: 11, color: scoreColor(fd.score), opacity: 0.6, marginRight: 2 }}>/10</span>
              <span style={{
                fontSize: 11, fontWeight: 800, color: scoreColor(fd.score),
                background: "rgba(255,255,255,0.7)", padding: "2px 9px", borderRadius: 20,
                border: `1px solid ${scoreColor(fd.score)}40`,
              }}>
                {fd.band}
              </span>
              <span style={{ fontSize: 12, color: "var(--ink)", flex: 1, lineHeight: 1.4 }}>
                {fd.summary}
              </span>
              <button onClick={() => setInEdit(e => ({ ...e, [active]: true }))} style={{
                flexShrink: 0, background: "rgba(255,255,255,0.8)", border: "1px solid var(--line)",
                borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700,
                color: "var(--ink-soft)", cursor: "pointer",
              }}>
                ← Edit
              </button>
            </div>
          )}

          {/* ── Review body: highlighted text + annotation panel ── */}
          {isInReview ? (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 185px", minHeight: 0, overflow: "hidden" }}>

              {/* Left: highlighted text */}
              <div style={{
                overflowY: "auto", padding: "16px 20px",
                fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {segments.map((seg, i) => {
                  if (seg.annotationIdx === null) return <span key={i}>{seg.text}</span>;
                  const ann    = fd.annotations[seg.annotationIdx];
                  const sc     = sevColors(ann.severity);
                  const isActive = annIdx === seg.annotationIdx;
                  return (
                    <mark key={i} onClick={() => setActiveAnn(a => ({ ...a, [active]: seg.annotationIdx }))} style={{
                      background: sc.bg,
                      borderBottom: `2.5px solid ${sc.border}`,
                      borderRadius: "2px 2px 0 0",
                      padding: "1px 3px",
                      cursor: "pointer",
                      outline: isActive ? `2px solid ${sc.dot}` : "none",
                      outlineOffset: 1,
                      fontWeight: isActive ? 700 : "inherit",
                      transition: "outline .1s, font-weight .1s",
                    }}>
                      {seg.text}
                    </mark>
                  );
                })}
                {segments.length === 0 && (
                  <span style={{ color: "var(--ink)" }}>{text}</span>
                )}
              </div>

              {/* Right: annotation detail / index */}
              <div style={{
                borderLeft: "1px solid var(--line)", overflowY: "auto",
                padding: "14px 14px", background: "var(--surface)",
              }}>
                {selAnn ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: sevColors(selAnn.severity).dot, flexShrink: 0 }} />
                      <p style={{
                        fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                        letterSpacing: ".06em", color: sevColors(selAnn.severity).label, margin: 0,
                      }}>
                        {selAnn.issue}
                      </p>
                    </div>
                    <p style={{
                      fontSize: 11, color: "var(--ink-soft)", fontStyle: "italic", margin: "0 0 10px",
                      lineHeight: 1.5, borderLeft: `3px solid ${sevColors(selAnn.severity).border}`,
                      paddingLeft: 8,
                    }}>
                      "{selAnn.phrase}"
                    </p>
                    <p style={{ fontSize: 12, lineHeight: 1.65, color: "var(--ink)", margin: "0 0 10px" }}>
                      {selAnn.comment}
                    </p>
                    <button onClick={() => setActiveAnn(a => ({ ...a, [active]: null }))} style={{
                      background: "none", border: "none", fontSize: 11, color: "var(--ink-soft)",
                      cursor: "pointer", padding: 0, fontWeight: 600,
                    }}>
                      ← all issues
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 8px" }}>
                      Issues found
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {fd.annotations.map((ann, i) => {
                        const sc = sevColors(ann.severity);
                        return (
                          <button key={i} onClick={() => setActiveAnn(a => ({ ...a, [active]: i }))} style={{
                            textAlign: "left", background: sc.bg,
                            border: `1px solid ${sc.border}`,
                            borderRadius: 7, padding: "6px 9px", cursor: "pointer", width: "100%",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                              <p style={{ fontSize: 10, fontWeight: 800, color: sc.label, margin: 0, textTransform: "uppercase", letterSpacing: ".04em", lineHeight: 1.3 }}>
                                {ann.issue}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {segments.length < fd.annotations.length && (
                      <p style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 8, lineHeight: 1.5 }}>
                        Tap an issue above or a highlighted phrase in the text.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          ) : (
            /* ── Textarea (edit mode) ── */
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
          )}

          {/* ── Footer: always visible ── */}
          <div style={{
            padding: "10px 20px", borderTop: "1px solid var(--line)",
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          }}>
            {isInReview ? (
              <span style={{ flex: 1, fontSize: 11, color: "var(--ink-soft)" }}>
                {fd.annotations.length} issue{fd.annotations.length !== 1 ? "s" : ""} · tap a highlight
              </span>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 700, color: charColor(chars, q.limit), flex: 1 }}>
                {chars.toLocaleString()} / {q.limit.toLocaleString()} chars
                {chars > q.limit && <span style={{ marginLeft: 6 }}>({chars - q.limit} over)</span>}
              </span>
            )}
            <button type="button" onClick={() => callAI(q.id, "feedback")} disabled={!!isLoading || chars < 40}
              style={btnBase(panel === "feedback" && (!!fd || hasFbText), q.color, !!isLoading || chars < 40)}>
              {isLoading === "feedback" ? "Analysing…" : "Feedback"}
            </button>
            <button type="button" onClick={() => callAI(q.id, "suggest")} disabled={!!isLoading || chars < 40}
              style={btnBase(panel === "suggest" && hasSuggest, q.color, !!isLoading || chars < 40)}>
              {isLoading === "suggest" ? "Thinking…" : "Suggest rewrites"}
            </button>
          </div>

          {/* ── Bottom panel: loading / plain fallback / suggestions ── */}
          {showBottom && (
            <div style={{
              borderTop: "1px solid var(--line)", padding: "14px 20px",
              background: q.tint, flexShrink: 0, maxHeight: 200, overflowY: "auto",
            }}>
              {isLoading ? (
                <>
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: q.color, margin: "0 0 6px" }}>
                    {isLoading === "suggest" ? "Finding weak phrases…" : "Analysing…"}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>This takes a few seconds</p>
                </>
              ) : panel === "suggest" && parsedSuggestions.length > 0 ? (
                <>
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: q.color, margin: "0 0 10px" }}>
                    Suggested rewrites
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {parsedSuggestions.map((s, i) => (
                      <div key={i} style={{ background: "var(--surface)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--line)" }}>
                        {s.issue && (
                          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: "#d94b3e", margin: "0 0 5px" }}>
                            {s.issue}
                          </p>
                        )}
                        {s.original && (
                          <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: "0 0 5px", fontStyle: "italic" }}>"{s.original}"</p>
                        )}
                        {s.suggested && (
                          <p style={{ fontSize: 12, color: "var(--ink)", margin: "0 0 5px", background: q.tint, borderRadius: 5, padding: "5px 8px", borderLeft: `3px solid ${q.color}`, fontWeight: 600 }}>
                            {s.suggested}
                          </p>
                        )}
                        {s.whyStronger && (
                          <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>{s.whyStronger}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : hasFbText ? (
                <>
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: q.color, margin: "0 0 8px" }}>
                    Feedback
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.65, margin: 0, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                    {feedbackText[active]}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                  {suggestions[active] || "No response returned."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: progress panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

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

        <div className="content-card" style={{ padding: "14px 18px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 12px" }}>
            Per question
          </p>
          {QUESTIONS.map(qb => {
            const qChars = texts[qb.id]?.length ?? 0;
            const pct    = Math.min((qChars / qb.limit) * 100, 100);
            return (
              <div key={qb.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: qb.color }}>{qb.label}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{qChars} / {qb.limit}</span>
                </div>
                <div style={{ height: 4, borderRadius: 3, background: "var(--line)" }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: qb.color, transition: "width .3s" }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--surface)", display: "flex", alignItems: "center", gap: 7, border: "1px solid var(--line)" }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
            background: saveStatus === "saved" ? "#3DBE6C" : saveStatus === "saving" ? "#f59e0b" : "#d94b3e",
          }} />
          <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>
            {saveStatus === "saved" ? "Draft saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}
          </span>
        </div>

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
