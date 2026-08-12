"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Fmt = "ar" | "ir" | "ml";
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

  function toggleFmt(f: Fmt) {
    setFmts(prev => {
      const n = new Set(prev);
      if (n.has(f) && n.size > 1) n.delete(f); else n.add(f);
      return n;
    });
  }

  async function start() {
    setStage("loading");
    setLoadErr("");
    const diff = DIFFICULTY_BY_THEME[theme];
    const perFmt = Math.max(3, Math.ceil(count / fmts.size));

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

      const picked = shuffle(all).slice(0, count);
      if (!picked.length) {
        setLoadErr("No questions found for that combination — try a different theme or format.");
        setStage("pick");
        return;
      }
      setItems(picked);
      setIdx(0);
      setResults([]);
      resetQ();
      setStage("go");
    } catch {
      setLoadErr("Failed to load questions. Please try again.");
      setStage("pick");
    }
  }

  function resetQ() {
    setPicked(null); setConfirmed(false);
    setMostPick(null); setLeastPick(null);
    setDragging(null); setHoverZone(null);
    setClickSel(null); setMlDone(false);
  }

  function confirmRegular() {
    const it = items[idx] as RegItem;
    setResults(r => [...r, picked === it.q.correct]);
    setConfirmed(true);
  }

  function confirmML() {
    const it = items[idx] as MLItem;
    setResults(r => [...r, mostPick === it.q.mostCor && leastPick === it.q.leastCor]);
    setMlDone(true);
  }

  function next() {
    if (idx + 1 >= items.length) setStage("done");
    else { setIdx(i => i + 1); resetQ(); }
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

            <button className="start-session" onClick={start} type="button">
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          Practice · SJT · {item.kind === "ml" ? "Most & Least" : FMT_LABEL[item.fmt]}
        </p>
        <small style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>
          {idx + 1} / {items.length}
        </small>
      </div>
    </>
  );

  // ── ML drag-and-drop ─────────────────────────────────────────────────────────────
  if (item.kind === "ml") {
    const mlQ = item.q;
    const opts = [mlQ.optionA, mlQ.optionB, mlQ.optionC];
    const canConfirm = mostPick !== null && leastPick !== null;

    return (
      <div style={cssVars}>
        <ProgressBar />

        <div style={{ background: TINT, borderRadius: 14, padding: "16px 20px", marginBottom: 20, border: `1px solid ${C}22` }}>
          <p style={{ fontSize: 13, lineHeight: 1.75, margin: 0 }}>{mlQ.scenario}</p>
        </div>

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
          <div style={{ padding: "14px 18px", background: "#F8F9FB", borderRadius: 12, borderLeft: `3px solid ${C}`, marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-soft)", margin: "0 0 6px" }}>
              Explanation
            </p>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "var(--ink)" }}>
              {mlQ.walkthrough}
            </p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
      </div>
    );
  }

  // ── AR / IR question ─────────────────────────────────────────────────────────────
  const regItem = item as RegItem;
  return (
    <div style={cssVars}>
      <ProgressBar />

      <div className="content-card" style={{ padding: 24 }}>
        <div style={{ background: TINT, borderRadius: 12, padding: "14px 18px", marginBottom: 20, border: `1px solid ${C}22` }}>
          <p style={{ fontSize: 13, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{regItem.q.scenario}</p>
        </div>

        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, lineHeight: 1.4, color: "var(--ink)" }}>
          {regItem.q.question}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {regItem.q.options.map((opt, i) => {
            let bg = "white";
            let border = "1px solid var(--line)";
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
                  background: bg, border, borderRadius: 12,
                  padding: "13px 16px", textAlign: "left",
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
          <div style={{
            marginTop: 16, padding: "14px 18px",
            background: "#F8F9FB", borderRadius: 12,
            borderLeft: `3px solid ${picked === regItem.q.correct ? "#3DBE6C" : C}`,
          }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "var(--ink)" }}>
              {regItem.q.walkthrough}
            </p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, gap: 10 }}>
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
  );
}
