"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type * as MockData from "@/lib/mock1Data";

type MockDataModule = typeof MockData;

// ── Section timing ──────────────────────────────────────────────────────────

const SECTIONS = [
  { key: "VR",  label: "Verbal Reasoning",      time: 22 * 60, color: "#2563eb", tint: "#eff6ff" },
  { key: "DM",  label: "Decision Making",        time: 37 * 60, color: "#7c3aed", tint: "#f5f3ff" },
  { key: "QR",  label: "Quantitative Reasoning", time: 26 * 60, color: "#059669", tint: "#ecfdf5" },
  { key: "SJT", label: "Situational Judgement",  time: 26 * 60, color: "#d97706", tint: "#fffbeb" },
] as const;

type SectionKey = "VR" | "DM" | "QR" | "SJT";

// ── Flat question types ──────────────────────────────────────────────────────

interface FlatVRQ {
  id: string; num: number;
  passageTitle: string; passageText: string;
  questionText: string; options: string[];
  correct: number; explanation: string;
}

interface FlatDMQ {
  id: string; num: number; title: string;
  format: "YN-5" | "MCQ";
  context: string;
  questionText?: string; options?: string[];
  correct?: number;
  statements?: string[]; correct5?: number[];
  explanation: string;
}

interface FlatQRQ {
  id: string; num: number;
  datasetTitle: string; scenario: string;
  questionText: string; options: string[];
  correct: number; explanation: string;
}

interface FlatSJTQ {
  id: string; num: number;
  scenarioTitle: string; scenarioText: string;
  questionText: string; options: string[];
  correct: number; explanation: string;
}

