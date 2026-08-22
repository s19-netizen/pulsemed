"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  DIAGNOSTIC_QUESTIONS, VR_PASSAGES, QR_DATASETS, SJT_SCENARIOS,
  APPROP_OPTIONS, IMPORT_OPTIONS, TFCT_OPTIONS,
} from "@/lib/diagnosticData";
import { GroupedBarChart, LineGraph, PieChartPair, TheatreTable, RoomDataCard, CargoDataCard } from "../DiagCharts";
import { DiagVenn3 } from "../DiagVenn";

const COLORS: Record<string, string> = { vr: "#2D7FF9", dm: "#8B6BFF", qr: "#3DBE6C", sjt: "#FF6B5C" };
const TINTS: Record<string, string>  = { vr: "#EAF2FF", dm: "#F1ECFF", qr: "#EDFBF3", sjt: "#FFEDEA" };
const FULL: Record<string, string>   = { vr: "Verbal Reasoning", dm: "Decision Making", qr: "Quantitative Reasoning", sjt: "Situational Judgement" };
const MAX_RAW: Record<string, number> = { vr: 20, dm: 24, qr: 18 };

type SubtypeScore = { correct: number; total: number; rawPts: number; maxPts: number; label: string; section: string };
type Report = {
  vr_score: number; dm_score: number; qr_score: number; total_score: number;
  sjt_band: number;
  subtype_scores: Record<string, SubtypeScore>;
  groq_analysis: string; groq_study_plan: string;
  created_at: string;
};
type ResponseRow = {
  question_index: number;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
};

type AiSubtypeItem = { subtype: string; score: string; missedMarks?: number };
type AiSection = { verdict: string; strong?: AiSubtypeItem[]; weak?: AiSubtypeItem[]; band?: number };
type StructuredAnalysis = { sections: Record<string, AiSection>; overallVerdict?: string };
type WeekTask = { title: string; focus: string; tasks: string[] };

const CLASSIFICATIONS = [
  { min: 2400, label: "Exceptional",                color: "#3DBE6C" },
  { min: 2250, label: "Very strong",                color: "#3DBE6C" },
  { min: 2100, label: "Strong",                     color: "#2D7FF9" },
  { min: 1950, label: "Developing well",            color: "#2D7FF9" },
  { min: 1800, label: "Needs targeted improvement", color: "#f59e0b" },
  { min: 0,    label: "Priority development",       color: "#FF6B5C" },
];

function perfColor(pct: number) {
  if (pct >= 0.7) return "#3DBE6C";
  if (pct >= 0.4) return "#f59e0b";
  return "#FF6B5C";
}

