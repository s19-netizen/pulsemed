"use client";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GUEST_QUESTIONS, type GuestQuestion, type VennFigure2, type VennFigure3, type VennFigure } from "@/lib/questions";

// ─── Venn Diagram components ─────────────────────────────────────────────────

function Num({ x, y, v, anchor = "middle" }: { x: number; y: number; v: number | undefined; anchor?: string }) {
  if (v === undefined) return null;
  return (
    <text x={x} y={y} textAnchor={anchor as "middle" | "start" | "end"} dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>
      {v}
    </text>
  );
}

function SetLabel({ x, y, label, count, anchor = "middle" }: { x: number; y: number; label: string; count?: number; anchor?: string }) {
  return (
    <>
      <text x={x} y={y} textAnchor={anchor as "middle" | "start" | "end"} dominantBaseline="central"
        style={{ fontSize: 11, fontWeight: 700, fill: "#6846d9", fontFamily: "inherit", letterSpacing: ".02em" }}>
        {label}
      </text>
      {count !== undefined && (
        <text x={x} y={y + 14} textAnchor={anchor as "middle" | "start" | "end"} dominantBaseline="central"
          style={{ fontSize: 10, fill: "#6b7280", fontFamily: "inherit" }}>
          n={count}
        </text>
      )}
    </>
  );
}

