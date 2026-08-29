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

// ── Types ─────────────────────────────────────────────────────────────────────

type FeedbackAnnotation = {
  phrase: string; issue: string; comment: string; severity: "high" | "medium" | "note";
};
type FeedbackData = {
  score: number; band: string; summary: string; annotations: FeedbackAnnotation[];
};
type SuggestionItem = {
  phrase: string; issue: string; suggested: string; whyStronger: string;
};
type SuggestData = { suggestions: SuggestionItem[] };

// ── Utilities ─────────────────────────────────────────────────────────────────

function charColor(count: number, limit: number): string {
  const pct = count / limit;
  if (pct > 1)    return "#d94b3e";
  if (pct > 0.92) return "#f59e0b";
  return "var(--ink-soft)";
}

function loadDraft(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { q1: "", q2: "", q3: "" };
  } catch { return { q1: "", q2: "", q3: "" }; }
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

function buildSegments(text: string, phrases: string[]) {
  type Pos = { start: number; end: number; idx: number };
  const positions: Pos[] = [];
  for (let idx = 0; idx < phrases.length; idx++) {
    const phrase = (phrases[idx] ?? "").trim().replace(/^["'""]|["'""]$/g, "");
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

// ── Main component ────────────────────────────────────────────────────────────

export default function StatementStudio() {
  const [active, setActive]         = useState("q1");
  const [texts, setTexts]           = useState<Record<string, string>>({ q1: "", q2: "", q3: "" });
  const [hints, setHints]           = useState<Record<string, boolean>>({});
  const [feedbackData, setFeedbackData]   = useState<Record<string, FeedbackData>>({});
  const [feedbackText, setFeedbackText]   = useState<Record<string, string>>({});
  const [suggestData, setSuggestData]     = useState<Record<string, SuggestData>>({});
  const [suggestText, setSuggestText]     = useState<Record<string, string>>({});
  const [activePanel, setActivePanel]     = useState<Record<string, "feedback" | "suggest">>({});
  const [activeAnn, setActiveAnn]         = useState<Record<string, number | null>>({});
  const [activeSug, setActiveSug]         = useState<Record<string, number | null>>({});
  const [inEdit, setInEdit]               = useState<Record<string, boolean>>({});
  const [loading, setLoading]             = useState<Record<string, "feedback" | "suggest" | null>>({});
  const [saveStatus, setSaveStatus]       = useState<"saved" | "saving" | "unsaved">("saved");
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
    if ((feedbackData[id] || suggestData[id]) && !inEdit[id]) {
      setInEdit(e => ({ ...e, [id]: true }));
    }
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
      setSuggestData(s => { const n = { ...s }; delete n[id]; return n; });
      setSuggestText(s => ({ ...s, [id]: "" }));
    }

    try {
      const res  = await fetch("/api/personal-statement/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: id, text, mode }),
      });
      const data = await res.json();

      if (mode === "feedback") {
        if (data.structured?.annotations) {
          setFeedbackData(f => ({ ...f, [id]: data.structured }));
          setInEdit(e => ({ ...e, [id]: false }));
          setActiveAnn(a => ({ ...a, [id]: null }));
        } else {
          setFeedbackText(f => ({ ...f, [id]: data.feedback ?? data.error ?? "No feedback returned." }));
        }
      } else {
        if (data.structured?.suggestions) {
          setSuggestData(s => ({ ...s, [id]: data.structured }));
          setInEdit(e => ({ ...e, [id]: false }));
          setActiveSug(a => ({ ...a, [id]: null }));
        } else {
          setSuggestText(s => ({ ...s, [id]: data.feedback ?? data.error ?? "No suggestions returned." }));
        }
      }
    } catch {
      if (mode === "feedback") setFeedbackText(f => ({ ...f, [id]: "Could not connect — please try again." }));
      else setSuggestText(s => ({ ...s, [id]: "Could not connect — please try again." }));
    } finally {
      setLoading(l => ({ ...l, [id]: null }));
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const totalChars = Object.values(texts).reduce((a, t) => a + t.length, 0);
  const q          = QUESTIONS.find(q => q.id === active)!;
  const text       = texts[active] ?? "";
  const chars      = text.length;
  const isLoading  = loading[active];
  const panel      = activePanel[active];
  const fd         = feedbackData[active];
  const sd         = suggestData[active];

  const isInFeedbackReview = panel === "feedback" && !!fd && !inEdit[active] && !isLoading;
  const isInSuggestReview  = panel === "suggest"  && !!sd && !inEdit[active] && !isLoading;
  const isInReview         = isInFeedbackReview || isInSuggestReview;

  const phrases  = isInFeedbackReview ? fd.annotations.map(a => a.phrase)
                 : isInSuggestReview  ? sd.suggestions.map(s => s.phrase)
                 : [];
  const segments = isInReview ? buildSegments(text, phrases) : [];

  const annIdx  = activeAnn[active] ?? null;
  const sugIdx  = activeSug[active] ?? null;
  const selAnn  = isInFeedbackReview && annIdx !== null ? fd.annotations[annIdx] : null;
  const selSug  = isInSuggestReview  && sugIdx !== null ? sd.suggestions[sugIdx] : null;

  const hasFbText  = !!feedbackText[active];
  const hasSugText = !!suggestText[active];
  const showBottom = !isInReview && (isLoading || hasFbText || hasSugText);

  const btnStyle = (on: boolean, disabled: boolean, color: string): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
    background: disabled ? "var(--surface)" : on ? color : "var(--surface)",
    color: disabled ? "var(--ink-soft)" : on ? "#fff" : color,
    border: `1.5px solid ${disabled ? "var(--line)" : color}`,
    cursor: disabled ? "default" : "pointer",
    transition: "all .15s",
  });

  const saveColor = saveStatus === "saved" ? "#3DBE6C" : saveStatus === "saving" ? "#f59e0b" : "#d94b3e";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ── Header ── */}
      <div className="page-header" style={{ paddingBottom: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p className="eyebrow">Application</p>
          <div className="title-row">
            <span className="section-badge" style={{ background: "#EAF2FF", color: "#2D7FF9" }}>PS</span>
            <h1>Personal Statement</h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>
            UCAS 2025 · 3 questions · 4,000 chars total
          </p>
        </div>
        {/* Total chars + save status */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 6 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{
              fontSize: 24, fontWeight: 900, lineHeight: 1, margin: "0 0 2px",
              color: totalChars > 4000 ? "#d94b3e" : totalChars > 3600 ? "#f59e0b" : "var(--ink)",
            }}>
              {totalChars.toLocaleString()}
            </p>
            <p style={{ fontSize: 10, color: "var(--ink-soft)", margin: 0, fontWeight: 600 }}>of 4,000</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--line)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: saveColor, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "var(--ink-soft)", fontWeight: 700 }}>
              {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {QUESTIONS.map(qTab => {
          const qChars   = texts[qTab.id]?.length ?? 0;
          const isActive = active === qTab.id;
          return (
            <button key={qTab.id} onClick={() => setActive(qTab.id)} type="button" style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: "none",
              background: isActive ? qTab.color : "var(--surface)",
              color: isActive ? "#fff" : "var(--ink)",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
              boxShadow: isActive ? `0 2px 8px ${qTab.color}40` : "none",
              transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <span style={{ fontSize: 13 }}>{qTab.label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, opacity: isActive ? 0.85 : 0.5 }}>
                {qChars.toLocaleString()} / {qTab.limit.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Question card ── */}
      <div className="content-card" style={{
        display: "flex", flexDirection: "column", padding: 0,
        minHeight: 620, borderTop: `3px solid ${q.color}`,
      }}>

        {/* Question title + hint */}
        <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 750, lineHeight: 1.45, margin: 0, flex: 1 }}>{q.title}</p>
            {!isInReview && (
              <button type="button" onClick={() => setHints(h => ({ ...h, [q.id]: !h[q.id] }))} style={{
                flexShrink: 0, background: q.tint, border: "none", color: q.color,
                borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>
                {hints[q.id] ? "Hide tips" : "Tips"}
              </button>
            )}
            {isInReview && (
              <button onClick={() => setInEdit(e => ({ ...e, [active]: true }))} style={{
                flexShrink: 0, background: "var(--surface)", border: "1px solid var(--line)",
                borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700,
                color: "var(--ink-soft)", cursor: "pointer",
              }}>
                ← Edit
              </button>
            )}
          </div>
          {!isInReview && hints[q.id] && (
            <p style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6, marginTop: 8, marginBottom: 0, background: q.tint, borderRadius: 8, padding: "8px 12px" }}>
              {q.hint}
            </p>
          )}
        </div>

        {/* Score bar — feedback review only */}
        {isInFeedbackReview && (
          <div style={{
            padding: "10px 20px", borderBottom: "1px solid var(--line)", flexShrink: 0,
            background: scoreTint(fd.score), display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, color: scoreColor(fd.score) }}>{fd.score}</span>
            <span style={{ fontSize: 11, color: scoreColor(fd.score), opacity: 0.6 }}>/10</span>
            <span style={{
              fontSize: 11, fontWeight: 800, color: scoreColor(fd.score),
              background: "rgba(255,255,255,0.7)", padding: "2px 9px", borderRadius: 20,
              border: `1px solid ${scoreColor(fd.score)}40`,
            }}>{fd.band}</span>
            <span style={{ fontSize: 12, color: "var(--ink)", flex: 1, lineHeight: 1.4 }}>{fd.summary}</span>
          </div>
        )}

        {/* Suggest header — suggest review only */}
        {isInSuggestReview && (
          <div style={{
            padding: "10px 20px", borderBottom: "1px solid var(--line)", flexShrink: 0,
            background: q.tint, display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: q.color }}>
              {sd.suggestions.length} suggested rewrite{sd.suggestions.length !== 1 ? "s" : ""}
            </span>
            <span style={{ fontSize: 11, color: "var(--ink-soft)", flex: 1 }}>
              Tap a highlighted phrase to see the improvement
            </span>
          </div>
        )}

        {/* ── Review body OR textarea ── */}
        {isInReview ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", minHeight: 520 }}>

            {/* Left: highlighted text */}
            <div style={{
              padding: "20px 26px",
              fontSize: 14, lineHeight: 2, whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {segments.map((seg, i) => {
                if (seg.annotationIdx === null) return <span key={i}>{seg.text}</span>;

                if (isInFeedbackReview) {
                  const ann      = fd.annotations[seg.annotationIdx];
                  const sc       = sevColors(ann.severity);
                  const isActive = annIdx === seg.annotationIdx;
                  return (
                    <mark key={i} onClick={() => setActiveAnn(a => ({ ...a, [active]: seg.annotationIdx }))} style={{
                      background: sc.bg, borderBottom: `2.5px solid ${sc.border}`,
                      borderRadius: "2px 2px 0 0", padding: "1px 3px", cursor: "pointer",
                      outline: isActive ? `2px solid ${sc.dot}` : "none", outlineOffset: 1,
                      fontWeight: isActive ? 700 : "inherit", transition: "outline .1s",
                    }}>{seg.text}</mark>
                  );
                }

                // Suggest mode highlights
                const isActive = sugIdx === seg.annotationIdx;
                return (
                  <mark key={i} onClick={() => setActiveSug(a => ({ ...a, [active]: seg.annotationIdx }))} style={{
                    background: q.tint, borderBottom: `2.5px solid ${q.color}`,
                    borderRadius: "2px 2px 0 0", padding: "1px 3px", cursor: "pointer",
                    outline: isActive ? `2px solid ${q.color}` : "none", outlineOffset: 1,
                    fontWeight: isActive ? 700 : "inherit", transition: "outline .1s",
                  }}>{seg.text}</mark>
                );
              })}
              {segments.length === 0 && <span style={{ color: "var(--ink)" }}>{text}</span>}
            </div>

            {/* Right: annotation / suggestion detail */}
            <div style={{
              borderLeft: "1px solid var(--line)",
              padding: "16px 14px", background: "var(--surface)",
              position: "sticky", top: 0, alignSelf: "flex-start",
            }}>
              {/* ── Feedback mode right panel ── */}
              {isInFeedbackReview && (
                selAnn ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: sevColors(selAnn.severity).dot, flexShrink: 0 }} />
                      <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".06em", color: sevColors(selAnn.severity).label, margin: 0 }}>
                        {selAnn.issue}
                      </p>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--ink-soft)", fontStyle: "italic", margin: "0 0 10px", lineHeight: 1.5, borderLeft: `3px solid ${sevColors(selAnn.severity).border}`, paddingLeft: 8 }}>
                      "{selAnn.phrase}"
                    </p>
                    <p style={{ fontSize: 12, lineHeight: 1.65, color: "var(--ink)", margin: "0 0 10px" }}>{selAnn.comment}</p>
                    <button onClick={() => setActiveAnn(a => ({ ...a, [active]: null }))} style={{ background: "none", border: "none", fontSize: 11, color: "var(--ink-soft)", cursor: "pointer", padding: 0, fontWeight: 600 }}>
                      ← all issues
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 8px" }}>Issues found</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {fd.annotations.map((ann, i) => {
                        const sc = sevColors(ann.severity);
                        return (
                          <button key={i} onClick={() => setActiveAnn(a => ({ ...a, [active]: i }))} style={{
                            textAlign: "left", background: sc.bg, border: `1px solid ${sc.border}`,
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
                  </div>
                )
              )}

              {/* ── Suggest mode right panel ── */}
              {isInSuggestReview && (
                selSug ? (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".06em", color: "#d94b3e", margin: "0 0 8px" }}>
                      {selSug.issue}
                    </p>
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 3px" }}>Original</p>
                      <p style={{ fontSize: 11, color: "var(--ink-soft)", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>"{selSug.phrase}"</p>
                    </div>
                    <div style={{ background: q.tint, borderLeft: `3px solid ${q.color}`, borderRadius: "0 6px 6px 0", padding: "8px 10px", marginBottom: 8 }}>
                      <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: q.color, margin: "0 0 4px" }}>Stronger version</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1.6 }}>{selSug.suggested}</p>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.5, margin: "0 0 10px" }}>{selSug.whyStronger}</p>
                    <button onClick={() => setActiveSug(a => ({ ...a, [active]: null }))} style={{ background: "none", border: "none", fontSize: 11, color: "var(--ink-soft)", cursor: "pointer", padding: 0, fontWeight: 600 }}>
                      ← all rewrites
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 8px" }}>
                      Tap a highlight
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {sd.suggestions.map((sug, i) => (
                        <button key={i} onClick={() => setActiveSug(a => ({ ...a, [active]: i }))} style={{
                          textAlign: "left", background: q.tint, border: `1px solid ${q.color}40`,
                          borderRadius: 7, padding: "6px 9px", cursor: "pointer", width: "100%",
                        }}>
                          <p style={{ fontSize: 10, fontWeight: 800, color: q.color, margin: 0, textTransform: "uppercase", letterSpacing: ".04em", lineHeight: 1.3 }}>
                            {sug.issue}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
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
              flex: 1, width: "100%", resize: "vertical", border: "none", outline: "none",
              padding: "20px 26px", fontSize: 14, lineHeight: 1.9,
              color: "var(--ink)", background: "transparent",
              fontFamily: "inherit", boxSizing: "border-box", minHeight: 480,
            }}
          />
        )}

        {/* ── Footer ── */}
        <div style={{
          padding: "10px 20px", borderTop: "1px solid var(--line)",
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          {isInReview ? (
            <span style={{ flex: 1, fontSize: 11, color: "var(--ink-soft)" }}>
              {isInFeedbackReview
                ? `${fd.annotations.length} issue${fd.annotations.length !== 1 ? "s" : ""} · tap a highlight`
                : `${sd.suggestions.length} rewrite${sd.suggestions.length !== 1 ? "s" : ""} · tap a highlight`}
            </span>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 700, color: charColor(chars, q.limit), flex: 1 }}>
              {chars.toLocaleString()} / {q.limit.toLocaleString()} chars
              {chars > q.limit && <span style={{ marginLeft: 6 }}>({chars - q.limit} over)</span>}
            </span>
          )}
          <button type="button" onClick={() => callAI(q.id, "feedback")} disabled={!!isLoading || chars < 40}
            style={btnStyle(isInFeedbackReview || (panel === "feedback" && hasFbText), !!isLoading || chars < 40, q.color)}>
            {isLoading === "feedback" ? "Analysing…" : "Feedback"}
          </button>
          <button type="button" onClick={() => callAI(q.id, "suggest")} disabled={!!isLoading || chars < 40}
            style={btnStyle(isInSuggestReview || (panel === "suggest" && hasSugText), !!isLoading || chars < 40, q.color)}>
            {isLoading === "suggest" ? "Thinking…" : "Suggest rewrites"}
          </button>
        </div>

        {/* ── Bottom panel: loading / plain fallback ── */}
        {showBottom && (
          <div style={{
            borderTop: "1px solid var(--line)", padding: "14px 20px",
            background: q.tint, flexShrink: 0, maxHeight: 180, overflowY: "auto",
          }}>
            {isLoading ? (
              <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                {isLoading === "suggest" ? "Finding weak phrases…" : "Analysing your writing…"} this takes a few seconds.
              </p>
            ) : (hasFbText || hasSugText) ? (
              <p style={{ fontSize: 13, lineHeight: 1.65, margin: 0, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                {hasFbText ? feedbackText[active] : suggestText[active]}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