function SectionCard({ sec, score, subtypes }: { sec: string; score: number; subtypes: [string, SubtypeScore][] }) {
  const raw = subtypes.reduce((s, [, v]) => s + v.rawPts, 0);
  const max = MAX_RAW[sec];
  const barPct = ((score - 300) / 600) * 100;
  const color = COLORS[sec];

  return (
    <div className="content-card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color }}>{sec.toUpperCase()}</span>
          <p style={{ fontSize: 11.5, color: "var(--ink-soft)", margin: "2px 0 0" }}>{FULL[sec]}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 22, fontWeight: 900, color }}>{score}</span>
          <span style={{ fontSize: 10, color: "var(--ink-soft)", display: "block" }}>scaled / 900</span>
        </div>
      </div>

      <div style={{ height: 5, background: "#f0f2f5", borderRadius: 3, overflow: "hidden", marginBottom: 5 }}>
        <div style={{ height: "100%", width: `${barPct}%`, background: color, borderRadius: 3 }} />
      </div>
      <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <strong style={{ color: perfColor(raw / max) }}>{raw}</strong> / {max} raw marks
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
        {subtypes.map(([k, v]) => {
          const p = v.maxPts > 0 ? v.rawPts / v.maxPts : 0;
          const c = perfColor(p);
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: "var(--ink)" }}>{v.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: c, background: c + "18", padding: "1px 7px", borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>
                {v.rawPts}/{v.maxPts}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Review components ────────────────────────────────────────────────────────

function ReviewAnswer({ q, row }: { q: typeof DIAGNOSTIC_QUESTIONS[0]; row: ResponseRow | undefined }) {
  const color = COLORS[q.section] ?? "#2D7FF9";
  const tint = TINTS[q.section] ?? "#EAF2FF";
  const answered = !!row;

  if (q.format === "multi") {
    const userSel: boolean[] | null = (() => {
      if (!row) return null;
      try { return JSON.parse(row.selected_answer); } catch { return null; }
    })();
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(q.statements ?? []).map((stmt, i) => {
          const userAns = userSel ? userSel[i] : null;
          const correctAns = q.correctStatements?.[i] ?? false;
          const isRight = userAns === correctAns;
          return (
            <div key={i} style={{
              background: answered ? (isRight ? "#EDFBF3" : "#FFEDEA") : "#f8f9fb",
              border: `1px solid ${answered ? (isRight ? "#3DBE6C28" : "#FF6B5C28") : "var(--line)"}`,
              borderRadius: 8, padding: "8px 12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", minWidth: 16 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "var(--ink)", flex: 1 }}>{stmt}</span>
                {answered && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: isRight ? "#3DBE6C" : "#FF6B5C", flexShrink: 0 }}>
                    {isRight ? "✓" : "✗"}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, marginLeft: 24 }}>
                {["Yes", "No"].map((opt, j) => {
                  const jBool = j === 0;
                  const isCorrect = jBool === correctAns;
                  const isSelected = answered && userSel !== null && userSel[i] === jBool;
                  return (
                    <span key={j} style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 6,
                      background: isCorrect ? "#3DBE6C" : (isSelected && !isCorrect ? "#FF6B5C" : "#edf1f6"),
                      color: (isCorrect || (isSelected && !isCorrect)) ? "white" : "var(--ink-soft)",
                    }}>{opt}</span>
                  );
                })}
                {!answered && <span style={{ fontSize: 11, color: "var(--ink-soft)", fontStyle: "italic" }}>not answered</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (q.format === "mostleast") {
    const userML: { most: number | null; least: number | null } | null = (() => {
      if (!row) return null;
      try { return JSON.parse(row.selected_answer); } catch { return null; }
    })();
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(q.factors ?? []).map((factor, i) => {
          const isMost = i === q.correctMost;
          const isLeast = i === q.correctLeast;
          const userMost = userML?.most === i;
          const userLeast = userML?.least === i;
          const correctAnswer = isMost || isLeast;
          const userCorrectHere = (userMost && isMost) || (userLeast && isLeast);
          const userWrongHere = answered && ((userMost && !isMost) || (userLeast && !isLeast));
          return (
            <div key={i} style={{
              background: correctAnswer ? "#EDFBF3" : "#f8f9fb",
              border: `1px solid ${correctAnswer ? "#3DBE6C28" : "var(--line)"}`,
              borderRadius: 8, padding: "8px 12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", minWidth: 18 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                <span style={{ fontSize: 13, color: "var(--ink)", flex: 1 }}>{factor}</span>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {isMost && <span style={{ fontSize: 10, fontWeight: 700, background: "#3DBE6C", color: "white", borderRadius: 4, padding: "1px 7px" }}>MOST ✓</span>}
                  {isLeast && <span style={{ fontSize: 10, fontWeight: 700, background: "#2D7FF9", color: "white", borderRadius: 4, padding: "1px 7px" }}>LEAST ✓</span>}
                  {answered && userMost && !isMost && <span style={{ fontSize: 10, fontWeight: 700, background: "#FF6B5C", color: "white", borderRadius: 4, padding: "1px 7px" }}>your MOST ✗</span>}
                  {answered && userLeast && !isLeast && <span style={{ fontSize: 10, fontWeight: 700, background: "#FF6B5C28", color: "#FF6B5C", borderRadius: 4, padding: "1px 7px" }}>your LEAST ✗</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // MCQ / TFCT / Approp / Import
  const userIdx = (() => {
    if (!row) return null;
    const n = parseInt(row.selected_answer, 10);
    return isNaN(n) ? null : n;
  })();
  const correctIdx = q.correct ?? 0;
  const opts = q.format === "tfct" ? TFCT_OPTIONS : q.format === "approp" ? APPROP_OPTIONS : q.format === "import" ? IMPORT_OPTIONS : (q.options ?? []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {opts.map((opt, i) => {
        const isCorrect = i === correctIdx;
        const isSelected = answered && userIdx === i;
        const wrong = isSelected && !isCorrect;
        return (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "9px 12px", borderRadius: 10,
            background: isCorrect ? "#EDFBF3" : (wrong ? "#FFEDEA" : "#f8f9fb"),
            border: `1.5px solid ${isCorrect ? "#3DBE6C" : (wrong ? "#FF6B5C" : "#edf1f6")}`,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6, fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: isCorrect ? "#3DBE6C" : (wrong ? "#FF6B5C" : "#edf1f6"),
              color: (isCorrect || wrong) ? "white" : "var(--ink-soft)",
            }}>
              {String.fromCharCode(65 + i)}
            </span>
            <span style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink)", flex: 1 }}>{opt}</span>
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              {isCorrect && <span style={{ fontSize: 10, fontWeight: 700, color: "#3DBE6C" }}>✓ correct</span>}
              {wrong && <span style={{ fontSize: 10, fontWeight: 700, color: "#FF6B5C" }}>✗ your answer</span>}
              {!answered && i === correctIdx && <span style={{ fontSize: 10, color: "#3DBE6C", fontWeight: 700 }}>✓</span>}
            </div>
          </div>
        );
      })}
      {!answered && <p style={{ fontSize: 11, color: "var(--ink-soft)", fontStyle: "italic", margin: 0 }}>Not answered</p>}
    </div>
  );
}

function ReviewQuestion({ q, row, idx }: { q: typeof DIAGNOSTIC_QUESTIONS[0]; row: ResponseRow | undefined; idx: number }) {
  const [open, setOpen] = useState(true);
  const color = COLORS[q.section] ?? "#2D7FF9";
  const isCorrect = row?.is_correct;
  const answered = !!row;

  return (
    <div
      id={`review-q-${q.qNum}`}
      style={{
        border: `1.5px solid ${answered ? (isCorrect ? "#3DBE6C28" : "#FF6B5C28") : "var(--line)"}`,
        borderRadius: 12, overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", background: answered ? (isCorrect ? "#EDFBF3" : "#FFEDEA") : "#f8f9fb",
          border: 0, cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          fontSize: 11, fontWeight: 900, minWidth: 28, height: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 5, flexShrink: 0,
          background: color + "20", color,
        }}>Q{idx + 1}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", flex: 1, textAlign: "left" }}>
          {q.stem.replace(/^How appropriate is the following action\?\n\n/, "").replace(/^How important.*?:\n\n/, "").replace(/^When.*?:\n\n/, "").slice(0, 80)}
          {q.stem.length > 80 ? "…" : ""}
        </span>
        {answered && (
          <span style={{ fontSize: 11, fontWeight: 700, color: isCorrect ? "#3DBE6C" : "#FF6B5C", flexShrink: 0 }}>
            {isCorrect ? "✓ Correct" : "✗ Wrong"}
          </span>
        )}
        <span style={{ fontSize: 12, color: "var(--ink-soft)", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "14px 14px 16px" }}>
          {/* Stem */}
          {q.preamble && (
            <div style={{ background: "#f8f9fb", borderRadius: 8, padding: "10px 13px", marginBottom: 10, fontSize: 12.5, lineHeight: 1.65, color: "var(--ink)", whiteSpace: "pre-line" }}>
              {q.preamble}
            </div>
          )}
          <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.65, color: "var(--ink)", margin: "0 0 12px", whiteSpace: "pre-line" }}>
            {q.stem}
          </p>

          {/* Answer options */}
          <ReviewAnswer q={q} row={row} />

          {/* Explanation */}
          {q.explanation && (
            <div style={{ marginTop: 14, padding: "12px 14px", background: "#f0f4ff", borderRadius: 10, borderLeft: `3px solid ${color}` }}>
              <p style={{ fontSize: 10, fontWeight: 800, color, margin: "0 0 5px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Walkthrough</p>
              <WalkthroughText text={q.explanation} color={color} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewSection({ section, responseMap }: { section: string; responseMap: Map<number, ResponseRow> }) {
  const color = COLORS[section];
  const qs = DIAGNOSTIC_QUESTIONS.filter(q => q.section === section);
  const correct = qs.filter(q => responseMap.get(q.qNum - 1)?.is_correct).length;
  const total = qs.length;

  if (section === "vr") {
    const passageIds = [...new Set(qs.map(q => q.passageId).filter(Boolean))];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color, background: color + "18", borderRadius: 6, padding: "3px 10px" }}>VR</span>
          <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: "var(--ink)" }}>Verbal Reasoning</h3>
          <span style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: "auto" }}>{correct}/{total} correct</span>
        </div>
        {passageIds.map(pId => {
          const passage = pId ? VR_PASSAGES[pId] : null;
          const pQs = qs.filter(q => q.passageId === pId);
          return (
            <div key={pId} style={{ marginBottom: 16 }}>
              {passage && (
                <PassageBox title={passage.title} text={passage.text} />
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pQs.map(q => <ReviewQuestion key={q.id} q={q} row={responseMap.get(q.qNum - 1)} idx={q.qNum - 1} />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (section === "qr") {
    const datasetIds = [...new Set(qs.map(q => q.dataSetId).filter(Boolean))];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color, background: color + "18", borderRadius: 6, padding: "3px 10px" }}>QR</span>
          <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: "var(--ink)" }}>Quantitative Reasoning</h3>
          <span style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: "auto" }}>{correct}/{total} correct</span>
        </div>
        {datasetIds.map(dsId => {
          const ds = dsId ? QR_DATASETS[dsId] : null;
          const dsQs = qs.filter(q => q.dataSetId === dsId);
          return (
            <div key={dsId} style={{ marginBottom: 16 }}>
              {ds && (
                <div style={{ background: "#f8f9fb", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Data set — {ds.title}</p>
                  <p style={{ fontSize: 13, color: "var(--ink)", margin: 0, lineHeight: 1.55 }}>{ds.description}</p>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dsQs.map(q => <ReviewQuestion key={q.id} q={q} row={responseMap.get(q.qNum - 1)} idx={q.qNum - 1} />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (section === "sjt") {
    const scenarioIds = [...new Set(qs.map(q => q.scenarioId).filter(Boolean))];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color, background: color + "18", borderRadius: 6, padding: "3px 10px" }}>SJT</span>
          <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: "var(--ink)" }}>Situational Judgement</h3>
          <span style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: "auto" }}>{correct}/{total} correct</span>
        </div>
        {scenarioIds.map(sId => {
          const scenario = sId ? SJT_SCENARIOS[sId] : null;
          const sQs = qs.filter(q => q.scenarioId === sId);
          return (
            <div key={sId} style={{ marginBottom: 16 }}>
              {scenario && (
                <PassageBox title={scenario.title} text={scenario.text} />
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sQs.map(q => <ReviewQuestion key={q.id} q={q} row={responseMap.get(q.qNum - 1)} idx={q.qNum - 1} />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // DM — flat list with preambles inline
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color, background: color + "18", borderRadius: 6, padding: "3px 10px" }}>DM</span>
        <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: "var(--ink)" }}>Decision Making</h3>
        <span style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: "auto" }}>{correct}/{total} correct</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {qs.map(q => <ReviewQuestion key={q.id} q={q} row={responseMap.get(q.qNum - 1)} idx={q.qNum - 1} />)}
      </div>
    </div>
  );
}

function PassageBox({ title, text }: { title: string; text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "#f8f9fb", border: "1px solid var(--line)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", flex: 1 }}>{title}</span>
        <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{expanded ? "Hide ▲" : "Read ▼"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "0 14px 14px", fontFamily: "Georgia, serif", fontSize: 13.5, lineHeight: 1.85, color: "#334354", whiteSpace: "pre-line" }}>
          {text}
        </div>
      )}
    </div>
  );
}

// ─── Review: walkthrough formatter ───────────────────────────────────────────

function inlineMath(text: string, color: string): React.ReactNode {
  const regex = /⌊[^⌋]+⌋(?:\s*=\s*[\d,.]+)?|£[\d,]+(?:\.\d+)?(?:\s*(?:[+\-×÷]\s*£?[\d,]+(?:\.\d+)?)+)?(?:\s*=\s*£?[\d,]+(?:\.\d+)?)?|[\d,]+(?:\.\d+)?(?:\s*(?:%|kg|cm|t\b|s\b))?(?:\s*(?:[×÷+\-=])\s*[\d£,]+(?:\.\d+)?(?:\s*(?:%|kg|cm|t\b))?)+|[\d,]+(?:\.\d+)?%/g;
  const parts: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={`t${m.index}`}>{text.slice(last, m.index)}</span>);
    parts.push(<mark key={`m${m.index}`} style={{ background: color + "18", color, fontWeight: 700, padding: "0 4px", borderRadius: 3, fontFamily: "ui-monospace, monospace", fontSize: 12, fontStyle: "normal" }}>{m[0]}</mark>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key="tail">{text.slice(last)}</span>);
  return parts.length ? <>{parts}</> : <>{text}</>;
}

function WalkthroughText({ text, color }: { text: string; color: string }) {
  const steps = text.trim()
    .split(/\.\s+(?=[A-Z\d⌊£"'])/)
    .map(s => s.replace(/\.$/, "").trim())
    .filter(s => s.length > 3);

  if (steps.length <= 1) {
    return <p style={{ fontSize: 13, lineHeight: 1.75, margin: 0 }}>{inlineMath(text.trim(), color)}</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ minWidth: 22, height: 22, borderRadius: 6, background: color + "20", color, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            {i + 1}
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink)" }}>
            {inlineMath(step, color)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Review: figure renderer ─────────────────────────────────────────────────

function ReviewFigure({ q }: { q: typeof DIAGNOSTIC_QUESTIONS[0] }) {
  const ds = q.dataSetId ? QR_DATASETS[q.dataSetId] : null;
  if (!ds) return null;
  if (ds.figureType === "grouped-bar") return <GroupedBarChart data={ds.figureData as any} />;
  if (ds.figureType === "line")        return <LineGraph       data={ds.figureData as any} />;
  if (ds.figureType === "pie-pair")    return <PieChartPair    data={ds.figureData as any} />;
  if (ds.figureType === "table")       return <TheatreTable    data={ds.figureData as any} />;
  if (ds.figureType === "room")        return <RoomDataCard    data={ds.figureData as any} />;
  if (ds.figureType === "cargo")       return <CargoDataCard   data={ds.figureData as any} />;
  return null;
}

// ─── Review: exam-style two-column question view ──────────────────────────────

function ReviewExam({ section, qIdx, onQIdxChange, responseMap }: {
  section: string;
  qIdx: number;
  onQIdxChange: (i: number) => void;
  responseMap: Map<number, ResponseRow>;
}) {
  const qs = DIAGNOSTIC_QUESTIONS.filter(q => q.section === section);
  const q  = qs[qIdx];
  if (!q) return null;

  const row      = responseMap.get(q.qNum - 1);
  const color    = COLORS[section] ?? "#2D7FF9";
  const tint     = TINTS[section]  ?? "#EAF2FF";

  // ── Left panel ──
  let leftLabel = "";
  let leftContent: React.ReactNode = null;

  if (section === "vr") {
    const passage = q.passageId ? VR_PASSAGES[q.passageId] : null;
    const allIds  = [...new Set(qs.map(x => x.passageId).filter(Boolean))];
    const num     = q.passageId ? allIds.indexOf(q.passageId) + 1 : 1;
    leftLabel   = `PASSAGE ${num} OF ${allIds.length}${passage ? ` — ${passage.title}` : ""}`;
    leftContent = <div style={{ whiteSpace: "pre-wrap" }}>{passage?.text}</div>;
  } else if (section === "qr") {
    const ds     = q.dataSetId ? QR_DATASETS[q.dataSetId] : null;
    const allIds = [...new Set(qs.map(x => x.dataSetId).filter(Boolean))];
    const num    = q.dataSetId ? allIds.indexOf(q.dataSetId) + 1 : 1;
    leftLabel   = `DATA SET ${num} OF ${allIds.length}${ds ? ` — ${ds.title.toUpperCase()}` : ""}`;
    leftContent = (
      <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13 }}>
        {ds?.description && <p style={{ color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.5 }}>{ds.description}</p>}
        <ReviewFigure q={q} />
      </div>
    );
  } else if (section === "sjt") {
    const scenario = q.scenarioId ? SJT_SCENARIOS[q.scenarioId] : null;
    const allIds   = [...new Set(qs.map(x => x.scenarioId).filter(Boolean))];
    const num      = q.scenarioId ? allIds.indexOf(q.scenarioId) + 1 : 1;
    leftLabel   = `SCENARIO ${num} OF ${allIds.length}${scenario ? ` — ${scenario.title.toUpperCase()}` : ""}`;
    leftContent = <div style={{ whiteSpace: "pre-wrap" }}>{scenario?.text}</div>;
  } else {
    leftLabel   = "INFO";
    leftContent = (
      <>
        {q.preamble && <div style={{ whiteSpace: "pre-wrap" }}>{q.preamble}</div>}
        {q.vennFigure && <DiagVenn3 fig={q.vennFigure} />}
      </>
    );
  }

  // ── Answer state ──
  const userIdx = (() => { if (!row) return null; const n = parseInt(row.selected_answer, 10); return isNaN(n) ? null : n; })();
  const userML: { most: number | null; least: number | null } | null = (() => {
    if (!row || q.format !== "mostleast") return null;
    try { return JSON.parse(row.selected_answer); } catch { return null; }
  })();
  const userSel: boolean[] | null = (() => {
    if (!row || q.format !== "multi") return null;
    try { return JSON.parse(row.selected_answer); } catch { return null; }
  })();
  const correctIdx = q.correct ?? 0;
  const opts = q.format === "tfct" ? TFCT_OPTIONS : q.format === "approp" ? APPROP_OPTIONS : q.format === "import" ? IMPORT_OPTIONS : (q.options ?? []);
  const gridCols   = "1fr 1.6fr";

  return (
    <div style={{ marginTop: 12 }}>
      <div className="question-columns" style={{ gridTemplateColumns: gridCols }}>

        {/* ── Left: passage / data / scenario / preamble ── */}
        <div className="question-context" style={{ maxHeight: "calc(100vh - 270px)", overflowY: "auto" }}>
          <p style={{ color }}>{leftLabel}</p>
          {leftContent}
        </div>

        {/* ── Right: question + revealed answers + walkthrough ── */}
        <div className="question-answer" style={{ display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 270px)", overflowY: "auto" }}>
          <p style={{ color }}>QUESTION</p>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color, background: tint, padding: "3px 10px", borderRadius: 4 }}>{q.qNum}</span>
            {row  && <span style={{ fontSize: 11, fontWeight: 700, color: row.is_correct ? "#3DBE6C" : "#FF6B5C" }}>{row.is_correct ? "✓ Correct" : "✗ Wrong"}</span>}
            {!row && <span style={{ fontSize: 11, color: "var(--ink-soft)", fontStyle: "italic" }}>Not answered</span>}
          </div>

          {q.preamble && section !== "dm" && (
            <div style={{ background: "#f8f9fb", borderRadius: 8, padding: "10px 13px", marginBottom: 10, fontSize: 13, lineHeight: 1.65, color: "var(--ink)", whiteSpace: "pre-line" }}>
              {q.preamble}
            </div>
          )}

          <h2 style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 15, lineHeight: 1.55, margin: "0 0 14px", fontWeight: 700 }}>{q.stem}</h2>

          {/* MCQ / TFCT / Approp / Import */}
          {(q.format === "mcq" || q.format === "tfct" || q.format === "approp" || q.format === "import") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {opts.map((opt, i) => {
                const isCorrect  = i === correctIdx;
                const isSelected = row && userIdx === i;
                const wrong      = isSelected && !isCorrect;
                return (
                  <div key={i} style={{
                    display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 13px", borderRadius: 10,
                    background: isCorrect ? "#EDFBF3" : wrong ? "#FFEDEA" : "#f8f9fb",
                    border: `1.5px solid ${isCorrect ? "#3DBE6C" : wrong ? "#FF6B5C" : "#edf1f6"}`,
                  }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isCorrect ? "#3DBE6C" : wrong ? "#FF6B5C" : "#edf1f6", color: (isCorrect || wrong) ? "white" : "var(--ink-soft)" }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ fontSize: 13, lineHeight: 1.55, flex: 1 }}>{opt}</span>
                    {isCorrect && <span style={{ fontSize: 10, fontWeight: 700, color: "#3DBE6C", flexShrink: 0 }}>✓ correct</span>}
                    {wrong      && <span style={{ fontSize: 10, fontWeight: 700, color: "#FF6B5C", flexShrink: 0 }}>✗ your answer</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Multi Yes/No */}
          {q.format === "multi" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(q.statements ?? []).map((stmt, i) => {
                const correctAns = q.correctStatements?.[i] ?? false;
                const userAns    = userSel ? userSel[i] : null;
                const isRight    = row ? userAns === correctAns : null;
                return (
                  <div key={i} style={{ background: isRight === null ? "#f8f9fb" : isRight ? "#EDFBF3" : "#FFEDEA", border: `1px solid ${isRight === null ? "var(--line)" : isRight ? "#3DBE6C40" : "#FF6B5C40"}`, borderRadius: 8, padding: "8px 12px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 13 }}>{i + 1}. {stmt}</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["Yes", "No"].map((opt, j) => {
                        const jBool     = j === 0;
                        const isCor     = jBool === correctAns;
                        const isSel     = row && userSel !== null && userSel[i] === jBool;
                        return <span key={j} style={{ fontSize: 11, fontWeight: 700, padding: "2px 12px", borderRadius: 6, background: isCor ? "#3DBE6C" : (isSel && !isCor) ? "#FF6B5C" : "#edf1f6", color: (isCor || (isSel && !isCor)) ? "white" : "var(--ink-soft)" }}>{opt}</span>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Most / Least */}
          {q.format === "mostleast" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(q.factors ?? []).map((factor, i) => {
                const isMost  = i === q.correctMost;
                const isLeast = i === q.correctLeast;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: (isMost || isLeast) ? "#EDFBF3" : "#f8f9fb", border: `1px solid ${(isMost || isLeast) ? "#3DBE6C40" : "var(--line)"}`, borderRadius: 8, padding: "9px 12px" }}>
                    <span style={{ fontWeight: 800, fontSize: 11, color: "var(--ink-soft)", minWidth: 18 }}>{String.fromCharCode(65 + i)}.</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{factor}</span>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {isMost  && <span style={{ fontSize: 10, fontWeight: 700, background: "#3DBE6C", color: "white",    borderRadius: 4, padding: "2px 7px" }}>MOST ✓</span>}
                      {isLeast && <span style={{ fontSize: 10, fontWeight: 700, background: "#2D7FF9", color: "white",    borderRadius: 4, padding: "2px 7px" }}>LEAST ✓</span>}
                      {row && userML?.most  === i && !isMost  && <span style={{ fontSize: 10, fontWeight: 700, background: "#FF6B5C",   color: "white",   borderRadius: 4, padding: "2px 7px" }}>your MOST ✗</span>}
                      {row && userML?.least === i && !isLeast && <span style={{ fontSize: 10, fontWeight: 700, background: "#FF6B5C28", color: "#FF6B5C", borderRadius: 4, padding: "2px 7px" }}>your LEAST ✗</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Walkthrough */}
          {q.explanation && (
            <div style={{ marginTop: 14, padding: "12px 14px", background: "#f0f4ff", borderRadius: 10, borderLeft: `3px solid ${color}` }}>
              <p style={{ fontSize: 10, fontWeight: 800, color, margin: "0 0 5px", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Walkthrough</p>
              <WalkthroughText text={q.explanation} color={color} />
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Prev / Next */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <button
              onClick={() => onQIdxChange(qIdx - 1)} disabled={qIdx === 0}
              style={{ minHeight: 40, padding: "0 20px", borderRadius: 10, border: "1.5px solid var(--line)", background: "white", fontWeight: 700, fontSize: 13, cursor: qIdx === 0 ? "not-allowed" : "pointer", opacity: qIdx === 0 ? 0.4 : 1 }}
            >← Back</button>
            <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>Q{qIdx + 1} of {qs.length}</span>
            <button
              onClick={() => onQIdxChange(qIdx + 1)} disabled={qIdx === qs.length - 1}
              style={{ minHeight: 40, padding: "0 20px", borderRadius: 10, border: 0, background: color, color: "white", fontWeight: 700, fontSize: 13, cursor: qIdx === qs.length - 1 ? "not-allowed" : "pointer", opacity: qIdx === qs.length - 1 ? 0.4 : 1 }}
            >Next →</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DiagnosticResults({ report, responses }: { report: Report; responses: ResponseRow[] }) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "review">("results");
  const [reviewSection, setReviewSection] = useState<string>("vr");
  const [reviewQIdx, setReviewQIdx] = useState(0);

  async function handleRetake() {
    setResetting(true);
    await fetch("/api/diagnostic/reset", { method: "DELETE" });
    router.push("/diagnostic");
  }

  const responseMap = useMemo(() => {
    const m = new Map<number, ResponseRow>();
    for (const r of responses) m.set(r.question_index, r);
    return m;
  }, [responses]);

  const bandColours = ["", "#3DBE6C", "#2D7FF9", "#f59e0b", "#FF6B5C"];
  const bandLabels  = ["", "Band 1", "Band 2", "Band 3", "Band 4"];
  const sjtColor = bandColours[report.sjt_band];
  const sjtLabel = bandLabels[report.sjt_band];

  const cls = CLASSIFICATIONS.find(c => report.total_score >= c.min) ?? CLASSIFICATIONS[CLASSIFICATIONS.length - 1];

  const bySection: Record<string, [string, SubtypeScore][]> = { vr: [], dm: [], qr: [], sjt: [] };
  for (const [k, v] of Object.entries(report.subtype_scores)) {
    const sec = k.split("-")[0];
    if (bySection[sec]) bySection[sec].push([k, v]);
  }

  const allSubs = Object.entries(report.subtype_scores).filter(([, v]) => v.maxPts > 0);
  const byperf = [...allSubs].sort((a, b) => (b[1].rawPts / b[1].maxPts) - (a[1].rawPts / a[1].maxPts));
  const strengths  = byperf.filter(([, v]) => v.rawPts / v.maxPts >= 0.7).slice(0, 4);
  const priorities = [...byperf].reverse().slice(0, 4);

  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const ringPct = (report.total_score - 900) / 1800;
  const dashOffset = circ * (1 - Math.max(0, Math.min(1, ringPct)));

  let structuredAnalysis: StructuredAnalysis | null = null;
  let structuredWeeks: WeekTask[] | null = null;

  try {
    const parsed = JSON.parse(report.groq_analysis);
    if (parsed?.sections) structuredAnalysis = parsed;
  } catch {}

  try {
    const parsed = JSON.parse(report.groq_study_plan);
    if (Array.isArray(parsed) && parsed.length > 0) structuredWeeks = parsed;
  } catch {}

  const isFallback = report.groq_analysis?.startsWith("Your diagnostic is complete. VR:");
  const rawAnalysis = !structuredAnalysis && !isFallback ? (report.groq_analysis ?? "") : "";
  const insightItems = rawAnalysis
    ? rawAnalysis.replace(/\n+/g, " ").split(/\.\s+(?=[A-Z"'])/)
        .map(s => s.trim()).filter(s => s.length > 15)
        .map(s => (s.endsWith(".") || s.endsWith("!") || s.endsWith("?")) ? s : s + ".")
    : [];

  function detectSection(text: string): "vr" | "dm" | "qr" | "sjt" | null {
    const u = text.toUpperCase();
    if (/\bVR\b/.test(u) || u.includes("VERBAL")) return "vr";
    if (/\bDM\b/.test(u) || u.includes("DECISION")) return "dm";
    if (/\bQR\b/.test(u) || u.includes("QUANTITATIVE")) return "qr";
    if (/\bSJT\b/.test(u) || u.includes("SITUATIONAL")) return "sjt";
    return null;
  }

  const planBlocks: { title: string; body: string }[] = [];
  if (!structuredWeeks && report.groq_study_plan) {
    const chunks = report.groq_study_plan.split(/\*\*(?=Week)/i);
    for (const chunk of chunks) {
      const m = chunk.match(/^([^*]+)\*\*([\s\S]*)$/);
      if (m) planBlocks.push({ title: m[1].trim(), body: m[2].trim() });
      else if (chunk.trim()) planBlocks.push({ title: "", body: chunk.trim() });
    }
  }

  const sjtRaw = bySection.sjt.reduce((s, [, v]) => s + v.rawPts, 0);
  const sjtMax = bySection.sjt.reduce((s, [, v]) => s + v.maxPts, 0);

  return (
    <div style={{ maxWidth: activeTab === "review" ? "none" : 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Tab switcher ── */}
      <div style={{ display: "flex", gap: 0, background: "#f0f2f5", borderRadius: 12, padding: 3, width: "fit-content" }}>
        {(["results", "review"] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "7px 20px", borderRadius: 10, border: 0, cursor: "pointer",
              fontSize: 13, fontWeight: 700,
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "var(--ink)" : "var(--ink-soft)",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {tab === "results" ? "Results" : "Review answers"}
          </button>
        ))}
      </div>

      {activeTab === "results" && (
        <>
          {/* ── Hero ── */}
          <div style={{ background: "linear-gradient(135deg, #1a2744 0%, #0f172a 100%)", borderRadius: 16, padding: "26px 28px", color: "white", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0, position: "relative", width: 116, height: 116 }}>
              <svg width="116" height="116" viewBox="0 0 116 116" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="58" cy="58" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                <circle cx="58" cy="58" r={radius} fill="none" stroke={cls.color} strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <strong style={{ fontSize: 20, fontWeight: 900, color: cls.color, lineHeight: 1 }}>{report.total_score}</strong>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>/ 2700</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", margin: "0 0 4px" }}>DIAGNOSTIC COMPLETE</p>
              <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "white" }}>Your UCAT baseline</h1>
              <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: cls.color + "28", color: cls.color, marginBottom: 12 }}>
                {cls.label}
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["vr", "dm", "qr"] as const).map(s => {
                  const raw = bySection[s].reduce((a, [, v]) => a + v.rawPts, 0);
                  const scoreVal = report[`${s}_score` as "vr_score" | "dm_score" | "qr_score"];
                  return (
                    <span key={s} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                      {s.toUpperCase()} {scoreVal} <span style={{ opacity: 0.5 }}>({raw}/{MAX_RAW[s]})</span>
                    </span>
                  );
                })}
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: sjtColor + "28", color: sjtColor, fontWeight: 700 }}>
                  SJT {sjtLabel} <span style={{ opacity: 0.7 }}>({sjtRaw}/{sjtMax} pts)</span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  onClick={handleRetake}
                  disabled={resetting}
                  style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", opacity: resetting ? 0.5 : 1 }}
                >
                  {resetting ? "Resetting…" : "↺ Retake diagnostic"}
                </button>
                <button
                  onClick={() => setActiveTab("review")}
                  style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}
                >
                  Review answers →
                </button>
              </div>
            </div>
          </div>

          {/* ── Performance insights (structured JSON) ── */}
          {structuredAnalysis && (
            <div className="content-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 24, height: 24, background: "#f4f7fb", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </span>
                <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Performance insights</h3>
              </div>

              {structuredAnalysis.overallVerdict && (
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)", margin: "0 0 16px", padding: "10px 14px", background: "#F8F9FB", borderRadius: 10, borderLeft: "3px solid #94A3B8" }}>
                  {structuredAnalysis.overallVerdict}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(["vr", "dm", "qr", "sjt"] as const).map(sec => {
                  const s = structuredAnalysis!.sections[sec];
                  if (!s) return null;
                  const color = COLORS[sec];
                  const tint = TINTS[sec];
                  return (
                    <div key={sec} style={{ background: tint, borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${color}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", color, background: color + "28", borderRadius: 4, padding: "2px 7px" }}>
                          {sec.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)" }}>{FULL[sec]}</span>
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink)", margin: "0 0 10px" }}>{s.verdict}</p>
                      {((s.strong?.length ?? 0) > 0 || (s.weak?.length ?? 0) > 0) && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {s.strong?.map((item, i) => (
                            <span key={`s${i}`} style={{ fontSize: 11, fontWeight: 700, color: "#3DBE6C", background: "#EDFBF3", border: "1px solid #3DBE6C28", borderRadius: 6, padding: "3px 9px" }}>
                              ✓ {item.subtype} {item.score}
                            </span>
                          ))}
                          {s.weak?.map((item, i) => (
                            <span key={`w${i}`} style={{ fontSize: 11, fontWeight: 700, color: "#FF6B5C", background: "#FFEDEA", border: "1px solid #FF6B5C28", borderRadius: 6, padding: "3px 9px" }}>
                              ↑ {item.subtype} {item.score}{item.missedMarks != null ? ` (missed ${item.missedMarks})` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Performance insights (prose fallback) ── */}
          {!structuredAnalysis && insightItems.length > 0 && (
            <div className="content-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 24, height: 24, background: "#f4f7fb", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </span>
                <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Performance insights</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {insightItems.map((sentence, i) => {
                  const sec = detectSection(sentence);
                  const color = sec ? COLORS[sec] : "#94A3B8";
                  const tint = sec ? TINTS[sec] : "#F8F9FB";
                  return (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: tint, borderRadius: 10, padding: "10px 14px", borderLeft: `3px solid ${color}` }}>
                      {sec && <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", color, background: color + "28", borderRadius: 4, padding: "2px 6px", flexShrink: 0, marginTop: 2 }}>{sec.toUpperCase()}</span>}
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>{sentence}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Section cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {(["vr", "dm", "qr"] as const).map(sec => (
              <SectionCard key={sec} sec={sec} score={report[`${sec}_score` as "vr_score" | "dm_score" | "qr_score"]} subtypes={bySection[sec]} />
            ))}
          </div>

          {/* ── SJT ── */}
          {bySection.sjt.length > 0 && (
            <div className="content-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: COLORS.sjt }}>SJT</span>
                  <p style={{ fontSize: 11.5, color: "var(--ink-soft)", margin: "2px 0 0" }}>Situational Judgement — {sjtRaw}/{sjtMax} points</p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 900, color: sjtColor, background: sjtColor + "18", padding: "4px 14px", borderRadius: 8 }}>{sjtLabel}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6 }}>
                {bySection.sjt.map(([k, v]) => {
                  const p = v.maxPts > 0 ? v.rawPts / v.maxPts : 0;
                  const c = perfColor(p);
                  return (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f8f9fb", borderRadius: 7 }}>
                      <span style={{ fontSize: 12, color: "var(--ink)" }}>{v.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: c, marginLeft: 8 }}>{v.rawPts}/{v.maxPts}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Strengths / Priorities ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="content-card" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#3DBE6C", margin: "0 0 12px", textTransform: "uppercase" }}>Your strengths</p>
              {strengths.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0, lineHeight: 1.6 }}>No subtypes yet scoring above 70% — this diagnostic is your starting point.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {strengths.map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{v.label}</span>
                        <span style={{ fontSize: 10, color: "var(--ink-soft)", marginLeft: 6 }}>{v.section.toUpperCase()}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#3DBE6C", background: "#EDFBF3", padding: "2px 7px", borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>{v.rawPts}/{v.maxPts}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="content-card" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#FF6B5C", margin: "0 0 12px", textTransform: "uppercase" }}>Priority areas</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {priorities.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{v.label}</span>
                      <span style={{ fontSize: 10, color: "var(--ink-soft)", marginLeft: 6 }}>{v.section.toUpperCase()}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#FF6B5C", background: "#FFEDEA", padding: "2px 7px", borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>{v.rawPts}/{v.maxPts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Study plan (structured JSON) ── */}
          {structuredWeeks && structuredWeeks.length > 0 && (
            <div className="content-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 24, height: 24, background: "#eaf2ff", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D7FF9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Your 4-week study plan</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {structuredWeeks.map((week, i) => (
                  <div key={i} style={{ background: "#f8f9fb", borderRadius: 12, padding: "16px 18px", borderLeft: "3px solid #2D7FF9" }}>
                    <p style={{ fontSize: 12, fontWeight: 900, color: "#2D7FF9", margin: "0 0 3px" }}>{week.title}</p>
                    {week.focus && <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: "0 0 10px", lineHeight: 1.5 }}>{week.focus}</p>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {week.tasks.map((task, j) => (
                        <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid #2D7FF928", background: "white", flexShrink: 0, marginTop: 1 }} />
                          <p style={{ fontSize: 12, lineHeight: 1.55, color: "var(--ink)", margin: 0 }}>{task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Study plan (prose fallback) ── */}
          {!structuredWeeks && planBlocks.length > 0 && (
            <div className="content-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 24, height: 24, background: "#eaf2ff", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D7FF9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Your 4-week study plan</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {planBlocks.filter(b => b.title).map((week, i) => (
                  <div key={i} style={{ background: "#f8f9fb", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #2D7FF9" }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#2D7FF9", margin: "0 0 7px" }}>{week.title}</p>
                    <p style={{ fontSize: 12, lineHeight: 1.75, color: "var(--ink)", margin: 0, whiteSpace: "pre-wrap" }}>{week.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingBottom: 24 }}>
            <Link href="/dashboard">
              <button style={{ minHeight: 44, padding: "0 24px", background: "#2D7FF9", color: "white", border: 0, borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                Go to dashboard →
              </button>
            </Link>
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              style={{ minHeight: 44, padding: "0 24px", background: "white", color: "var(--ink)", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Review all answers
            </button>
          </div>
        </>
      )}

      {activeTab === "review" && (
        <div>
          {/* ── Sticky navigator ── */}
          <div style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg, #f5f7fa)", paddingTop: 4, paddingBottom: 10 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" as const }}>
              {(["vr", "dm", "qr", "sjt"] as const).map(sec => {
                const secQs  = DIAGNOSTIC_QUESTIONS.filter(q => q.section === sec);
                const correct = secQs.filter(q => responseMap.get(q.qNum - 1)?.is_correct).length;
                const color  = COLORS[sec];
                return (
                  <button key={sec} type="button"
                    onClick={() => { setReviewSection(sec); setReviewQIdx(0); }}
                    style={{ padding: "7px 16px", borderRadius: 10, border: "1.5px solid", borderColor: reviewSection === sec ? color : "var(--line)", background: reviewSection === sec ? color + "12" : "white", color: reviewSection === sec ? color : "var(--ink-soft)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    {sec.toUpperCase()} · {correct}/{secQs.length}
                  </button>
                );
              })}
            </div>
            <div style={{ background: "white", borderRadius: 10, border: "1px solid var(--line)", padding: "10px 12px" }}>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
                {DIAGNOSTIC_QUESTIONS.filter(q => q.section === reviewSection).map((q, idx) => {
                  const row    = responseMap.get(q.qNum - 1);
                  const bg     = !row ? "#e2e8f0" : row.is_correct ? "#3DBE6C" : "#FF6B5C";
                  const fg     = !row ? "#64748b" : "white";
                  const active = idx === reviewQIdx;
                  return (
                    <button key={q.id} type="button"
                      onClick={() => setReviewQIdx(idx)}
                      style={{ width: 28, height: 28, borderRadius: 6, background: bg, border: active ? "2.5px solid #1a2535" : "2px solid transparent", fontSize: 9, fontWeight: 800, color: fg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >{q.qNum}</button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0f2f5" }}>
                {[["#3DBE6C","Correct"],["#FF6B5C","Wrong"],["#e2e8f0","Not answered"]].map(([c,l]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--ink-soft)", fontWeight: 600 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: "inline-block" }} />{l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ReviewExam section={reviewSection} qIdx={reviewQIdx} onQIdxChange={setReviewQIdx} responseMap={responseMap} />
        </div>
      )}
    </div>
  );
}