function VennDiagram2({ fig }: { fig: VennFigure2 }) {
  // Two overlapping circles: cx_a=118, cx_b=202, cy=100, r=70
  // Overlap region: x=132–188, centre x=160
  // Only-A centre: ~x=83, Only-B centre: ~x=237
  return (
    <div style={{ margin: "10px 0" }}>
      <svg viewBox="0 0 320 195" style={{ width: "100%", maxWidth: 340, display: "block" }} aria-label="Venn diagram">
        {/* Total */}
        {fig.total !== undefined && (
          <text x={160} y={11} textAnchor="middle" style={{ fontSize: 10, fill: "#9ca3af", fontFamily: "inherit" }}>
            Total: {fig.total}
          </text>
        )}

        {/* Circle fills */}
        <circle cx={118} cy={100} r={70} fill="rgba(104,70,217,0.07)" stroke="#8b6bff" strokeWidth={1.5} />
        <circle cx={202} cy={100} r={70} fill="rgba(104,70,217,0.07)" stroke="#8b6bff" strokeWidth={1.5} />

        {/* Labels at top of each circle (outside overlap) */}
        <SetLabel x={75} y={36} label={fig.labelA} count={fig.totalA} />
        <SetLabel x={245} y={36} label={fig.labelB} count={fig.totalB} />

        {/* Region values (only show what was given in the problem) */}
        <Num x={82} y={105} v={fig.onlyA} />
        <Num x={160} y={105} v={fig.both} />
        <Num x={238} y={105} v={fig.onlyB} />

        {/* "Neither" shown below circles */}
        {fig.neither !== undefined && (
          <>
            <rect x={120} y={174} width={80} height={16} rx={4} fill="#f3f4f6" />
            <text x={160} y={182} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 10, fill: "#6b7280", fontFamily: "inherit" }}>
              neither: {fig.neither}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

function VennDiagram3({ fig }: { fig: VennFigure3 }) {
  // Triangle layout: A top-left, B top-right, C bottom-centre
  // A: cx=120, cy=108, r=68 | B: cx=200, cy=108, r=68 | C: cx=160, cy=168, r=68
  return (
    <div style={{ margin: "10px 0" }}>
      <svg viewBox="0 0 320 265" style={{ width: "100%", maxWidth: 340, display: "block" }} aria-label="Venn diagram">
        {fig.total !== undefined && (
          <text x={160} y={10} textAnchor="middle" style={{ fontSize: 10, fill: "#9ca3af", fontFamily: "inherit" }}>
            Total: {fig.total}
          </text>
        )}

        {/* Circle fills */}
        <circle cx={120} cy={108} r={68} fill="rgba(104,70,217,0.06)" stroke="#8b6bff" strokeWidth={1.5} />
        <circle cx={200} cy={108} r={68} fill="rgba(104,70,217,0.06)" stroke="#8b6bff" strokeWidth={1.5} />
        <circle cx={160} cy={168} r={68} fill="rgba(104,70,217,0.06)" stroke="#8b6bff" strokeWidth={1.5} />

        {/* Set labels */}
        <SetLabel x={68} y={47} label={fig.labelA} count={fig.totalA} />
        <SetLabel x={252} y={47} label={fig.labelB} count={fig.totalB} />
        <SetLabel x={160} y={248} label={fig.labelC} count={fig.totalC} />

        {/* Region values — only show what was given */}
        <Num x={95}  y={90}  v={fig.onlyA} />
        <Num x={225} y={90}  v={fig.onlyB} />
        <Num x={160} y={225} v={fig.onlyC} />
        <Num x={160} y={86}  v={fig.ab} />
        <Num x={112} y={155} v={fig.ac} />
        <Num x={208} y={155} v={fig.bc} />
        <Num x={160} y={130} v={fig.abc} />

        {fig.neither !== undefined && (
          <>
            <rect x={8} y={242} width={68} height={15} rx={3} fill="#f3f4f6" />
            <text x={42} y={249} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 9, fill: "#6b7280", fontFamily: "inherit" }}>
              neither: {fig.neither}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

function VennDiagram({ fig }: { fig: VennFigure }) {
  if (fig.kind === "venn2") return <VennDiagram2 fig={fig} />;
  return <VennDiagram3 fig={fig} />;
}

// ─── Section colours ─────────────────────────────────────────────────────────

const SECTION_COLORS: Record<string, { color: string; deep: string; tint: string; short: string }> = {
  vr: { color: "#2d7ff9", deep: "#1a5fd0", tint: "#eaf2ff", short: "VR" },
  dm: { color: "#8b6bff", deep: "#6747d8", tint: "#f1ecff", short: "DM" },
  qr: { color: "#3dbe6c", deep: "#259650", tint: "#edfbf3", short: "QR" },
  sjt: { color: "#ff6b5c", deep: "#d94b3e", tint: "#ffedea", short: "SJT" },
};

// ─── Passage highlighting ────────────────────────────────────────────────────

function applyHighlights(text: string, terms: string[]): React.ReactNode {
  // Build a list of [start, end] ranges to highlight, then render
  type Range = { start: number; end: number };
  const ranges: Range[] = [];

  for (const term of terms) {
    const clean = term.replace(/^[""''"']+|[""''"']+$/g, "").trim();
    if (!clean) continue;
    let idx = text.indexOf(clean);
    if (idx === -1) idx = text.toLowerCase().indexOf(clean.toLowerCase());
    if (idx !== -1) ranges.push({ start: idx, end: idx + clean.length });
  }

  if (ranges.length === 0) return <>{text}</>;

  // Sort and merge overlapping ranges
  ranges.sort((a, b) => a.start - b.start);
  const merged: Range[] = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i].start <= last.end) last.end = Math.max(last.end, ranges[i].end);
    else merged.push(ranges[i]);
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const r of merged) {
    if (cursor < r.start) nodes.push(text.slice(cursor, r.start));
    nodes.push(<mark key={r.start} className="passage-highlight">{text.slice(r.start, r.end)}</mark>);
    cursor = r.end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

function HighlightedPassage({ text, evidence, revealed }: { text: string; evidence?: string; revealed: boolean }) {
  if (!revealed || !evidence) return <>{text}</>;
  const terms = evidence.split("||").map(s => s.trim()).filter(Boolean);
  return applyHighlights(text, terms);
}

// ─── Explanation parser ──────────────────────────────────────────────────────

type OptionPart = { letter: string; isCorrect: boolean; reason: string };

function parseOptionExplanations(explanation: string, options: string[], correctIdx: number): OptionPart[] {
  // Find where each option entry starts
  const entryRe = /\b([A-D])(?:\s*\([^)]*\))?\s+(is\s+(?:correct|ruled|not\s+correct|incorrect|wrong|inappropriate)|cannot\s+be\s+correct)/gi;
  const entries: { idx: number; letter: string; isCorrect: boolean }[] = [];
  let m: RegExpExecArray | null;

  while ((m = entryRe.exec(explanation)) !== null) {
    const before = explanation.slice(0, m.index).trim();
    const isEntry = before === "" || /[.!?]$/.test(before);
    if (!isEntry) continue;
    const phrase = m[2].toLowerCase();
    entries.push({
      idx: m.index,
      letter: m[1].toUpperCase(),
      isCorrect: phrase.startsWith("is correct"),
    });
  }

  if (entries.length === 0) {
    // Fallback: show full explanation under the correct option only
    return options.map((_, i) => ({
      letter: String.fromCharCode(65 + i),
      isCorrect: i === correctIdx,
      reason: i === correctIdx ? explanation : "",
    }));
  }

  const parts = entries.map((entry, i) => {
    const raw = explanation.slice(entry.idx, entries[i + 1]?.idx ?? explanation.length).trim().replace(/\.\s*$/, "");
    // Strip "X (Label) is correct because " / "X (Label) cannot be correct because " prefix
    const reason = raw
      .replace(/^[A-D]\s*(?:\([^)]*\))?\s+(?:is\s+correct(?:\s+because)?|is\s+ruled\s+out\s+(?:by|because)?|cannot\s+be\s+correct(?:\s+because)?|is\s+not\s+correct(?:\s+because)?|is\s+incorrect(?:\s+because)?|is\s+inappropriate(?:\s+because)?|is\s+wrong(?:\s+because)?)\s*/i, "")
      .trim();
    return { letter: entry.letter, isCorrect: entry.isCorrect, reason };
  });

  // Ensure every option has an entry
  options.forEach((_, i) => {
    const letter = String.fromCharCode(65 + i);
    if (!parts.find(p => p.letter === letter)) {
      parts.push({ letter, isCorrect: i === correctIdx, reason: "" });
    }
  });

  // Sort A→B→C→D
  parts.sort((a, b) => a.letter.charCodeAt(0) - b.letter.charCodeAt(0));
  return parts;
}

// ─── Explanation UI ──────────────────────────────────────────────────────────

function AnswerExplanation({ q, selected, takenMs, section }: { q: GuestQuestion; selected: number; takenMs: number; section: string }) {
  const isRight = selected === q.correct;
  const parts = parseOptionExplanations(q.explanation, q.options, q.correct);
  const target = TARGET_S[section] ?? 40;
  const timing = timingLabel(takenMs, target);

  return (
    <div className="exp-panel">
      {/* Verdict + timing */}
      <div className={`exp-verdict ${isRight ? "exp-verdict--right" : "exp-verdict--wrong"}`}>
        <span className="exp-verdict-icon">{isRight ? "✓" : "✗"}</span>
        <strong>{isRight ? "Correct" : "Incorrect"}</strong>
        <span>{isRight ? "— well spotted" : `— the answer is ${String.fromCharCode(65 + q.correct)}`}</span>
        <span className={`exp-timing ${timing.cls}`}>
          {fmtSec(takenMs)} <em>· target {target}s · {timing.label}</em>
        </span>
      </div>

      {/* Per-option bullets */}
      <div className="exp-options">
        {parts.map((part, i) => {
          const optIdx = "ABCD".indexOf(part.letter);
          const optText = q.optionNotes?.[optIdx] ?? (optIdx >= 0 ? q.options[optIdx] : "");
          const isSelected = optIdx === selected;
          return (
            <div
              key={part.letter}
              className={`exp-row ${part.isCorrect ? "exp-row--correct" : "exp-row--wrong"} ${isSelected && !part.isCorrect ? "exp-row--selected" : ""}`}
            >
              <div className="exp-letter-badge">
                <span>{part.letter}</span>
              </div>
              <div className="exp-row-body">
                <div className="exp-row-head">
                  <span className="exp-opt-text">{optText}</span>
                  {part.isCorrect
                    ? <span className="exp-tag exp-tag--correct">Correct</span>
                    : <span className="exp-tag exp-tag--wrong">Incorrect</span>}
                </div>
                {part.reason && (
                  <p className="exp-reason">
                    <span className="exp-because">{part.isCorrect ? "Why correct — " : "Why not — "}</span>
                    {part.reason.replace(/^\s*because\s+/i, "")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ─── Timing ──────────────────────────────────────────────────────────────────

const TARGET_S: Record<string, number> = { vr: 30, dm: 63, qr: 39, sjt: 23 };

function timingLabel(takenMs: number, targetS: number): { label: string; cls: string } {
  const s = takenMs / 1000;
  if (s <= targetS) return { label: "Good pace", cls: "time-ok" };
  if (s <= targetS * 1.6) return { label: "A bit slow", cls: "time-slow" };
  return { label: "Too slow", cls: "time-danger" };
}

function fmtSec(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
}

// ─── Slot helpers ─────────────────────────────────────────────────────────────

type QuestionSlot =
  | { kind: "single"; q: GuestQuestion }
  | { kind: "yn-set"; questions: GuestQuestion[] };

function buildSlots(questions: GuestQuestion[]): QuestionSlot[] {
  const slots: QuestionSlot[] = [];
  let i = 0;
  while (i < questions.length) {
    const q = questions[i];
    const isYN = q.options.length === 2 && q.options[0] === "Yes" && q.options[1] === "No";
    if (isYN) {
      const setQs: GuestQuestion[] = [q];
      let j = i + 1;
      while (j < questions.length) {
        const nq = questions[j];
        const nIsYN = nq.options.length === 2 && nq.options[0] === "Yes" && nq.options[1] === "No";
        if (nIsYN && nq.context === q.context) { setQs.push(nq); j++; } else break;
      }
      slots.push({ kind: "yn-set", questions: setQs });
      i = j;
    } else {
      slots.push({ kind: "single", q });
      i++;
    }
  }
  return slots;
}

const Q_TYPE_LABELS: Record<string, string> = {
  "tf-direct": "Direct Retrieval",
  "tf-inference": "Inference",
  "tf-scope": "Scope Check",
  "dm-syllogism": "Syllogisms",
  "dm-interp": "Interpreting Info",
  "dm-logic": "Logic Puzzle",
  "dm-argument": "Arguments",
  "dm-venn": "Venn Diagram",
  "dm-probability": "Probability",
  "sjt-appropriateness": "Appropriateness",
  "sjt-importance": "Importance",
};

function questionTypeLabel(q: GuestQuestion): string {
  const qt = (q as any).questionType as string | undefined;
  if (qt) return qt;
  const tag = q.tag;
  for (const [k, v] of Object.entries(Q_TYPE_LABELS)) {
    if (tag.includes(k)) return v;
  }
  const parts = tag.split("-");
  return parts.slice(1, parts.length - 1).map(p => p[0].toUpperCase() + p.slice(1)).join(" ") || tag;
}

const DIFF_CLASS: Record<string, string> = {
  Bronze: "diff-bronze", Silver: "diff-silver", Gold: "diff-gold",
  Platinum: "diff-platinum", Diamond: "diff-diamond",
};

// ─── Session ─────────────────────────────────────────────────────────────────

function QuestionSession() {
  const router = useRouter();
  const params = useSearchParams();
  const section = params.get("sections")?.split(",")[0] ?? params.get("section") ?? "vr";
  const isGuest = params.get("guest") === "1";
  const difficulty = params.get("difficulty") ?? "Gold";
  const requestedCount = Number(params.get("count")) || 0;
  const colors = SECTION_COLORS[section] ?? SECTION_COLORS.vr;

  const useVRBank = section === "vr" && !isGuest;
  const useQRBank = section === "qr" && !isGuest;
  const useDMBank = section === "dm" && !isGuest;

  const staticQuestions: GuestQuestion[] = (() => {
    if (useVRBank || useQRBank || useDMBank) return [];
    const all = GUEST_QUESTIONS[section] ?? GUEST_QUESTIONS.vr;
    return requestedCount > 0 ? all.slice(0, requestedCount) : all;
  })();

  const [bankQuestions, setBankQuestions] = useState<GuestQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(useVRBank || useQRBank || useDMBank);
  const [vrError, setVrError] = useState("");
  const sessionIdRef = useRef<string>("");

  const startRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [lastTakenMs, setLastTakenMs] = useState(0);
  const allTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!useVRBank && !useQRBank && !useDMBank) return;
    const count = requestedCount > 0 ? requestedCount : (useQRBank ? 20 : 15);
    let endpoint = "";
    if (useQRBank) endpoint = `/api/questions/qr?difficulty=${encodeURIComponent(difficulty)}&count=${count}`;
    else if (useDMBank) {
      const family = params.get("type") ?? "";
      endpoint = `/api/questions/dm?difficulty=${encodeURIComponent(difficulty)}&count=${count}${family ? `&family=${encodeURIComponent(family)}` : ""}`;
    } else {
      const subtypeParam = params.get("subtype") ?? "";
      endpoint = `/api/questions/vr?difficulty=${encodeURIComponent(difficulty)}&count=${count}${subtypeParam ? `&subtype=${encodeURIComponent(subtypeParam)}` : ""}`;
    }
    fetch(endpoint)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setVrError(data.error); setBankLoading(false); return; }
        sessionIdRef.current = data.sessionId ?? `${section}-${Date.now()}`;
        setBankQuestions(data.questions ?? []);
        setBankLoading(false);
      })
      .catch(() => { setVrError("Failed to load questions. Please try again."); setBankLoading(false); });
  }, []);

  const questions: GuestQuestion[] = (useVRBank || useQRBank || useDMBank) ? bankQuestions : staticQuestions;
  const slots = useMemo(() => buildSlots(questions), [questions]);

  // Slot navigation
  const [slotIdx, setSlotIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [setSelections, setSetSelections] = useState<(number | null)[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);

  // Back navigation
  type QSnap = { selected: number | null; setSelections: (number | null)[]; revealed: boolean; flagged: boolean };
  const [snapshots, setSnapshots] = useState<Record<number, QSnap>>({});
  const [answeredSlots, setAnsweredSlots] = useState<Set<number>>(new Set());

  const slot = slots[slotIdx];
  const isLast = slotIdx === slots.length - 1;

  // Representative question (for context, vennFigure, passage)
  const q0: GuestQuestion | undefined = slot
    ? slot.kind === "single" ? slot.q : slot.questions[0]
    : undefined;

  // Timer target for current slot
  const baseTarget = TARGET_S[section] ?? 40;
  const targetS = slot?.kind === "yn-set" ? baseTarget * slot.questions.length : baseTarget;

  // Reset timer on slot change
  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slotIdx]);

  if (bankLoading) {
    return (
      <div className="screen-question" style={{ "--section": colors.color, "--section-deep": colors.deep, "--section-tint": colors.tint } as any}>
        <div className="question-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Building your {section.toUpperCase()} session…</p>
        </div>
      </div>
    );
  }

  if (vrError || questions.length === 0 || !slot || !q0) {
    return (
      <div className="screen-question" style={{ "--section": colors.color, "--section-deep": colors.deep, "--section-tint": colors.tint } as any}>
        <div className="question-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <p style={{ color: "var(--coral)", fontSize: 14, marginBottom: 12 }}>
              {vrError || "No questions available for that selection. Try a different difficulty."}
            </p>
            <Link href={`/practice/${section}`}><button style={{ background: colors.color, color: "white", border: 0, borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 700 }}>← Back to practice</button></Link>
          </div>
        </div>
      </div>
    );
  }

  // VR passage tracking
  const prevPassageCode = slotIdx > 0 && slots[slotIdx - 1].kind === "single"
    ? (slots[slotIdx - 1] as { kind: "single"; q: GuestQuestion }).q
    : null;
  const curPassageCode = (q0 as any).passageCode;
  const isNewPassage = useVRBank && curPassageCode && (prevPassageCode as any)?.passageCode !== curPassageCode;

  // Can we confirm?
  const canConfirm = slot.kind === "single"
    ? selected !== null
    : slot.questions.every((_, i) => setSelections[i] !== undefined && setSelections[i] !== null);

  function saveSlotSnap(i: number) {
    setSnapshots(prev => ({ ...prev, [i]: { selected, setSelections, revealed, flagged } }));
  }

  function handleBack() {
    if (slotIdx === 0) return;
    const prevSnap = snapshots[slotIdx - 1];
    saveSlotSnap(slotIdx);
    setSlotIdx(s => s - 1);
    if (prevSnap) {
      setSelected(prevSnap.selected); setSetSelections(prevSnap.setSelections);
      setRevealed(prevSnap.revealed); setFlagged(prevSnap.flagged);
    } else {
      setSelected(null); setSetSelections([]); setRevealed(false); setFlagged(false);
    }
  }

  const handleSelect = (i: number) => { if (!revealed) setSelected(i); };

  const handleSetSelect = (qIdx: number, ansIdx: number) => {
    if (revealed) return;
    setSetSelections(prev => {
      const next = [...prev];
      next[qIdx] = ansIdx;
      return next;
    });
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const takenMs = Date.now() - startRef.current;
    setLastTakenMs(takenMs);
    allTimesRef.current = [...allTimesRef.current, takenMs];
    setRevealed(true);

    if (!answeredSlots.has(slotIdx)) {
      setAnsweredSlots(prev => new Set([...prev, slotIdx]));
      if (slot.kind === "single") {
        const isCorrect = selected === slot.q.correct;
        setAnswers(prev => [...prev, { correct: isCorrect }]);
        if (!isGuest) {
          fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionIdRef.current, session_type: "practice",
              question_index: slotIdx, question_tag: slot.q.tag, is_correct: isCorrect,
              time_taken_ms: takenMs, selected_answer: String(selected), correct_answer: String(slot.q.correct) }),
          }).catch(() => {});
        }
      } else {
        const results = slot.questions.map((q, i) => ({ correct: setSelections[i] === q.correct }));
        setAnswers(prev => [...prev, ...results]);
        if (!isGuest) {
          slot.questions.forEach((q, i) => {
            const isCorrect = setSelections[i] === q.correct;
            fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: sessionIdRef.current, session_type: "practice",
                question_index: slotIdx * 10 + i, question_tag: q.tag, is_correct: isCorrect,
                time_taken_ms: Math.round(takenMs / slot.questions.length),
                selected_answer: String(setSelections[i]), correct_answer: String(q.correct) }),
            }).catch(() => {});
          });
        }
      }
    }
  };

  const handleNext = () => {
    const nextSnap = snapshots[slotIdx + 1];
    saveSlotSnap(slotIdx);

    if (isLast) {
      const totalCorrect = answers.filter(a => a.correct).length;
      const totalQs = slots.reduce((acc, s) => acc + (s.kind === "yn-set" ? s.questions.length : 1), 0);
      const times = allTimesRef.current;
      const avgMs = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
      if (isGuest) {
        document.cookie = `pm_done_${section}=${JSON.stringify({ correct: totalCorrect, total: totalQs })}; path=/; max-age=31536000; SameSite=Lax`;
      }
      router.push(`/results?section=${section}&total=${totalQs}&correct=${totalCorrect}&avgMs=${avgMs}&sessionId=${encodeURIComponent(sessionIdRef.current)}${isGuest ? "&guest=1" : ""}`);
      return;
    }
    setSlotIdx(s => s + 1);
    if (nextSnap) {
      setSelected(nextSnap.selected); setSetSelections(nextSnap.setSelections);
      setRevealed(nextSnap.revealed); setFlagged(nextSnap.flagged);
    } else {
      setSelected(null); setSetSelections([]); setRevealed(false); setFlagged(false);
    }
  };

  // Progress
  const totalSlots = slots.length;
  const doneSlots = slotIdx + (revealed ? 1 : 0);
  const pct = Math.round((doneSlots / totalSlots) * 100);

  // VR passage counter
  const passageNumber = useVRBank && curPassageCode
    ? [...new Set(slots.slice(0, slotIdx + 1).map(s => (s.kind === "single" ? (s.q as any).passageCode : null)))].filter(Boolean).length
    : null;
  const totalPassages = useVRBank
    ? [...new Set(slots.map(s => (s.kind === "single" ? (s.q as any).passageCode : null)))].filter(Boolean).length
    : null;

  // Timer class
  const timerCls = revealed ? "q-timer--done" : elapsed < targetS ? "q-timer--ok" : "q-timer--over";

  // Question type label (from first question in slot)
  const typeLabel = questionTypeLabel(q0);
  const diff = (q0 as any).difficulty as string | undefined;

  return (
    <div className="screen-question" style={{ "--section": colors.color, "--section-deep": colors.deep, "--section-tint": colors.tint } as any}>
      <div className="question-screen">
        <div className="question-topbar">
          <Link href="/" className="question-brand">
            <svg viewBox="0 0 48 32" aria-hidden="true"><path d="M2 18h9l4-13 7 24 6-18 5 7h13" /></svg>
            <span>Pulsemed</span>
            <i>{colors.short}</i>
            <strong>Practice session</strong>
          </Link>
          <div className="question-progress">
            <span>
              {passageNumber !== null
                ? `Passage ${passageNumber} of ${totalPassages} · Q${slotIdx + 1} of ${totalSlots}`
                : `Question ${slotIdx + 1} of ${totalSlots}`}
            </span>
            <div><i style={{ width: `${pct}%` }} /></div>
          </div>
          <div className="question-tools">
            <span className={`q-timer ${timerCls}`}>
              ⏱ {revealed ? fmtSec(lastTakenMs) : fmtSec(elapsed * 1000)}
            </span>
            <button className={flagged ? "flagged" : ""} onClick={() => setFlagged(f => !f)}>
              {flagged ? "★ Flagged" : "☆ Flag"}
            </button>
            <Link href={`/practice/${section}`}>
              <button>✕ End session</button>
            </Link>
          </div>
        </div>

        <div className="question-main" style={section === "vr" ? { width: "min(1440px, calc(100% - 40px))" } : undefined}>
          {isNewPassage && (
            <div style={{ marginBottom: 12, padding: "6px 14px", background: colors.tint, borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: colors.color }}>
                Passage {passageNumber} of {totalPassages} — {(q0 as any).passageTitle}
              </span>
            </div>
          )}

          {/* Question type + difficulty badges */}
          <div className="q-meta-row">
            <span className="q-type-badge">{typeLabel}</span>
            {diff && <span className={`q-difficulty-badge ${DIFF_CLASS[diff] ?? ""}`}>{diff}</span>}
            <small style={{ marginLeft: "auto", color: "var(--ink-soft)", fontSize: 11 }}>
              {slot.kind === "yn-set" ? `${slot.questions.length} statements · target ${targetS}s` : `target ${targetS}s`}
            </small>
          </div>

          <div
            className="question-columns"
            style={section === "vr" ? { gridTemplateColumns: "1.75fr 1fr" } : undefined}
          >
            {/* LEFT — Passage / context */}
            <div
              className={section === "vr" ? undefined : "question-context"}
              style={section === "vr" ? { padding: "8px 20px 8px 4px", overflowY: "auto", maxHeight: "calc(100vh - 220px)" } : undefined}
            >
              <p style={section === "vr" ? { margin: "0 0 12px", color: "var(--section)", letterSpacing: ".1em", fontSize: 10, fontWeight: 800, textTransform: "uppercase" } : undefined}>{q0.contextLabel}</p>
              <div
                className={`passage-text ${revealed && q0.supportingEvidence ? "passage-text--revealed" : ""}`}
                style={{ whiteSpace: "pre-line", fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.85, color: "#334354" }}
              >
                <HighlightedPassage text={q0.context} evidence={q0.supportingEvidence} revealed={revealed} />
              </div>
              {(q0 as any).vennFigure && (
                <VennDiagram fig={(q0 as any).vennFigure as VennFigure} />
              )}
            </div>

            {/* RIGHT — Question(s) + answers */}
            <div className="question-answer">
              {slot.kind === "yn-set" ? (
                /* ── YN set: all statements at once ── */
                <>
                  <p>YES OR NO — evaluate each statement</p>
                  <div className="yn-set-list">
                    {slot.questions.map((q, i) => {
                      const sel = setSelections[i] ?? null;
                      const isRight = revealed && sel === q.correct;
                      const isWrong = revealed && sel !== null && sel !== q.correct;
                      return (
                        <div key={q.id} className={`yn-row${revealed ? (isRight ? " yn-row--right" : " yn-row--wrong") : ""}`}>
                          <div className="yn-statement">
                            <span className="yn-num">{i + 1}</span>
                            <p>{q.question}</p>
                          </div>
                          <div className="yn-btns">
                            {["Yes", "No"].map((opt, j) => {
                              let cls = "yn-btn";
                              if (revealed) {
                                if (j === q.correct) cls += " yn-correct";
                                else if (j === sel) cls += " yn-incorrect";
                              } else if (j === sel) cls += " yn-selected";
                              return (
                                <button key={j} className={cls} onClick={() => handleSetSelect(i, j)} disabled={revealed}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {revealed && (
                            <div className="yn-exp">
                              <span className={isRight ? "yn-tick" : "yn-cross"}>{isRight ? "✓" : "✗"}</span>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* ── Single MCQ ── */
                <>
                  <p>QUESTION</p>
                  <h2>{slot.q.question}</h2>
                  <div className="answer-list">
                    {slot.q.options.map((opt, i) => {
                      let cls = "";
                      if (revealed) {
                        if (i === slot.q.correct) cls = "correct";
                        else if (i === selected) cls = "incorrect";
                      } else if (i === selected) cls = "selected";
                      return (
                        <button key={i} className={cls} onClick={() => handleSelect(i)}>
                          <span>{String.fromCharCode(65 + i)}</span>
                          {opt}
                          {revealed && i === slot.q.correct && <b>✓</b>}
                        </button>
                      );
                    })}
                  </div>
                  {revealed && selected !== null && (
                    <AnswerExplanation q={slot.q} selected={selected} takenMs={lastTakenMs} section={section} />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="question-actions">
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ghost" onClick={handleBack} disabled={slotIdx === 0} style={{ opacity: slotIdx === 0 ? 0.4 : 1 }}>← Back</button>
              <Link href={`/practice/${section}`}><button className="ghost">✕ Exit</button></Link>
            </div>
            {!revealed ? (
              <button className="question-primary" disabled={!canConfirm} onClick={handleConfirm}>
                Confirm {slot.kind === "yn-set" ? "all answers" : "answer"}
              </button>
            ) : (
              <button className="question-primary" onClick={handleNext}>
                {isLast ? "See results →" : "Next →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "var(--ink-soft)" }}>Loading session…</div>}>
      <QuestionSession />
    </Suspense>
  );
}
