"use client";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DIAGNOSTIC_QUESTIONS, VR_PASSAGES, QR_DATASETS, SJT_SCENARIOS,
  APPROP_OPTIONS, IMPORT_OPTIONS, TFCT_OPTIONS,
  type DiagQuestion, type DiagSection,
} from "@/lib/diagnosticData";
import { GroupedBarChart, LineGraph, PieChartPair, TheatreTable, RoomDataCard, CargoDataCard } from "./DiagCharts";
import { DiagVenn3 } from "./DiagVenn";

// ─── Section metadata ──────────────────────────────────────────────────────────

const SECTION_ORDER: DiagSection[] = ["vr", "dm", "qr", "sjt"];

const SECTION_META: Record<DiagSection, {
  label: string; color: string; deep: string; tint: string; timeSeconds: number; count: number;
}> = {
  vr:  { label: "Verbal Reasoning",       color: "#2D7FF9", deep: "#1a5fd0", tint: "#EAF2FF", timeSeconds: 600,   count: 20 },
  dm:  { label: "Decision Making",        color: "#8B6BFF", deep: "#6747d8", tint: "#F1ECFF", timeSeconds: 1110,  count: 18 },
  qr:  { label: "Quantitative Reasoning", color: "#3DBE6C", deep: "#259650", tint: "#EDFBF3", timeSeconds: 780,   count: 18 },
  sjt: { label: "Situational Judgement",  color: "#FF6B5C", deep: "#d94b3e", tint: "#FFEDEA", timeSeconds: 780,   count: 35 },
};

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Answer state types ────────────────────────────────────────────────────────

type Answers = Record<string, number>;
type MultiAnswers = Record<string, boolean[]>;
type MostLeastAnswers = Record<string, { most: number | null; least: number | null }>;

// ─── Figure renderer ───────────────────────────────────────────────────────────

function QuestionFigure({ q }: { q: DiagQuestion }) {
  const ds = q.dataSetId ? QR_DATASETS[q.dataSetId] : null;
  if (!ds) return null;
  if (ds.figureType === "room")        return <RoomDataCard data={ds.figureData as unknown as Parameters<typeof RoomDataCard>[0]["data"]} />;
  if (ds.figureType === "grouped-bar") return <GroupedBarChart data={ds.figureData as unknown as Parameters<typeof GroupedBarChart>[0]["data"]} />;
  if (ds.figureType === "line")        return <LineGraph data={ds.figureData as unknown as Parameters<typeof LineGraph>[0]["data"]} />;
  if (ds.figureType === "pie-pair")    return <PieChartPair data={ds.figureData as unknown as Parameters<typeof PieChartPair>[0]["data"]} />;
  if (ds.figureType === "table")       return <TheatreTable data={ds.figureData as unknown as Parameters<typeof TheatreTable>[0]["data"]} />;
  if (ds.figureType === "cargo")       return <CargoDataCard data={ds.figureData as unknown as Parameters<typeof CargoDataCard>[0]["data"]} />;
  return null;
}

// ─── Multi-statement (DM Yes/No) — uses shared CSS classes ──────────────────

