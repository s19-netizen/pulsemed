"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Fmt = "ar" | "ir" | "ml";

type Snap = {
  picked: number | null;
  confirmed: boolean;
  mostPick: number | null;
  leastPick: number | null;
  mlDone: boolean;
};
type Theme = "any" | "patient-safety" | "honesty" | "confidentiality" | "teamwork";

// API response shapes
type ApiRegQ = {
  id: string; format: string; scenario: string;
  question: string; options: string[]; correct: number; walkthrough: string;
};
type ApiMLQ = {
  id: string; format: string; scenario: string;
  question: string; optionA: string; optionB: string; optionC: string;
  mostCor: number; leastCor: number; walkthrough: string;
};

type RegItem = { kind: "regular"; fmt: Fmt; q: ApiRegQ };
type MLItem  = { kind: "ml"; q: ApiMLQ };
type Item    = RegItem | MLItem;

const C    = "#FF6B5C";
const DEEP  = "#D84A3E";
const TINT  = "#FFEDEA";
const OPT_LABELS = ["A", "B", "C"];

// ─── SJT walkthrough parser ───────────────────────────────────────────────────

type SJTOptPart = { letter: string; label: string; isCorrect: boolean; reason: string };

function parseSJTWalkthrough(text: string): { overall: string; options: SJTOptPart[] } {
  const splitMatch = text.match(/OPTION[- ]BY[- ]OPTION ANALYSIS/i);
  let overall = "";
  let analysisPart = text;

  if (splitMatch && splitMatch.index !== undefined) {
    const beforeAnalysis = text.slice(0, splitMatch.index).trim();
    overall = beforeAnalysis.replace(/^OVERALL JUDGEMENT\s*/i, "").trim();
    analysisPart = text.slice(splitMatch.index + splitMatch[0].length).trim();
  }

  const optionStarts: Array<{ index: number; letter: string }> = [];
  const optStartRe = /Option ([A-D])\s*[—–\-]+\s*/g;
  let m: RegExpExecArray | null;
  while ((m = optStartRe.exec(analysisPart)) !== null) {
    optionStarts.push({ index: m.index, letter: m[1] });
  }

  const options: SJTOptPart[] = [];
  for (let i = 0; i < optionStarts.length; i++) {
    const end = optionStarts[i + 1]?.index ?? analysisPart.length;
    const block = analysisPart.slice(optionStarts[i].index, end).trim();
    const bm = block.match(/Option [A-D]\s*[—–\-]+\s*(.+?)\s*[—–\-]+\s*(CORRECT|INCORRECT)[.\s]+([\s\S]*)/i);
    if (bm) {
      options.push({
        letter: optionStarts[i].letter,
        label: bm[1].trim(),
        isCorrect: bm[2].toUpperCase() === "CORRECT",
        reason: bm[3].trim().replace(/^This is (?:the correct rating |incorrect )?because\s*/i, ""),
      });
    }
  }

  return { overall, options };
}