type Phase = "cover" | "section-intro" | "running" | "section-break" | "results";

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MockRunner({
  data,
  mockId,
}: {
  data: MockDataModule;
  mockId: "mock-1" | "mock-2";
}) {
  // Flatten all sections
  const vrFlat: FlatVRQ[] = data.VR_PASSAGES.flatMap(p =>
    p.questions.map(q => ({
      id: q.id, num: q.num,
      passageTitle: p.title, passageText: p.passageText,
      questionText: q.questionText, options: q.options,
      correct: q.correct, explanation: q.explanation,
    }))
  );

  const dmFlat: FlatDMQ[] = data.DM_QUESTIONS as FlatDMQ[];

  const qrFlat: FlatQRQ[] = data.QR_DATASETS.flatMap(d =>
    d.questions.map(q => ({
      id: q.id, num: q.num,
      datasetTitle: d.title, scenario: d.scenario,
      questionText: q.questionText, options: q.options,
      correct: q.correct, explanation: q.explanation,
    }))
  );

  const sjtFlat: FlatSJTQ[] = data.SJT_SCENARIOS.flatMap(s =>
    s.questions.map(q => ({
      id: q.id, num: q.num,
      scenarioTitle: s.title, scenarioText: s.scenarioText,
      questionText: q.questionText, options: q.options,
      correct: q.correct, explanation: q.explanation,
    }))
  );

  // State
  const [phase, setPhase] = useState<Phase>("cover");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECTIONS[0].time);

  // Answers: for each section, an array per question
  // DM YN-5 answers are arrays of 5 (0=Yes, 1=No, -1=unanswered)
  const [vrAnswers, setVrAnswers] = useState<number[]>(Array(vrFlat.length).fill(-1));
  const [dmAnswers, setDmAnswers] = useState<(number | number[])[]>(
    dmFlat.map(q => q.format === "YN-5" ? Array(5).fill(-1) : -1)
  );
  const [qrAnswers, setQrAnswers] = useState<number[]>(Array(qrFlat.length).fill(-1));
  const [sjtAnswers, setSjtAnswers] = useState<number[]>(Array(sjtFlat.length).fill(-1));

  const [showExplanations, setShowExplanations] = useState(false);
  const [resultView, setResultView] = useState<"summary" | "review">("summary");
  const [reviewSection, setReviewSection] = useState<SectionKey>("VR");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (phase !== "running") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSectionEnd();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sectionIdx]);

  function startSection(idx: number) {
    setSectionIdx(idx);
    setQIdx(0);
    setTimeLeft(SECTIONS[idx].time);
    setPhase("running");
  }

  function handleSectionEnd() {
    if (sectionIdx < SECTIONS.length - 1) {
      setPhase("section-break");
    } else {
      setPhase("results");
    }
  }

  const currentSection = SECTIONS[sectionIdx];

  // Current flat question arrays
  const flatQ = sectionIdx === 0 ? vrFlat : sectionIdx === 1 ? dmFlat : sectionIdx === 2 ? qrFlat : sjtFlat;
  const totalQ = flatQ.length;
  const currentQ = flatQ[qIdx];

  function setAnswer(val: number | number[]) {
    if (sectionIdx === 0) setVrAnswers(prev => { const n = [...prev]; n[qIdx] = val as number; return n; });
    else if (sectionIdx === 1) setDmAnswers(prev => { const n = [...prev]; n[qIdx] = val; return n; });
    else if (sectionIdx === 2) setQrAnswers(prev => { const n = [...prev]; n[qIdx] = val as number; return n; });
    else setSjtAnswers(prev => { const n = [...prev]; n[qIdx] = val as number; return n; });
  }

  function getCurrentAnswer() {
    if (sectionIdx === 0) return vrAnswers[qIdx];
    if (sectionIdx === 1) return dmAnswers[qIdx];
    if (sectionIdx === 2) return qrAnswers[qIdx];
    return sjtAnswers[qIdx];
  }

  // ── Score calculation ──────────────────────────────────────────────────────

  function calcScores() {
    const vrCorrect = vrFlat.filter((q, i) => vrAnswers[i] === q.correct).length;
    const vrScore = data.lookupScore(data.VR_SCORE_TABLE, vrCorrect);

    let dmCorrect = 0;
    dmFlat.forEach((q, i) => {
      const ans = dmAnswers[i];
      if (q.format === "YN-5" && Array.isArray(ans) && q.correct5) {
        if (ans.every((a, j) => a === q.correct5![j])) dmCorrect++;
      } else if (q.format === "MCQ" && typeof ans === "number") {
        if (ans === q.correct) dmCorrect++;
      }
    });
    const dmScore = data.lookupScore(data.DM_SCORE_TABLE, dmCorrect);

    const qrCorrect = qrFlat.filter((q, i) => qrAnswers[i] === q.correct).length;
    const qrScore = data.lookupScore(data.QR_SCORE_TABLE, qrCorrect);

    const sjtCorrect = sjtFlat.filter((q, i) => sjtAnswers[i] === q.correct).length;
    const sjtRaw = sjtCorrect;
    const sjtBandNum = data.sjtBand(sjtRaw);

    return { vrCorrect, vrScore, dmCorrect, dmScore, qrCorrect, qrScore, sjtCorrect, sjtBandNum };
  }

  // ── Render phases ──────────────────────────────────────────────────────────

  if (phase === "cover") {
    return (
      <div style={{ maxWidth: 600, margin: "48px auto", padding: "0 24px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 8 }}>
          MOCK EXAM
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>{data.MOCK_LABEL}</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 32 }}>
          184 questions across all four UCAT sections — timed exam conditions.
        </p>

        <div className="content-card" style={{ padding: 24, marginBottom: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "0 0 10px", fontWeight: 700 }}>Section</th>
                <th style={{ textAlign: "right", padding: "0 0 10px", fontWeight: 700 }}>Questions</th>
                <th style={{ textAlign: "right", padding: "0 0 10px", fontWeight: 700 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Verbal Reasoning",      q: vrFlat.length,  t: "22 min" },
                { label: "Decision Making",        q: dmFlat.length,  t: "37 min" },
                { label: "Quantitative Reasoning", q: qrFlat.length,  t: "26 min" },
                { label: "Situational Judgement",  q: sjtFlat.length, t: "26 min" },
              ].map(row => (
                <tr key={row.label} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "10px 0", color: "var(--ink)" }}>{row.label}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", color: "var(--ink-soft)" }}>{row.q}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", color: "var(--ink-soft)" }}>{row.t}</td>
                </tr>
              ))}
              <tr>
                <td style={{ paddingTop: 10, fontWeight: 800 }}>Total</td>
                <td style={{ paddingTop: 10, textAlign: "right", fontWeight: 800 }}>
                  {vrFlat.length + dmFlat.length + qrFlat.length + sjtFlat.length}
                </td>
                <td style={{ paddingTop: 10, textAlign: "right", fontWeight: 800 }}>111 min</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setPhase("section-intro")}
            style={{ padding: "14px 32px", background: "#1e293b", color: "white", border: 0, borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
          >
            Start Mock →
          </button>
          <Link href="/mocks" style={{ fontSize: 13, color: "var(--ink-soft)" }}>← Back</Link>
        </div>
      </div>
    );
  }

  if (phase === "section-intro") {
    const sec = SECTIONS[sectionIdx];
    const counts = [vrFlat.length, dmFlat.length, qrFlat.length, sjtFlat.length];
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: sec.tint,
          display: "grid", placeItems: "center", margin: "0 auto 20px"
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: sec.color }}>
            {sectionIdx + 1}
          </span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: sec.color, margin: "0 0 6px" }}>
          Section {sectionIdx + 1} of 4
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>{sec.label}</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 28px" }}>
          {counts[sectionIdx]} questions · {fmtTime(sec.time)} minutes
        </p>
        <button
          onClick={() => startSection(sectionIdx)}
          style={{
            padding: "14px 36px", background: sec.color, color: "white",
            border: 0, borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer"
          }}
        >
          Begin Section →
        </button>
      </div>
    );
  }

  if (phase === "section-break") {
    const next = SECTIONS[sectionIdx + 1];
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>Section complete</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 28px" }}>
          {SECTIONS[sectionIdx].label} finished. Take a short break if needed.
        </p>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
          Next: {next.label}
        </p>
        <button
          onClick={() => { setSectionIdx(s => s + 1); setPhase("section-intro"); }}
          style={{
            padding: "14px 36px", background: "#1e293b", color: "white",
            border: 0, borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer"
          }}
        >
          Continue →
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const scores = calcScores();
    const total = scores.vrScore + scores.dmScore + scores.qrScore;

    if (resultView === "summary") {
      return (
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)", margin: "0 0 6px" }}>RESULTS</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>{data.MOCK_LABEL}</h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "0 0 24px" }}>Full results below. Review your answers anytime.</p>

          {/* Score cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Verbal Reasoning", correct: scores.vrCorrect, total: vrFlat.length, score: scores.vrScore, color: SECTIONS[0].color, tint: SECTIONS[0].tint },
              { label: "Decision Making", correct: scores.dmCorrect, total: dmFlat.length, score: scores.dmScore, color: SECTIONS[1].color, tint: SECTIONS[1].tint },
              { label: "Quantitative Reasoning", correct: scores.qrCorrect, total: qrFlat.length, score: scores.qrScore, color: SECTIONS[2].color, tint: SECTIONS[2].tint },
              { label: "Situational Judgement", correct: scores.sjtCorrect, total: sjtFlat.length, score: null, band: scores.sjtBandNum, color: SECTIONS[3].color, tint: SECTIONS[3].tint },
            ].map(s => (
              <div key={s.label} className="content-card" style={{ padding: "16px 18px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: s.color, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                {s.score !== null ? (
                  <p style={{ fontSize: 28, fontWeight: 900, margin: "0 0 2px", color: s.color }}>{s.score}</p>
                ) : (
                  <p style={{ fontSize: 28, fontWeight: 900, margin: "0 0 2px", color: s.color }}>Band {(s as any).band}</p>
                )}
                <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>
                  {s.correct}/{s.total} correct
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="content-card" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: "0 0 2px", fontWeight: 600 }}>Combined Score (VR + DM + QR)</p>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>SJT is reported as a Band (1–4) separately</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{total}</p>
              <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>/ 3600</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setResultView("review")}
              style={{ padding: "12px 20px", background: "#1e293b", color: "white", border: 0, borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}
            >
              Review answers →
            </button>
            <Link href="/mocks">
              <button style={{ padding: "12px 20px", background: "transparent", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Back to mocks
              </button>
            </Link>
          </div>
        </div>
      );
    }

    // Review view
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setResultView("summary")}
            style={{ padding: "8px 14px", background: "transparent", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            ← Summary
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Answer Review</h2>
        </div>

        {/* Section tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto" }}>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setReviewSection(s.key)}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: reviewSection === s.key ? s.color : "transparent",
                color: reviewSection === s.key ? "white" : "var(--ink-soft)",
                border: `1.5px solid ${reviewSection === s.key ? s.color : "var(--line)"}`,
                whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              {s.key}
            </button>
          ))}
        </div>

        {/* Questions list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviewSection === "VR" && vrFlat.map((q, i) => {
            const ua = vrAnswers[i];
            const correct = ua === q.correct;
            return (
              <ReviewCard key={q.id} num={i + 1} correct={correct}
                context={q.passageText} contextTitle={q.passageTitle}
                question={q.questionText}
                options={q.options} userAnswer={ua} correctAnswer={q.correct}
                explanation={q.explanation} />
            );
          })}
          {reviewSection === "DM" && dmFlat.map((q, i) => {
            const ua = dmAnswers[i];
            let correct = false;
            if (q.format === "YN-5" && Array.isArray(ua) && q.correct5) {
              correct = ua.every((a, j) => a === q.correct5![j]);
            } else if (q.format === "MCQ" && typeof ua === "number") {
              correct = ua === q.correct;
            }
            return (
              <ReviewCardDM key={q.id} num={i + 1} correct={correct} q={q} userAnswer={ua} />
            );
          })}
          {reviewSection === "QR" && qrFlat.map((q, i) => {
            const ua = qrAnswers[i];
            const correct = ua === q.correct;
            return (
              <ReviewCard key={q.id} num={i + 1} correct={correct}
                context={q.scenario} contextTitle={q.datasetTitle}
                question={q.questionText}
                options={q.options} userAnswer={ua} correctAnswer={q.correct}
                explanation={q.explanation} />
            );
          })}
          {reviewSection === "SJT" && sjtFlat.map((q, i) => {
            const ua = sjtAnswers[i];
            const correct = ua === q.correct;
            return (
              <ReviewCard key={q.id} num={i + 1} correct={correct}
                context={q.scenarioText} contextTitle={q.scenarioTitle}
                question={q.questionText}
                options={q.options} userAnswer={ua} correctAnswer={q.correct}
                explanation={q.explanation} />
            );
          })}
        </div>
      </div>
    );
  }

  // ── Running phase ──────────────────────────────────────────────────────────

  const sec = currentSection;
  const userAnswer = getCurrentAnswer();
  const isLast = qIdx === totalQ - 1;
  const isFirst = qIdx === 0;

  // Get context for current question
  let contextTitle = "";
  let contextText = "";
  if (sectionIdx === 0) {
    const q = vrFlat[qIdx];
    contextTitle = q.passageTitle;
    contextText = q.passageText;
  } else if (sectionIdx === 1) {
    const q = dmFlat[qIdx];
    contextTitle = q.title;
    contextText = q.context;
  } else if (sectionIdx === 2) {
    const q = qrFlat[qIdx];
    contextTitle = q.datasetTitle;
    contextText = q.scenario;
  } else {
    const q = sjtFlat[qIdx];
    contextTitle = q.scenarioTitle;
    contextText = q.scenarioText;
  }

  const dmQ = sectionIdx === 1 ? (currentQ as FlatDMQ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
        borderBottom: "1px solid var(--line)", background: "white", flexShrink: 0
      }}>
        <span style={{
          fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
          color: sec.color, background: sec.tint, padding: "3px 9px", borderRadius: 6
        }}>
          {sec.label}
        </span>
        <span style={{ fontSize: 13, color: "var(--ink-soft)", marginRight: "auto" }}>
          Q{qIdx + 1} of {totalQ}
        </span>
        <span style={{
          fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums",
          color: timeLeft < 300 ? "#dc2626" : "var(--ink)"
        }}>
          {fmtTime(timeLeft)}
        </span>
        <button
          onClick={handleSectionEnd}
          style={{
            padding: "6px 14px", background: "transparent", border: "1.5px solid var(--line)",
            borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "var(--ink)"
          }}
        >
          {isLast && sectionIdx === 3 ? "Finish" : "End Section"}
        </button>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left — context */}
        <div style={{
          width: "50%", padding: "20px 24px", borderRight: "1px solid var(--line)",
          overflowY: "auto", flexShrink: 0
        }}>
          <p style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
            color: sec.color, margin: "0 0 6px"
          }}>
            {sectionIdx === 0 ? "PASSAGE" : sectionIdx === 1 ? "STIMULUS" : sectionIdx === 2 ? "DATA" : "SCENARIO"}
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px", color: "var(--ink)" }}>{contextTitle}</p>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
            {contextText}
          </div>
        </div>

        {/* Right — question */}
        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
          {dmQ?.format === "YN-5" ? (
            <YN5Question q={dmQ} answer={userAnswer as number[]} setAnswer={setAnswer} />
          ) : (
            <MCQQuestion
              questionText={(currentQ as any).questionText || ""}
              options={(currentQ as any).options || []}
              answer={typeof userAnswer === "number" ? userAnswer : -1}
              setAnswer={setAnswer}
            />
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <button
              onClick={() => setQIdx(i => Math.max(0, i - 1))}
              disabled={isFirst}
              style={{
                padding: "10px 18px", border: "1.5px solid var(--line)", borderRadius: 10,
                background: "white", fontSize: 13, fontWeight: 700, cursor: isFirst ? "default" : "pointer",
                opacity: isFirst ? 0.3 : 1
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => {
                if (isLast) handleSectionEnd();
                else setQIdx(i => i + 1);
              }}
              style={{
                padding: "10px 18px", background: sec.color, border: 0, borderRadius: 10,
                color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer"
              }}
            >
              {isLast ? (sectionIdx === 3 ? "Finish →" : "Next Section →") : "Next →"}
            </button>

            {/* Mini progress */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap", maxWidth: 200 }}>
              {Array.from({ length: Math.min(totalQ, 44) }).map((_, i) => {
                const answered = sectionIdx === 0 ? vrAnswers[i] !== -1
                  : sectionIdx === 1 ? (Array.isArray(dmAnswers[i]) ? (dmAnswers[i] as number[]).some(a => a !== -1) : dmAnswers[i] !== -1)
                  : sectionIdx === 2 ? qrAnswers[i] !== -1
                  : sjtAnswers[i] !== -1;
                return (
                  <div
                    key={i}
                    onClick={() => setQIdx(i)}
                    style={{
                      width: 8, height: 8, borderRadius: "50%", cursor: "pointer",
                      background: i === qIdx ? sec.color : answered ? sec.color + "55" : "var(--line)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function MCQQuestion({
  questionText,
  options,
  answer,
  setAnswer,
}: {
  questionText: string;
  options: string[];
  answer: number;
  setAnswer: (v: number) => void;
}) {
  return (
    <div>
      <p style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500, margin: "0 0 20px" }}>
        {questionText}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt, i) => {
          const selected = answer === i;
          return (
            <button
              key={i}
              onClick={() => setAnswer(i)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
                border: `1.5px solid ${selected ? "#1e293b" : "var(--line)"}`,
                borderRadius: 10, background: selected ? "#f8fafc" : "white",
                cursor: "pointer", textAlign: "left", width: "100%",
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: "50%", border: `2px solid ${selected ? "#1e293b" : "var(--line)"}`,
                background: selected ? "#1e293b" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 11, fontWeight: 800, color: selected ? "white" : "var(--ink-soft)"
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)", paddingTop: 2 }}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YN5Question({
  q,
  answer,
  setAnswer,
}: {
  q: FlatDMQ;
  answer: number[];
  setAnswer: (v: number[]) => void;
}) {
  const ans = Array.isArray(answer) ? answer : Array(5).fill(-1);

  function toggle(idx: number, val: number) {
    const next = [...ans];
    next[idx] = next[idx] === val ? -1 : val;
    setAnswer(next);
  }

  return (
    <div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 16px" }}>
        For each conclusion, select <strong>Yes</strong> if it must follow and <strong>No</strong> if it does not.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(q.statements || []).map((stmt, i) => {
          const userYes = ans[i] === 0;
          const userNo  = ans[i] === 1;
          return (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                border: "1.5px solid var(--line)", borderRadius: 10, background: "white"
              }}
            >
              <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: "var(--ink)" }}>
                <span style={{ color: "var(--ink-soft)", fontWeight: 700, marginRight: 8 }}>{i + 1}.</span>
                {stmt}
              </span>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => toggle(i, 0)}
                  style={{
                    padding: "5px 14px", borderRadius: 8, border: "1.5px solid",
                    borderColor: userYes ? "#059669" : "var(--line)",
                    background: userYes ? "#ecfdf5" : "white",
                    color: userYes ? "#059669" : "var(--ink-soft)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={() => toggle(i, 1)}
                  style={{
                    padding: "5px 14px", borderRadius: 8, border: "1.5px solid",
                    borderColor: userNo ? "#dc2626" : "var(--line)",
                    background: userNo ? "#fef2f2" : "white",
                    color: userNo ? "#dc2626" : "var(--ink-soft)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewCard({
  num, correct, context, contextTitle, question, options,
  userAnswer, correctAnswer, explanation,
}: {
  num: number; correct: boolean;
  context: string; contextTitle: string;
  question: string; options: string[];
  userAnswer: number | number[]; correctAnswer: number;
  explanation: string;
}) {
  const [open, setOpen] = useState(false);
  const ua = typeof userAnswer === "number" ? userAnswer : -1;

  return (
    <div className="content-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{
          width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center",
          background: correct ? "#dcfce7" : ua === -1 ? "#f1f5f9" : "#fee2e2",
          color: correct ? "#16a34a" : ua === -1 ? "var(--ink-soft)" : "#dc2626",
          fontSize: 12, fontWeight: 800, flexShrink: 0
        }}>
          {correct ? "✓" : ua === -1 ? "–" : "✗"}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Q{num}. {question.slice(0, 80)}{question.length > 80 ? "…" : ""}</span>
        <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--line)" }}>
          {context && (
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", margin: "12px 0", fontSize: 12, lineHeight: 1.6, color: "var(--ink-soft)" }}>
              <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>{contextTitle}</strong>
              {context.slice(0, 400)}{context.length > 400 ? "…" : ""}
            </div>
          )}
          <p style={{ fontSize: 13, fontWeight: 600, margin: "10px 0 8px" }}>{question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {options.map((opt, i) => (
              <div key={i} style={{
                padding: "7px 10px", borderRadius: 7, fontSize: 12,
                background: i === correctAnswer ? "#dcfce7" : i === ua && !correct ? "#fee2e2" : "transparent",
                color: i === correctAnswer ? "#16a34a" : i === ua && !correct ? "#dc2626" : "var(--ink-soft)",
                fontWeight: i === correctAnswer || (i === ua && !correct) ? 700 : 400,
              }}>
                {String.fromCharCode(65 + i)}. {opt}
                {i === correctAnswer && " ✓"}
                {i === ua && !correct && " ✗"}
              </div>
            ))}
          </div>
          {explanation && (
            <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 10, lineHeight: 1.6, background: "#f8fafc", padding: "8px 10px", borderRadius: 7 }}>
              {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewCardDM({ num, correct, q, userAnswer }: {
  num: number; correct: boolean;
  q: FlatDMQ; userAnswer: number | number[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="content-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{
          width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center",
          background: correct ? "#dcfce7" : "#fee2e2",
          color: correct ? "#16a34a" : "#dc2626",
          fontSize: 12, fontWeight: 800, flexShrink: 0
        }}>
          {correct ? "✓" : "✗"}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Q{num}. {q.title} ({q.format})</span>
        <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--line)" }}>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", margin: "12px 0", fontSize: 12, lineHeight: 1.7, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
            {q.context}
          </div>
          {q.format === "YN-5" && q.statements && q.correct5 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {q.statements.map((stmt, i) => {
                const ua = Array.isArray(userAnswer) ? userAnswer[i] : -1;
                const ca = q.correct5![i];
                const stmtCorrect = ua === ca;
                return (
                  <div key={i} style={{
                    padding: "8px 10px", borderRadius: 7, fontSize: 12, lineHeight: 1.5,
                    background: stmtCorrect ? "#dcfce7" : "#fee2e2",
                    color: stmtCorrect ? "#16a34a" : "#dc2626",
                  }}>
                    <strong>{i + 1}.</strong> {stmt}
                    <span style={{ marginLeft: 8 }}>
                      {ua === -1 ? "(unanswered)" : ua === 0 ? "Your answer: Yes" : "Your answer: No"}
                      {" — "}Correct: {ca === 0 ? "Yes" : "No"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>{q.questionText}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(q.options || []).map((opt, i) => {
                  const ua = typeof userAnswer === "number" ? userAnswer : -1;
                  const ca = q.correct ?? 0;
                  return (
                    <div key={i} style={{
                      padding: "7px 10px", borderRadius: 7, fontSize: 12,
                      background: i === ca ? "#dcfce7" : i === ua && ua !== ca ? "#fee2e2" : "transparent",
                      color: i === ca ? "#16a34a" : i === ua && ua !== ca ? "#dc2626" : "var(--ink-soft)",
                      fontWeight: i === ca || (i === ua && ua !== ca) ? 700 : 400,
                    }}>
                      {String.fromCharCode(65 + i)}. {opt}
                      {i === ca && " ✓"}
                      {i === ua && ua !== ca && " ✗"}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {q.explanation && (
            <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 10, lineHeight: 1.6, background: "#f8fafc", padding: "8px 10px", borderRadius: 7 }}>
              {q.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