function MultiStatements({
  statements, multiSelected, onToggle,
}: {
  statements: string[]; multiSelected: (boolean | null)[]; onToggle: (si: number, val: boolean) => void;
}) {
  return (
    <div className="yn-set-list">
      {statements.map((stmt, si) => {
        const val = multiSelected[si] ?? null;
        return (
          <div key={si} className="yn-row">
            <div className="yn-statement">
              <span className="yn-num">{si + 1}.</span>
              <p>{stmt}</p>
            </div>
            <div className="yn-btns">
              {["Yes", "No"].map((opt, oi) => {
                const isYes = oi === 0;
                const isActive = val === isYes;
                return (
                  <button
                    key={oi}
                    className={`yn-btn${isActive ? " yn-selected" : ""}`}
                    onClick={() => onToggle(si, isYes)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Most/Least picker ────────────────────────────────────────────────────────

function MostLeastPicker({
  factors, mostSelected, leastSelected, setMostSelected, setLeastSelected,
}: {
  factors: string[];
  mostSelected: number | null;
  leastSelected: number | null;
  setMostSelected: (v: number | null) => void;
  setLeastSelected: (v: number | null) => void;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [overZone, setOverZone] = useState<"most" | "least" | null>(null);

  const handleDragStart = (e: React.DragEvent, fi: number) => {
    e.dataTransfer.setData("factorIdx", String(fi));
    e.dataTransfer.effectAllowed = "move";
    setDragging(fi);
  };

  const handleDrop = (zone: "most" | "least") => (e: React.DragEvent) => {
    e.preventDefault();
    const fi = Number(e.dataTransfer.getData("factorIdx"));
    if (zone === "most") {
      if (leastSelected === fi) setLeastSelected(null);
      setMostSelected(fi);
    } else {
      if (mostSelected === fi) setMostSelected(null);
      setLeastSelected(fi);
    }
    setDragging(null);
    setOverZone(null);
  };

  const handleClickFactor = (fi: number) => {
    if (mostSelected === fi) { setMostSelected(null); return; }
    if (leastSelected === fi) { setLeastSelected(null); return; }
    if (mostSelected === null) { setMostSelected(fi); return; }
    if (leastSelected === null) { setLeastSelected(fi); return; }
  };

  const zoneStyle = (zone: "most" | "least") => ({
    flex: 1, minHeight: 70, borderRadius: 10, padding: "12px 14px",
    border: `2px dashed ${overZone === zone ? (zone === "most" ? "#3DBE6C" : "#FF6B5C") : "#d5d8dd"}`,
    background: overZone === zone
      ? (zone === "most" ? "#EDFBF3" : "#FFEDEA")
      : zone === "most" && mostSelected !== null ? "#EDFBF3"
      : zone === "least" && leastSelected !== null ? "#FFEDEA"
      : "#fafbfc",
    transition: "all 0.15s", cursor: "default",
  } as React.CSSProperties);

  const renderZone = (zone: "most" | "least") => {
    const assigned = zone === "most" ? mostSelected : leastSelected;
    const zoneColor = zone === "most" ? "#3DBE6C" : "#FF6B5C";
    return (
      <div
        style={zoneStyle(zone)}
        onDragOver={(e) => { e.preventDefault(); setOverZone(zone); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverZone(null); }}
        onDrop={handleDrop(zone)}
      >
        <p style={{ fontSize: 10, fontWeight: 800, color: zoneColor, margin: "0 0 6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {zone === "most" ? "MOST IMPORTANT" : "LEAST IMPORTANT"}
        </p>
        {assigned !== null ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong style={{ fontSize: 12, color: zoneColor }}>{String.fromCharCode(65 + assigned)}.</strong>
            <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink)", lineHeight: 1.4 }}>{factors[assigned]}</span>
            <button
              onClick={() => zone === "most" ? setMostSelected(null) : setLeastSelected(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 15, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}
            >✕</button>
          </div>
        ) : (
          <p style={{ color: "#bbb", fontSize: 12, margin: 0 }}>Drag a factor here, or click to assign</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {renderZone("most")}
        {renderZone("least")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {factors.map((factor, fi) => {
          const isMost = mostSelected === fi;
          const isLeast = leastSelected === fi;
          return (
            <div
              key={fi}
              draggable
              onDragStart={(e) => handleDragStart(e, fi)}
              onDragEnd={() => { setDragging(null); setOverZone(null); }}
              onClick={() => handleClickFactor(fi)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderRadius: 9, cursor: "grab",
                background: isMost ? "#EDFBF3" : isLeast ? "#FFEDEA" : "#fafbfc",
                border: isMost ? "2px solid #3DBE6C" : isLeast ? "2px solid #FF6B5C" : "1.5px solid var(--line)",
                opacity: dragging === fi ? 0.4 : 1, transition: "all 0.1s", userSelect: "none",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                <circle cx="3" cy="3" r="1.2" fill="currentColor" />
                <circle cx="9" cy="3" r="1.2" fill="currentColor" />
                <circle cx="3" cy="6" r="1.2" fill="currentColor" />
                <circle cx="9" cy="6" r="1.2" fill="currentColor" />
                <circle cx="3" cy="9" r="1.2" fill="currentColor" />
                <circle cx="9" cy="9" r="1.2" fill="currentColor" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 800, color: isMost ? "#3DBE6C" : isLeast ? "#FF6B5C" : "var(--ink-soft)", minWidth: 18, flexShrink: 0 }}>
                {String.fromCharCode(65 + fi)}.
              </span>
              <p style={{ flex: 1, margin: 0, fontSize: 13, color: "var(--ink)", lineHeight: 1.45 }}>{factor}</p>
              {isMost && <span style={{ fontSize: 10, fontWeight: 800, color: "#3DBE6C", background: "#D7F8E6", padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}>MOST</span>}
              {isLeast && <span style={{ fontSize: 10, fontWeight: 800, color: "#FF6B5C", background: "#FFDEDD", padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}>LEAST</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DiagnosticTest() {
  const router = useRouter();
  const [stage, setStage] = useState<"intro" | "exam" | "break" | "submitting">("intro");

  const sectionQMap: Record<DiagSection, DiagQuestion[]> = {
    vr:  DIAGNOSTIC_QUESTIONS.filter(q => q.section === "vr"),
    dm:  DIAGNOSTIC_QUESTIONS.filter(q => q.section === "dm"),
    qr:  DIAGNOSTIC_QUESTIONS.filter(q => q.section === "qr"),
    sjt: DIAGNOSTIC_QUESTIONS.filter(q => q.section === "sjt"),
  };

  const [sectionIdx, setSectionIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);

  const [answers, setAnswers] = useState<Answers>({});
  const [multiAnswers, setMultiAnswers] = useState<MultiAnswers>({});
  const [mostLeastAnswers, setMostLeastAnswers] = useState<MostLeastAnswers>({});

  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [sectionReview, setSectionReview] = useState(false);

  const [selected, setSelected] = useState<number | null>(null);
  const [multiSelected, setMultiSelected] = useState<(boolean | null)[]>([]);
  const [mostSelected, setMostSelected] = useState<number | null>(null);
  const [leastSelected, setLeastSelected] = useState<number | null>(null);

  const [secsLeft, setSecsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState("");

  const currentSection = SECTION_ORDER[sectionIdx];
  const sectionQs = sectionQMap[currentSection];
  const q = sectionQs[qIdx];
  const meta = SECTION_META[currentSection];

  // Hide sidebar during exam/break/submitting
  useEffect(() => {
    const shouldHide = stage !== "intro";
    document.body.classList.toggle("screen-question", shouldHide);
    return () => document.body.classList.remove("screen-question");
  }, [stage]);

  useLayoutEffect(() => {
    if (!q) return;
    if (q.format === "multi") {
      const saved = multiAnswers[q.id];
      setMultiSelected(saved ? [...saved] : new Array(q.statements?.length ?? 0).fill(null));
    } else if (q.format === "mostleast") {
      setMultiSelected([]);
      const saved = mostLeastAnswers[q.id];
      setMostSelected(saved?.most ?? null);
      setLeastSelected(saved?.least ?? null);
    } else {
      setMultiSelected([]);
      setSelected(answers[q.id] !== undefined ? answers[q.id] : null);
    }
  }, [q?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceSection = useCallback(() => {
    setSectionReview(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const next = sectionIdx + 1;
    if (next >= SECTION_ORDER.length) {
      doSubmit();
    } else {
      setSectionIdx(next);
      setQIdx(0);
      setStage("break");
    }
  }, [sectionIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  function startSection() {
    const secs = SECTION_META[SECTION_ORDER[sectionIdx]].timeSeconds;
    setSecsLeft(secs);
    setStage("exam");
    timerRef.current = setInterval(() => {
      setSecsLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); advanceSection(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function commitAnswer() {
    const id = q.id;
    if (q.format === "multi") {
      setMultiAnswers(prev => ({ ...prev, [id]: multiSelected.map(v => v ?? false) }));
    } else if (q.format === "mostleast") {
      setMostLeastAnswers(prev => ({ ...prev, [id]: { most: mostSelected, least: leastSelected } }));
    } else if (selected !== null) {
      setAnswers(prev => ({ ...prev, [id]: selected }));
    }
  }

  function handleBack() {
    commitAnswer();
    setQIdx(i => i - 1);
  }

  function handleFlag() {
    setFlagged(prev => ({ ...prev, [q.id]: !prev[q.id] }));
  }

  function handleFinishSection() {
    commitAnswer();
    setSectionReview(true);
  }

  function handleNext() {
    commitAnswer();
    if (qIdx + 1 < sectionQs.length) {
      setQIdx(i => i + 1);
    } else {
      handleFinishSection();
    }
  }

  async function doSubmit() {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage("submitting");
    const id = q?.id;
    const finalAnswers = { ...answers };
    const finalMulti = { ...multiAnswers };
    const finalMostLeast = { ...mostLeastAnswers };
    if (id) {
      if (q.format === "multi") finalMulti[id] = multiSelected.map(v => v ?? false);
      else if (q.format === "mostleast") finalMostLeast[id] = { most: mostSelected, least: leastSelected };
      else if (selected !== null) finalAnswers[id] = selected;
    }
    try {
      const res = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, multiAnswers: finalMulti, mostLeastAnswers: finalMostLeast }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/diagnostic/results");
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStage("exam");
      }
    } catch {
      setError("Network error. Please try again.");
      setStage("exam");
    }
  }

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if (stage === "intro") {
    const total = DIAGNOSTIC_QUESTIONS.length;
    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div className="content-card" style={{ padding: "28px 32px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>Your diagnostic paper is ready</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
            {total} questions across all four UCAT sections, timed per section. Answer as many as you can — your results will generate a personalised study plan.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {SECTION_ORDER.map(s => {
              const m = SECTION_META[s];
              const mins = Math.floor(m.timeSeconds / 60);
              const secs = m.timeSeconds % 60;
              const timeLabel = secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
              return (
                <div key={s} style={{ padding: "14px 16px", borderRadius: 10, background: m.tint, border: `1px solid ${m.color}22` }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: m.color, letterSpacing: "0.05em" }}>{s.toUpperCase()}</span>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: "4px 0 2px", color: "var(--ink)" }}>{m.label}</p>
                  <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>{m.count} questions · {timeLabel}</p>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 16px", background: "#f5f7fa", borderRadius: 10, marginBottom: 24, fontSize: 13, color: "var(--ink-soft)", flexWrap: "wrap" }}>
            <span>⏱ 54 min 30 sec total</span>
            <span>·</span>
            <span>No negative marking</span>
            <span>·</span>
            <span>Results + AI study plan at the end</span>
          </div>
          <button
            onClick={startSection}
            style={{ minHeight: 44, padding: "0 28px", borderRadius: 10, border: 0, background: "#2D7FF9", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
          >
            Start diagnostic →
          </button>
        </div>
      </div>
    );
  }

  // ── BREAK ────────────────────────────────────────────────────────────────────
  if (stage === "break") {
    const nextMeta = SECTION_META[SECTION_ORDER[sectionIdx]];
    const doneCount = sectionIdx;
    const nextSecs = nextMeta.timeSeconds;
    const mins = Math.floor(nextSecs / 60);
    const remSecs = nextSecs % 60;
    const timeLabel = remSecs > 0 ? `${mins} min ${remSecs} sec` : `${mins} min`;
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--app-bg)", padding: 20 }}>
        <div style={{ maxWidth: 680, width: "100%" }}>
          <div className="content-card" style={{ padding: "28px 32px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: nextMeta.tint, display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={nextMeta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: "0 0 4px" }}>Section {doneCount} of 4 complete</p>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}>Next up: {nextMeta.label}</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 24px" }}>
              {nextMeta.count} questions · {timeLabel}
            </p>
            <button
              onClick={startSection}
              style={{ minHeight: 44, padding: "0 28px", borderRadius: 10, border: 0, background: nextMeta.color, color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
            >
              Start {SECTION_ORDER[sectionIdx].toUpperCase()} section →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SUBMITTING ────────────────────────────────────────────────────────────────
  if (stage === "submitting") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", background: "var(--app-bg)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EAF2FF", display: "grid", placeItems: "center" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D7FF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>We are analysing your results…</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: 0 }}>Your personalised report is being generated.<br/>This usually takes 20–30 seconds — please keep this page open.</p>
      </div>
    );
  }

  // ── EXAM ─────────────────────────────────────────────────────────────────────
  if (!q) return null;

  const color = meta.color;
  const tint = meta.tint;
  const isLastInSection = qIdx === sectionQs.length - 1;
  const isLast = isLastInSection && sectionIdx === SECTION_ORDER.length - 1;
  const timeUrgent = secsLeft <= 60;
  const isFlagged = flagged[q.id] ?? false;

  const displayOptions =
    q.format === "tfct"   ? TFCT_OPTIONS :
    q.format === "approp" ? APPROP_OPTIONS :
    q.format === "import" ? IMPORT_OPTIONS :
    q.options ?? [];

  const hasAnswer =
    q.format === "multi"     ? multiSelected.every(v => v !== null) :
    q.format === "mostleast" ? mostSelected !== null && leastSelected !== null :
    selected !== null;

  const progressPct = ((qIdx + 1) / sectionQs.length) * 100;

  const cssVars = {
    "--section": color,
    "--section-deep": meta.deep,
    "--section-tint": tint,
  } as React.CSSProperties;

  // Topbar — identical structure to practice/mock
  const TopBar = (
    <div className="question-topbar">
      <Link href="/" className="question-brand">
        <svg viewBox="0 0 48 32" aria-hidden="true">
          <path d="M2 18h9l4-13 7 24 6-18 5 7h13" />
        </svg>
        <span>Pulsemed</span>
        <i>{currentSection.toUpperCase()}</i>
        <strong>Diagnostic</strong>
      </Link>
      <div className="question-progress">
        <span>Section {sectionIdx + 1} of 4 · Q{qIdx + 1} of {sectionQs.length}</span>
        <div><i style={{ width: `${progressPct}%` }} /></div>
      </div>
      <div className="question-tools">
        <span className={`q-timer ${timeUrgent ? "q-timer--over" : "q-timer--ok"}`}>
          ⏱ {formatTime(secsLeft)}
        </span>
        <button className={isFlagged ? "flagged" : ""} onClick={handleFlag}>
          {isFlagged ? "★ Flagged" : "☆ Flag"}
        </button>
        <button onClick={advanceSection}>
          {isLast ? "Submit" : `End ${currentSection.toUpperCase()}`}
        </button>
      </div>
    </div>
  );

  // Bottom nav — identical structure to practice
  const NavBar = (
    <div className="question-actions">
      <button
        className="ghost"
        onClick={handleBack}
        disabled={qIdx === 0}
        style={{ opacity: qIdx === 0 ? 0.4 : 1 }}
      >
        ← Back
      </button>
      <button
        className="question-primary"
        onClick={isLast ? doSubmit : isLastInSection ? handleFinishSection : handleNext}
      >
        {isLast ? "Submit paper →" : isLastInSection ? `Finish ${currentSection.toUpperCase()} →` : "Next →"}
      </button>
    </div>
  );

  // Dot progress
  const DotProgress = (
    <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
      {sectionQs.map((sq, i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: (flagged[sq.id]) ? "#f59e0b" : i <= qIdx ? color : "#e5e8ed",
          opacity: i < qIdx && !flagged[sq.id] ? 0.5 : 1,
        }} />
      ))}
    </div>
  );

  // Q number chip
  function QChip() {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color, background: tint, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.02em" }}>
          {q.qNum}
        </span>
        {q.format === "multi" && (
          <span style={{ fontSize: 10, color: "#8B6BFF", fontWeight: 700 }}>YES / NO per statement · up to 2 marks</span>
        )}
        {q.format === "mostleast" && (
          <span style={{ fontSize: 10, color: "#FF6B5C", fontWeight: 700 }}>Select MOST and LEAST important · drag or click</span>
        )}
      </div>
    );
  }

  // Shared MCQ answer list — identical to practice
  const AnswerList = (
    <div className="answer-list">
      {displayOptions.map((opt, idx) => (
        <button
          key={idx}
          className={selected === idx ? "selected" : ""}
          onClick={() => setSelected(idx)}
        >
          <span>{String.fromCharCode(65 + idx)}</span>
          {opt}
        </button>
      ))}
    </div>
  );

  // ── SECTION REVIEW ─────────────────────────────────────────────────────────
  if (sectionReview) {
    return (
      <div className="question-screen" style={cssVars}>
        {TopBar}
        <div className="question-main" style={{ maxWidth: 760 }}>
          <div className="content-card" style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px" }}>Section review</h2>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                  Click any question to revisit it. When ready, continue.
                </p>
              </div>
              <button
                onClick={advanceSection}
                className="question-primary"
                style={{ minHeight: 40, padding: "0 22px", flexShrink: 0 }}
              >
                {sectionIdx === SECTION_ORDER.length - 1 ? "Submit paper →" : "Continue →"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
              {[
                { bg: color, label: "Answered", textColor: "white" },
                { bg: "#fef3c7", label: "Flagged", textColor: "#b45309" },
                { bg: "#f0f2f5", label: "Unanswered", textColor: "var(--ink-soft)" },
              ].map(({ bg, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-soft)" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 5, background: bg, display: "inline-block", flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sectionQs.map((sq, i) => {
                const isAnswered =
                  sq.format === "multi" ? multiAnswers[sq.id] !== undefined
                  : sq.format === "mostleast" ? mostLeastAnswers[sq.id] !== undefined
                  : answers[sq.id] !== undefined;
                const isFlaggedQ = flagged[sq.id];
                return (
                  <button
                    key={sq.id}
                    onClick={() => { setSectionReview(false); setQIdx(i); }}
                    style={{
                      width: 42, height: 42, borderRadius: 8,
                      border: isFlaggedQ ? "1.5px solid #f59e0b" : isAnswered ? "none" : "1.5px solid var(--line)",
                      background: isFlaggedQ ? "#fef3c7" : isAnswered ? color : "#f0f2f5",
                      color: isFlaggedQ ? "#b45309" : isAnswered ? "white" : "var(--ink-soft)",
                      fontSize: 12, fontWeight: 800, cursor: "pointer",
                    }}
                  >
                    {sq.qNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VR: passage left, question right ─────────────────────────────────────────
  if (currentSection === "vr") {
    const passage = q.passageId ? VR_PASSAGES[q.passageId] : null;
    const allPassageIds = Array.from(new Set(sectionQs.map(x => x.passageId).filter(Boolean)));
    const passageNum = q.passageId ? allPassageIds.indexOf(q.passageId) + 1 : 1;

    return (
      <div className="question-screen" style={cssVars}>
        {TopBar}
        <div className="question-main" style={{ width: "min(1440px, calc(100% - 40px))" }}>
          <div className="question-columns" style={{ gridTemplateColumns: "1.75fr 1fr" }}>
            <div className="question-context" style={{ overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
              <p>PASSAGE {passageNum} OF {allPassageIds.length}{passage ? ` — ${passage.title}` : ""}</p>
              <div style={{ whiteSpace: "pre-wrap" }}>{passage?.text}</div>
            </div>
            <div className="question-answer" style={{ display: "flex", flexDirection: "column" }}>
              <p>QUESTION</p>
              <QChip />
              <h2>{q.stem}</h2>
              {AnswerList}
              {error && <p style={{ color: "#FF6B5C", fontSize: 13, marginTop: 10 }}>{error}</p>}
              <div style={{ flex: 1 }} />
              {NavBar}
            </div>
          </div>
          {DotProgress}
        </div>
      </div>
    );
  }

  // ── QR: data left, question right ────────────────────────────────────────────
  if (currentSection === "qr") {
    const ds = q.dataSetId ? QR_DATASETS[q.dataSetId] : null;
    const allDataSetIds = Array.from(new Set(sectionQs.map(x => x.dataSetId).filter(Boolean)));
    const dsNum = q.dataSetId ? allDataSetIds.indexOf(q.dataSetId) + 1 : 1;

    return (
      <div className="question-screen" style={cssVars}>
        {TopBar}
        <div className="question-main" style={{ width: "min(1440px, calc(100% - 40px))" }}>
          <div className="question-columns" style={{ gridTemplateColumns: "1.75fr 1fr" }}>
            <div className="question-context" style={{ overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
              <p>DATA SET {dsNum} OF {allDataSetIds.length}{ds ? ` — ${ds.title.toUpperCase()}` : ""}</p>
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: "var(--ink)" }}>
                {ds && <p style={{ color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.5 }}>{ds.description}</p>}
                <QuestionFigure q={q} />
              </div>
            </div>
            <div className="question-answer" style={{ display: "flex", flexDirection: "column" }}>
              <p>QUESTION</p>
              <QChip />
              <h2>{q.stem}</h2>
              {AnswerList}
              {error && <p style={{ color: "#FF6B5C", fontSize: 13, marginTop: 10 }}>{error}</p>}
              <div style={{ flex: 1 }} />
              {NavBar}
            </div>
          </div>
          {DotProgress}
        </div>
      </div>
    );
  }

  // ── SJT: scenario left, question right ───────────────────────────────────────
  if (currentSection === "sjt") {
    const scenario = q.scenarioId ? SJT_SCENARIOS[q.scenarioId] : null;
    const allScenarioIds = Array.from(new Set(sectionQs.map(x => x.scenarioId).filter(Boolean)));
    const scenarioNum = q.scenarioId ? allScenarioIds.indexOf(q.scenarioId) + 1 : 1;

    return (
      <div className="question-screen" style={cssVars}>
        {TopBar}
        <div className="question-main" style={{ width: "min(1440px, calc(100% - 40px))" }}>
          <div className="question-columns" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
            <div className="question-context" style={{ overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
              <p>SCENARIO {scenarioNum} OF {allScenarioIds.length}{scenario ? ` — ${scenario.title.toUpperCase()}` : ""}</p>
              <div style={{ whiteSpace: "pre-wrap" }}>{scenario?.text}</div>
            </div>
            <div className="question-answer" style={{ display: "flex", flexDirection: "column" }}>
              <p>QUESTION</p>
              <QChip />
              <h2>{q.stem}</h2>
              {q.format === "mostleast" && q.factors ? (
                <MostLeastPicker
                  factors={q.factors}
                  mostSelected={mostSelected}
                  leastSelected={leastSelected}
                  setMostSelected={setMostSelected}
                  setLeastSelected={setLeastSelected}
                />
              ) : AnswerList}
              {error && <p style={{ color: "#FF6B5C", fontSize: 13, marginTop: 10 }}>{error}</p>}
              <div style={{ flex: 1 }} />
              {NavBar}
            </div>
          </div>
          {DotProgress}
        </div>
      </div>
    );
  }

  // ── DM: info left, question right ────────────────────────────────────────────
  if (currentSection === "dm") {
    return (
      <div className="question-screen" style={cssVars}>
        {TopBar}
        <div className="question-main">
          <div className="question-columns">
            <div className="question-context" style={{ overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
              <p>INFO</p>
              <div style={{ whiteSpace: "pre-wrap" }}>{q.preamble}</div>
              {q.vennFigure && <DiagVenn3 fig={q.vennFigure} />}
            </div>
            <div className="question-answer" style={{ display: "flex", flexDirection: "column" }}>
              <p>QUESTION</p>
              <QChip />
              <h2>{q.stem}</h2>
              {q.format === "multi" && q.statements ? (
                <MultiStatements
                  statements={q.statements}
                  multiSelected={multiSelected}
                  onToggle={(si, val) => {
                    setMultiSelected(prev => {
                      const next = [...prev];
                      next[si] = val;
                      return next;
                    });
                  }}
                />
              ) : AnswerList}
              {error && <p style={{ color: "#FF6B5C", fontSize: 13, marginTop: 10 }}>{error}</p>}
              <div style={{ flex: 1 }} />
              {NavBar}
            </div>
          </div>
          {DotProgress}
        </div>
      </div>
    );
  }

  return null;
}