function SJTWalkthrough({ text, selectedIdx, isCorrectFn }: {
  text: string;
  selectedIdx?: number;
  isCorrectFn?: (letter: string) => boolean;
}) {
  const { overall, options } = parseSJTWalkthrough(text);

  if (!overall && !options.length) {
    return (
      <div style={{ padding: "12px 16px", background: "#F8F9FB", borderRadius: 10, borderLeft: "3px solid #d97706", marginTop: 14 }}>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "var(--ink)", whiteSpace: "pre-line" }}>{text}</p>
      </div>
    );
  }

  return (
    <div className="exp-panel" style={{ marginTop: 14 }}>
      {overall && (
        <div style={{ padding: "12px 16px", background: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
          <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".07em", color: "#92400e", margin: "0 0 6px" }}>
            Overall Judgement
          </p>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "var(--ink)" }}>{overall}</p>
        </div>
      )}
      {options.length > 0 && (
        <div className="exp-options">
          {options.map(opt => {
            const optIdx = "ABCD".indexOf(opt.letter);
            const isCorrect = isCorrectFn ? isCorrectFn(opt.letter) : opt.isCorrect;
            const isSelected = optIdx === selectedIdx;
            return (
              <div
                key={opt.letter}
                className={`exp-row ${isCorrect ? "exp-row--correct" : "exp-row--wrong"} ${isSelected && !isCorrect ? "exp-row--selected" : ""}`}
              >
                <div className="exp-letter-badge"><span>{opt.letter}</span></div>
                <div className="exp-row-body">
                  <div className="exp-row-head">
                    <span className="exp-opt-text">{opt.label}</span>
                    {isCorrect
                      ? <span className="exp-tag exp-tag--correct">Correct</span>
                      : <span className="exp-tag exp-tag--wrong">Incorrect</span>}
                  </div>
                  {opt.reason && (
                    <p className="exp-reason">
                      <span className="exp-because">{isCorrect ? "Why correct — " : "Why not — "}</span>
                      {opt.reason}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const FMT_LABEL: Record<Fmt, string> = { ar: "Appropriateness", ir: "Importance", ml: "Most & Least" };
const FMT_DESC: Record<Fmt, string> = {
  ar: "Rate each action on a 4-point scale",
  ir: "Rate how much a factor matters",
  ml: "Pick both the best and worst action",
};
const THEME_LABEL: Record<Theme, string> = {
  any: "Any theme",
  "patient-safety": "Patient Safety",
  honesty: "Honesty",
  confidentiality: "Confidentiality",
  teamwork: "Teamwork",
};
const FMT_TO_API: Record<Fmt, string> = {
  ar: "appropriateness",
  ir: "importance",
  ml: "most-least",
};
const DIFFICULTY_BY_THEME: Record<Theme, string> = {
  any: "Bronze,Silver,Gold,Diamond",
  "patient-safety": "Bronze,Silver,Gold,Diamond",
  honesty: "Bronze,Silver,Gold,Diamond",
  confidentiality: "Bronze,Silver,Gold,Diamond",
  teamwork: "Bronze,Silver,Gold,Diamond",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SJTPractice() {
  const router = useRouter();
  const params = useSearchParams();

  const [fmts, setFmts] = useState<Set<Fmt>>(new Set(["ar", "ir", "ml"]));
  const [theme, setTheme] = useState<Theme>("any");
  const [count, setCount] = useState(10);

  const [stage, setStage] = useState<"pick" | "loading" | "go" | "done">("pick");
  const [loadErr, setLoadErr] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  // AR/IR state
  const [picked, setPicked] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // ML state
  const [mostPick, setMostPick] = useState<number | null>(null);
  const [leastPick, setLeastPick] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [hoverZone, setHoverZone] = useState<"most" | "least" | null>(null);
  const [clickSel, setClickSel] = useState<number | null>(null);
  const [mlDone, setMlDone] = useState(false);

  // Back navigation
  const [snapshots, setSnapshots] = useState<Record<number, Snap>>({});
  const [answeredSet, setAnsweredSet] = useState<Set<number>>(new Set());

  function toggleFmt(f: Fmt) {
    setFmts(prev => {
      const n = new Set(prev);
      if (n.has(f) && n.size > 1) n.delete(f); else n.add(f);
      return n;
    });
  }

  useEffect(() => {
    if (params.get("autostart") === "1") {
      const c = parseInt(params.get("count") ?? "") || count;
      start(c);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start(countOverride?: number) {
    const effectiveCount = countOverride ?? count;
    setStage("loading");
    setLoadErr("");
    const diff = DIFFICULTY_BY_THEME[theme];
    const perFmt = Math.max(3, Math.ceil(effectiveCount / fmts.size));

    try {
      const fetches = Array.from(fmts).map(f =>
        fetch(
          `/api/questions/sjt?format=${FMT_TO_API[f]}&theme=${theme}&difficulty=${encodeURIComponent(diff)}&count=${perFmt}`
        ).then(r => r.json())
      );
      const results = await Promise.all(fetches);

      const all: Item[] = [];
      for (const res of results) {
        if (res.error) continue;
        for (const q of res.questions ?? []) {
          if (q.format === "most-least") {
            all.push({ kind: "ml", q: q as ApiMLQ });
          } else {
            const f: Fmt = q.format === "importance" ? "ir" : "ar";
            all.push({ kind: "regular", fmt: f, q: q as ApiRegQ });
          }
        }
      }

      const picked = shuffle(all).slice(0, effectiveCount);
      if (!picked.length) {
        setLoadErr("No questions found for that combination — try a different theme or format.");
        setStage("pick");
        return;
      }
      setItems(picked);
      setIdx(0);
      setResults([]);
      setSnapshots({});
      setAnsweredSet(new Set());
      resetQ();
      setStage("go");
    } catch {
      setLoadErr("Failed to load questions. Please try again.");
      setStage("pick");
    }
  }

  async function handleExit() {
    if (results.length > 0) {
      await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "sjt",
          correct: results.filter(Boolean).length,
          total: results.length,
          avgMs: 0,
          sessionId: `sjt-${Date.now()}`,
        }),
      }).catch(() => {});
    }
    router.push("/practice/sjt");
  }

  function resetQ() {
    setPicked(null); setConfirmed(false);
    setMostPick(null); setLeastPick(null);
    setDragging(null); setHoverZone(null);
    setClickSel(null); setMlDone(false);
  }

  function saveSnap(i: number) {
    setSnapshots(prev => ({
      ...prev,
      [i]: { picked, confirmed, mostPick, leastPick, mlDone },
    }));
  }

  function restoreSnap(s: Snap) {
    setPicked(s.picked); setConfirmed(s.confirmed);
    setMostPick(s.mostPick); setLeastPick(s.leastPick); setMlDone(s.mlDone);
    setDragging(null); setHoverZone(null); setClickSel(null);
  }

  function goBack() {
    if (idx === 0) return;
    const prevSnap = snapshots[idx - 1];
    saveSnap(idx);
    setIdx(i => i - 1);
    if (prevSnap) restoreSnap(prevSnap); else resetQ();
  }

  function confirmRegular() {
    const it = items[idx] as RegItem;
    if (!answeredSet.has(idx)) {
      setResults(r => [...r, picked === it.q.correct]);
      setAnsweredSet(prev => new Set([...prev, idx]));
    }
    setConfirmed(true);
  }

  function confirmML() {
    const it = items[idx] as MLItem;
    if (!answeredSet.has(idx)) {
      setResults(r => [...r, mostPick === it.q.mostCor && leastPick === it.q.leastCor]);
      setAnsweredSet(prev => new Set([...prev, idx]));
    }
    setMlDone(true);
  }

  function next() {
    const nextSnap = snapshots[idx + 1];
    saveSnap(idx);
    if (idx + 1 >= items.length) setStage("done");
    else {
      setIdx(i => i + 1);
      if (nextSnap) restoreSnap(nextSnap); else resetQ();
    }
  }

  // Drag handlers
  function onDragStart(i: number) { setDragging(i); }
  function onDragEnd() { setDragging(null); setHoverZone(null); }
  function onZoneDragOver(e: React.DragEvent, z: "most" | "least") { e.preventDefault(); setHoverZone(z); }
  function onZoneDragLeave() { setHoverZone(null); }
  function onZoneDrop(z: "most" | "least") {
    if (dragging === null) return;
    if (z === "most") { setMostPick(dragging); if (leastPick === dragging) setLeastPick(null); }
    else { setLeastPick(dragging); if (mostPick === dragging) setMostPick(null); }
    setDragging(null); setHoverZone(null);
  }

  // Click-to-place handlers
  function onOptClick(i: number) {
    if (mostPick === i) { setMostPick(null); setClickSel(null); return; }
    if (leastPick === i) { setLeastPick(null); setClickSel(null); return; }
    setClickSel(c => c === i ? null : i);
  }
  function onZoneClick(z: "most" | "least") {
    if (clickSel === null) return;
    if (z === "most") { setMostPick(clickSel); if (leastPick === clickSel) setLeastPick(null); }
    else { setLeastPick(clickSel); if (mostPick === clickSel) setMostPick(null); }
    setClickSel(null);
  }

  const cssVars = { "--section": C, "--section-deep": DEEP, "--section-tint": TINT } as React.CSSProperties;
  const COUNTS = [5, 10, 20, 35];

  // ── LOADING ─────────────────────────────────────────────────────────────────────
  if (stage === "loading") {
    return (
      <div style={cssVars}>
        <div className="page-header"><div><p className="eyebrow">Practice</p><h1>Situational Judgement</h1></div></div>
        <div className="content-card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Building your SJT session…</p>
        </div>
      </div>
    );
  }

  // ── PICK STAGE ───────────────────────────────────────────────────────────────────
  if (stage === "pick") {
    return (
      <div style={cssVars}>
        <div className="page-header">
          <div>
            <p className="eyebrow">Practice</p>
            <div className="title-row">
              <span className="section-badge">SJT</span>
              <h1>Situational Judgement</h1>
            </div>
            <p>Pick a question format, theme, and session length.</p>
          </div>
        </div>

        <div className="practice-layout">
          <section className="content-card practice-builder">

            {loadErr && (
              <p style={{ color: DEEP, fontSize: 13, marginBottom: 16, background: "#FFF5F4", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C}44` }}>
                {loadErr}
              </p>
            )}

            {/* Step 1: Format */}
            <div className="builder-step">
              <span>1</span>
              <div><p className="section-kicker">QUESTION FORMAT</p><h2>What type of question?</h2></div>
            </div>
            <div className="builder-groups">
              {(["ar", "ir", "ml"] as Fmt[]).map(f => (
                <button
                  key={f}
                  className={fmts.has(f) ? "selected" : ""}
                  onClick={() => toggleFmt(f)}
                  type="button"
                >
                  <div className="builder-icon-box">
                    {f === "ar" && (
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                    )}
                    {f === "ir" && (
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    )}
                    {f === "ml" && (
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                      </svg>
                    )}
                  </div>
                  <strong>{FMT_LABEL[f]}</strong>
                  <small>{FMT_DESC[f]}</small>
                </button>
              ))}
            </div>

            {/* Step 2: Theme */}
            <div className="builder-step">
              <span>2</span>
              <div><p className="section-kicker">PROFESSIONAL THEME</p><h2>Which theme?</h2></div>
            </div>
            <div className="subtype-pills">
              {(["any", "patient-safety", "honesty", "confidentiality", "teamwork"] as Theme[]).map(t => (
                <button
                  key={t}
                  type="button"
                  className={`subtype-pill${theme === t ? " selected" : ""}`}
                  onClick={() => setTheme(t)}
                >
                  {THEME_LABEL[t]}
                </button>
              ))}
            </div>

            {/* Step 3: Count */}
            <div className="builder-step">
              <span>3</span>
              <div><p className="section-kicker">SESSION LENGTH</p><h2>How many questions?</h2></div>
            </div>
            <div className="count-row">
              {COUNTS.map(n => (
                <button
                  key={n}
                  className={count === n ? "selected" : ""}
                  onClick={() => setCount(n)}
                  type="button"
                >
                  <strong>{n}</strong>
                  <small>questions</small>
                </button>
              ))}
              <button
                className={`count-ucat${count === 69 ? " selected" : ""}`}
                onClick={() => setCount(69)}
                type="button"
              >
                <strong>69</strong>
                <small>questions</small>
                <span className="ucat-badge">UCAT</span>
              </button>
            </div>

            <button className="start-session" onClick={() => start()} type="button">
              Start {count}-question session →
            </button>
          </section>

          <aside className="practice-side">
            <div className="practice-summary">
              <p className="section-kicker">SESSION SUMMARY</p>
              <div className="summary-row">
                <span>Formats</span>
                <strong>{Array.from(fmts).map(f => FMT_LABEL[f]).join(", ")}</strong>
              </div>
              <div className="summary-row">
                <span>Theme</span>
                <strong>{THEME_LABEL[theme]}</strong>
              </div>
              <div className="summary-row">
                <span>Questions</span>
                <strong>{count}</strong>
              </div>
            </div>
            <button className="back-link" onClick={() => router.push("/section/sjt")} type="button">
              ← Back to SJT dashboard
            </button>
          </aside>
        </div>
      </div>
    );
  }

  // ── DONE STAGE ───────────────────────────────────────────────────────────────────
  if (stage === "done") {
    const correct = results.filter(Boolean).length;
    const pct = Math.round((correct / results.length) * 100);
    return (
      <div style={cssVars}>
        <div className="page-header">
          <div><p className="eyebrow">Practice · SJT</p><h1>Session complete</h1></div>
        </div>
        <div className="content-card" style={{ padding: 32, maxWidth: 500 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, background: TINT,
            border: `3px solid ${C}`, display: "flex", alignItems: "center",
            justifyContent: "center", marginBottom: 20,
            fontSize: 28, fontWeight: 900, color: C,
          }}>
            {pct}%
          </div>
          <h2 style={{ margin: "0 0 8px" }}>{correct} of {results.length} correct</h2>
          <p style={{ color: "var(--ink-soft)", marginBottom: 28, lineHeight: 1.6 }}>
            {pct >= 80
              ? "Strong session — keep that up."
              : pct >= 60
              ? "Good foundation — review the ones you missed."
              : "More practice will help — use the notes to revisit the principles."}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="start-session"
              style={{ margin: 0 }}
              onClick={() => { setStage("pick"); setResults([]); }}
              type="button"
            >
              Try again →
            </button>
            <button
              className="back-link"
              style={{ marginTop: 0 }}
              onClick={() => router.push("/section/sjt")}
              type="button"
            >
              ← Back to SJT
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PRACTICE STAGE ───────────────────────────────────────────────────────────────
  const item = items[idx];
  const progress = Math.round((idx / items.length) * 100);

  const ProgressBar = () => (
    <>
      <div style={{ height: 4, background: "var(--line)", borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: 4, background: C, borderRadius: 2, width: `${progress}%`, transition: "width .3s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          Practice · SJT · {item.kind === "ml" ? "Most & Least" : FMT_LABEL[item.fmt]}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <small style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>{idx + 1} / {items.length}</small>
          <button type="button" onClick={handleExit} style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "var(--ink-soft)" }}>✕ Exit</button>
        </div>
      </div>
    </>
  );

  // ── ML drag-and-drop ─────────────────────────────────────────────────────────────
  if (item.kind === "ml") {
    const mlQ = item.q;
    const opts = [mlQ.optionA, mlQ.optionB, mlQ.optionC];
    const canConfirm = mostPick !== null && leastPick !== null;

    return (
      <div style={{ ...cssVars, display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", minHeight: 500 } as React.CSSProperties}>
        <ProgressBar />

        <div style={{ display: "flex", flex: 1, gap: 0, overflow: "hidden", borderRadius: 14, border: "1px solid var(--line)" }}>
          {/* Left — Scenario */}
          <div style={{ width: "42%", flexShrink: 0, padding: "20px 22px", borderRight: "1px solid var(--line)", overflowY: "auto", background: TINT }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C, margin: "0 0 10px" }}>SCENARIO</p>
            <p style={{ fontSize: 13, lineHeight: 1.75, margin: 0, color: "var(--ink)" }}>{mlQ.scenario}</p>
          </div>

          {/* Right — question UI */}
          <div style={{ flex: 1, padding: "20px 22px", overflowY: "auto", background: "white" }}>

        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 14 }}>
          {mlDone
            ? "Results"
            : clickSel !== null
            ? `Option ${OPT_LABELS[clickSel]} selected — click a zone to place it`
            : "Drag or click an option, then place it in a zone below"}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          {(["most", "least"] as const).map(zone => {
            const pick = zone === "most" ? mostPick : leastPick;
            const corIdx = zone === "most" ? mlQ.mostCor : mlQ.leastCor;
            const isHover = hoverZone === zone && dragging !== null && !mlDone;
            const isCorrect = mlDone && pick === corIdx;
            const isWrong = mlDone && pick !== corIdx;
            const zoneColor = zone === "most" ? "#3DBE6C" : C;
            const borderColor = isHover ? C : isCorrect ? "#3DBE6C" : isWrong ? C : "var(--line)";
            const bg = isHover ? TINT : isCorrect ? "#EDFBF3" : isWrong ? "#FFF5F4" : "white";

            return (
              <div
                key={zone}
                onDragOver={e => !mlDone && onZoneDragOver(e, zone)}
                onDragLeave={() => !mlDone && onZoneDragLeave()}
                onDrop={() => !mlDone && onZoneDrop(zone)}
                onClick={() => !mlDone && onZoneClick(zone)}
                style={{
                  border: `2px dashed ${borderColor}`,
                  borderRadius: 14, background: bg,
                  padding: "16px 18px", minHeight: 110,
                  cursor: !mlDone && pick === null ? "pointer" : "default",
                  transition: "all .2s",
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: zoneColor, margin: "0 0 10px" }}>
                  {zone === "most" ? "▲ Most Appropriate" : "▼ Least Appropriate"}
                </p>
                {pick !== null ? (
                  <div
                    onClick={e => { if (!mlDone) { e.stopPropagation(); zone === "most" ? setMostPick(null) : setLeastPick(null); } }}
                    style={{ cursor: mlDone ? "default" : "pointer" }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: zoneColor, color: "white",
                        display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800,
                      }}>
                        {OPT_LABELS[pick]}
                      </span>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "var(--ink)" }}>{opts[pick]}</p>
                    </div>
                    {mlDone && (
                      <p style={{ margin: "8px 0 0", fontSize: 11, fontWeight: 700, color: isCorrect ? "#238A4B" : DEEP }}>
                        {isCorrect ? "✓ Correct" : `✗ Should be Option ${OPT_LABELS[corIdx]}`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                    {clickSel !== null ? `Click to place Option ${OPT_LABELS[clickSel]} here` : "Drop or click to place"}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>
          Options — drag or click to select
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {opts.map((text, i) => {
            const inMost = mostPick === i;
            const inLeast = leastPick === i;
            const placed = inMost || inLeast;
            const selected = clickSel === i;
            return (
              <div
                key={i}
                draggable={!placed && !mlDone}
                onDragStart={() => !placed && !mlDone && onDragStart(i)}
                onDragEnd={onDragEnd}
                onClick={() => !mlDone && onOptClick(i)}
                style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "12px 16px", borderRadius: 12,
                  border: selected ? `2px solid ${C}` : "1px solid var(--line)",
                  background: selected ? TINT : placed ? "#F8F9FB" : "white",
                  opacity: placed ? 0.35 : 1,
                  cursor: mlDone ? "default" : placed ? "default" : "grab",
                  transition: "all .15s",
                  userSelect: "none",
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: selected ? C : "var(--section-tint)",
                  color: selected ? "white" : C,
                  display: "grid", placeItems: "center",
                  fontSize: 11, fontWeight: 800,
                }}>
                  {OPT_LABELS[i]}
                </span>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: placed ? "var(--ink-soft)" : "var(--ink)", fontWeight: 500 }}>
                  {text}
                </p>
              </div>
            );
          })}
        </div>

        {mlDone && (
          <div style={{ marginBottom: 24 }}>
            <SJTWalkthrough
              text={mlQ.walkthrough}
              isCorrectFn={letter => {
                const idx = "ABC".indexOf(letter);
                return idx === mlQ.mostCor || idx === mlQ.leastCor;
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={goBack} disabled={idx === 0} style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 10, padding: "0 12px", minHeight: 38, fontSize: 12, fontWeight: 700, cursor: idx === 0 ? "not-allowed" : "pointer", color: "var(--ink)", opacity: idx === 0 ? 0.4 : 1 }}>← Back</button>
          {!mlDone ? (
            <button
              type="button"
              onClick={confirmML}
              disabled={!canConfirm}
              className="start-session"
              style={{ margin: 0, opacity: canConfirm ? 1 : 0.5, cursor: canConfirm ? "pointer" : "not-allowed" }}
            >
              Confirm
            </button>
          ) : (
            <button type="button" onClick={next} className="start-session" style={{ margin: 0 }}>
              {idx + 1 < items.length ? "Next →" : "See results →"}
            </button>
          )}
        </div>
          </div>{/* end right pane */}
        </div>{/* end split */}
      </div>
    );
  }

  // ── AR / IR question ─────────────────────────────────────────────────────────────
  const regItem = item as RegItem;
  return (
    <div style={{ ...cssVars, display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", minHeight: 500 } as React.CSSProperties}>
      <ProgressBar />

      <div style={{ display: "flex", flex: 1, gap: 0, overflow: "hidden", borderRadius: 14, border: "1px solid var(--line)" }}>
        {/* Left — Scenario */}
        <div style={{
          width: "48%", flexShrink: 0, padding: "20px 22px",
          borderRight: "1px solid var(--line)", overflowY: "auto",
          background: TINT,
        }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C, margin: "0 0 10px" }}>
            SCENARIO
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.75, margin: 0, color: "var(--ink)", whiteSpace: "pre-line" }}>
            {regItem.q.scenario}
          </p>
        </div>

        {/* Right — Question + Options */}
        <div style={{ flex: 1, padding: "20px 22px", overflowY: "auto", background: "white" }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, lineHeight: 1.5, color: "var(--ink)" }}>
            {regItem.q.question}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {regItem.q.options.map((opt, i) => {
              let bg = "white";
              let border = "1.5px solid var(--line)";
              let textColor = "var(--ink)";
              if (confirmed) {
                if (i === regItem.q.correct) { bg = "#EDFBF3"; border = "2px solid #3DBE6C"; textColor = "#238A4B"; }
                else if (i === picked) { bg = "#FFF5F4"; border = `2px solid ${C}`; textColor = DEEP; }
              } else if (i === picked) {
                bg = TINT; border = `2px solid ${C}`;
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !confirmed && setPicked(i)}
                  style={{
                    background: bg, border, borderRadius: 10,
                    padding: "12px 14px", textAlign: "left",
                    cursor: confirmed ? "default" : "pointer",
                    fontSize: 13, lineHeight: 1.5, color: textColor,
                    fontWeight: (i === picked || (confirmed && i === regItem.q.correct)) ? 600 : 400,
                    transition: "all .15s",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {confirmed && (
            <SJTWalkthrough
              text={regItem.q.walkthrough}
              selectedIdx={picked ?? undefined}
              isCorrectFn={letter => "ABCD".indexOf(letter) === regItem.q.correct}
            />
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, gap: 10 }}>
            <button type="button" onClick={goBack} disabled={idx === 0} style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 10, padding: "0 12px", minHeight: 38, fontSize: 12, fontWeight: 700, cursor: idx === 0 ? "not-allowed" : "pointer", color: "var(--ink)", opacity: idx === 0 ? 0.4 : 1 }}>← Back</button>
            {!confirmed ? (
              <button
                type="button"
                onClick={confirmRegular}
                disabled={picked === null}
                className="start-session"
                style={{ margin: 0, opacity: picked === null ? 0.5 : 1, cursor: picked === null ? "not-allowed" : "pointer" }}
              >
                Confirm
              </button>
            ) : (
              <button type="button" onClick={next} className="start-session" style={{ margin: 0 }}>
                {idx + 1 < items.length ? "Next →" : "See results →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
