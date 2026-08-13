"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as mock1 from "@/lib/mock1Data";
import * as mock2 from "@/lib/mock2Data";
import * as mock1Patch from "@/lib/mock1Patch";
import * as mock2Patch from "@/lib/mock2Patch";

type MockDataModule = typeof mock1;

// ── Section timing ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { key: "VR",  label: "Verbal Reasoning",      time: 22 * 60, color: "#2563eb", deep: "#1d4ed8", tint: "#eff6ff" },
  { key: "DM",  label: "Decision Making",        time: 37 * 60, color: "#7c3aed", deep: "#6d28d9", tint: "#f5f3ff" },
  { key: "QR",  label: "Quantitative Reasoning", time: 26 * 60, color: "#059669", deep: "#047857", tint: "#ecfdf5" },
  { key: "SJT", label: "Situational Judgement",  time: 26 * 60, color: "#d97706", deep: "#b45309", tint: "#fffbeb" },
] as const;

type SectionKey = "VR" | "DM" | "QR" | "SJT";

// ── Flat question types ────────────────────────────────────────────────────────

interface FlatVRQ {
  id: string; num: number;
  passageTitle: string; passageText: string;
  questionText: string; options: string[];
  isTFCT: boolean;
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
  fmt: string;
  correct: number;
  correctMost?: number;
  correctLeast?: number;
  factors?: string[];
  explanation: string;
}

// MostLeast answer: { most: number; least: number } where -1 = unset
interface MostLeastAnswer { most: number; least: number; }

type SJTAnswer = number | MostLeastAnswer;

type Phase = "cover" | "section-intro" | "running" | "section-break" | "results";

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function MockRunner({ mockId }: { mockId: "mock-1" | "mock-2" }) {
  const data = (mockId === "mock-2" ? mock2 : mock1) as MockDataModule;
  const patch = mockId === "mock-2" ? mock2Patch : mock1Patch;
  const sjtPatch = patch.SJT_ANSWERS;
  const dmPatch = patch.DM_EXPLANATIONS;
  const mlFactors = mockId === "mock-2" ? mock2Patch.MOSTLEAST_FACTORS : {} as Record<string, string[]>;

  // Flatten VR
  const vrFlat: FlatVRQ[] = data.VR_PASSAGES.flatMap(p =>
    p.questions.map(q => ({
      id: q.id, num: q.num,
      passageTitle: p.title, passageText: p.passageText,
      questionText: q.questionText, options: q.options,
      isTFCT: !!(q as any).isTFCT,
      correct: q.correct, explanation: q.explanation,
    }))
  );

  // Flatten DM with patched explanations
  const dmFlat: FlatDMQ[] = (data.DM_QUESTIONS as FlatDMQ[]).map(q => ({
    ...q,
    explanation: dmPatch[q.id] ?? q.explanation,
  }));

  // Flatten QR
  const qrFlat: FlatQRQ[] = data.QR_DATASETS.flatMap(d =>
    d.questions.map(q => ({
      id: q.id, num: q.num,
      datasetTitle: d.title, scenario: d.scenario,
      questionText: q.questionText, options: q.options,
      correct: q.correct, explanation: q.explanation,
    }))
  );

  // Flatten SJT with patched answers
  const sjtFlat: FlatSJTQ[] = data.SJT_SCENARIOS.flatMap(s =>
    s.questions.map(q => {
      const p = sjtPatch[q.id];
      const fmt = (q as any).fmt ?? "appropriateness";
      const factors = mlFactors[q.id];
      return {
        id: q.id, num: q.num,
        scenarioTitle: s.title, scenarioText: s.scenarioText,
        questionText: q.questionText,
        options: fmt === "most/least" && factors
          ? factors
          : q.options,
        fmt,
        correct: p ? p.correct : q.correct,
        correctMost: p?.correctMost,
        correctLeast: p?.correctLeast,
        factors,
        explanation: p?.explanation ?? q.explanation,
      };
    })
  );

  // State
  const [phase, setPhase] = useState<Phase>("cover");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECTIONS[0].time);

  const [vrAnswers, setVrAnswers] = useState<number[]>(Array(vrFlat.length).fill(-1));
  const [dmAnswers, setDmAnswers] = useState<(number | number[])[]>(
    dmFlat.map(q => q.format === "YN-5" ? Array(5).fill(-1) : -1)
  );
  const [qrAnswers, setQrAnswers] = useState<number[]>(Array(qrFlat.length).fill(-1));
  const [sjtAnswers, setSjtAnswers] = useState<SJTAnswer[]>(
    sjtFlat.map(q => q.fmt === "most/least" ? { most: -1, least: -1 } : -1)
  );

  const [resultView, setResultView] = useState<"summary" | "review">("summary");
  const [reviewSection, setReviewSection] = useState<SectionKey>("VR");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Hide sidebar when running
  useEffect(() => {
    if (phase === "running") {
      document.body.classList.add("screen-question");
    } else {
      document.body.classList.remove("screen-question");
    }
    return () => document.body.classList.remove("screen-question");
  }, [phase]);

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
  const flatQ = sectionIdx === 0 ? vrFlat : sectionIdx === 1 ? dmFlat : sectionIdx === 2 ? qrFlat : sjtFlat;
  const totalQ = flatQ.length;
  const currentQ = flatQ[qIdx];

  function setAnswer(val: number | number[] | MostLeastAnswer) {
    if (sectionIdx === 0) setVrAnswers(prev => { const n = [...prev]; n[qIdx] = val as number; return n; });
    else if (sectionIdx === 1) setDmAnswers(prev => { const n = [...prev]; n[qIdx] = val as number | number[]; return n; });
    else if (sectionIdx === 2) setQrAnswers(prev => { const n = [...prev]; n[qIdx] = val as number; return n; });
    else setSjtAnswers(prev => { const n = [...prev]; n[qIdx] = val as SJTAnswer; return n; });
  }

  function getCurrentAnswer(): number | number[] | MostLeastAnswer {
    if (sectionIdx === 0) return vrAnswers[qIdx];
    if (sectionIdx === 1) return dmAnswers[qIdx];
    if (sectionIdx === 2) return qrAnswers[qIdx];
    return sjtAnswers[qIdx];
  }

  // ── Score calculation ──────────────────────────────────────────────────────

  function calcScores() {
    const vrCorrect = vrFlat.filter((q, i) => vrAnswers[i] === q.correct).length;
    const vrScore = data.lookupScore(data.VR_SCORE_TABLE, vrCorrect);

    // DM: MCQ=1pt; YN-5: 5/5=2pts, 4/5=1pt, ≤3/5=0pts
    let dmRaw = 0;
    dmFlat.forEach((q, i) => {
      const ans = dmAnswers[i];
      if (q.format === "YN-5" && Array.isArray(ans) && q.correct5) {
        const correct5count = ans.filter((a, j) => a === q.correct5![j]).length;
        if (correct5count === 5) dmRaw += 2;
        else if (correct5count === 4) dmRaw += 1;
      } else if (q.format === "MCQ" && typeof ans === "number" && ans === q.correct) {
        dmRaw += 1;
      }
    });
    const dmScore = data.lookupScore(data.DM_SCORE_TABLE, dmRaw);

    const qrCorrect = qrFlat.filter((q, i) => qrAnswers[i] === q.correct).length;
    const qrScore = data.lookupScore(data.QR_SCORE_TABLE, qrCorrect);

    // SJT: exact=2pts, 1 away=1pt, 2+ away=0pts; mostleast: both=2pts, one=1pt, none=0pts
    let sjtRaw = 0;
    sjtFlat.forEach((q, i) => {
      const ans = sjtAnswers[i];
      if (q.fmt === "most/least" && q.correctMost !== undefined && q.correctLeast !== undefined) {
        const ml = ans as MostLeastAnswer;
        const mostOk = ml.most === q.correctMost;
        const leastOk = ml.least === q.correctLeast;
        if (mostOk && leastOk) sjtRaw += 2;
        else if (mostOk || leastOk) sjtRaw += 1;
      } else if (typeof ans === "number" && q.correct >= 0) {
        const diff = Math.abs(ans - q.correct);
        if (diff === 0) sjtRaw += 2;
        else if (diff === 1) sjtRaw += 1;
      }
    });
    const sjtBandNum = data.sjtBand(sjtRaw);

    return { vrCorrect, vrScore, dmRaw, dmScore, qrCorrect, qrScore, sjtRaw, sjtBandNum };
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
          <span style={{ fontSize: 22, fontWeight: 900, color: sec.color }}>{sectionIdx + 1}</span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: sec.color, margin: "0 0 6px" }}>
          Section {sectionIdx + 1} of 4
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>{sec.label}</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 28px" }}>
          {counts[sectionIdx]} questions · {fmtTime(sec.time)}
        </p>
        <button
          onClick={() => startSection(sectionIdx)}
          style={{ padding: "14px 36px", background: sec.color, color: "white", border: 0, borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
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
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>Next: {next.label}</p>
        <button
          onClick={() => { setSectionIdx(s => s + 1); setPhase("section-intro"); }}
          style={{ padding: "14px 36px", background: "#1e293b", color: "white", border: 0, borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Verbal Reasoning", sub: `${scores.vrCorrect}/${vrFlat.length} correct`, score: String(scores.vrScore), color: SECTIONS[0].color, tint: SECTIONS[0].tint },
              { label: "Decision Making", sub: `${scores.dmRaw} raw marks`, score: String(scores.dmScore), color: SECTIONS[1].color, tint: SECTIONS[1].tint },
              { label: "Quantitative Reasoning", sub: `${scores.qrCorrect}/${qrFlat.length} correct`, score: String(scores.qrScore), color: SECTIONS[2].color, tint: SECTIONS[2].tint },
              { label: "Situational Judgement", sub: `${scores.sjtRaw} raw pts`, score: `Band ${scores.sjtBandNum}`, color: SECTIONS[3].color, tint: SECTIONS[3].tint },
            ].map(s => (
              <div key={s.label} className="content-card" style={{ padding: "16px 18px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: s.color, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 900, margin: "0 0 2px", color: s.color }}>{s.score}</p>
                <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>{s.sub}</p>
              </div>
            ))}
          </div>

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
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setResultView("summary")}
            style={{ padding: "8px 14px", background: "transparent", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            ← Summary
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Answer Review</h2>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setReviewSection(s.key)}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: reviewSection === s.key ? s.color : "transparent",
                color: reviewSection === s.key ? "white" : "var(--ink-soft)",
                border: `1.5px solid ${reviewSection === s.key ? s.color : "var(--line)"}`,
                whiteSpace: "nowrap",
              }}
            >
              {s.key}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviewSection === "VR" && vrFlat.map((q, i) => (
            <ReviewCard key={q.id} num={i + 1}
              correct={vrAnswers[i] === q.correct}
              context={q.passageText} contextTitle={q.passageTitle}
              question={q.questionText}
              options={q.isTFCT ? ["True", "False", "Can't tell"] : q.options}
              userAnswer={vrAnswers[i]} correctAnswer={q.correct}
              explanation={q.explanation} />
          ))}
          {reviewSection === "DM" && dmFlat.map((q, i) => {
            const ua = dmAnswers[i];
            let correct = false;
            if (q.format === "YN-5" && Array.isArray(ua) && q.correct5) {
              correct = ua.every((a, j) => a === q.correct5![j]);
            } else if (q.format === "MCQ" && typeof ua === "number") {
              correct = ua === q.correct;
            }
            return <ReviewCardDM key={q.id} num={i + 1} correct={correct} q={q} userAnswer={ua} />;
          })}
          {reviewSection === "QR" && qrFlat.map((q, i) => (
            <ReviewCard key={q.id} num={i + 1}
              correct={qrAnswers[i] === q.correct}
              context={q.scenario} contextTitle={q.datasetTitle}
              question={q.questionText}
              options={q.options} userAnswer={qrAnswers[i]} correctAnswer={q.correct}
              explanation={q.explanation} />
          ))}
          {reviewSection === "SJT" && sjtFlat.map((q, i) => {
            const ans = sjtAnswers[i];
            let correct = false;
            if (q.fmt === "most/least" && q.correctMost !== undefined && q.correctLeast !== undefined) {
              const ml = ans as MostLeastAnswer;
              correct = ml.most === q.correctMost && ml.least === q.correctLeast;
            } else if (typeof ans === "number" && q.correct >= 0) {
              correct = ans === q.correct;
            }
            return (
              <ReviewCardSJT key={q.id} num={i + 1} correct={correct}
                q={q} userAnswer={ans} />
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

  let contextLabel = "PASSAGE";
  let contextTitle = "";
  let contextText = "";
  if (sectionIdx === 0) {
    const q = vrFlat[qIdx];
    contextLabel = "PASSAGE";
    contextTitle = q.passageTitle;
    contextText = q.passageText;
  } else if (sectionIdx === 1) {
    const q = dmFlat[qIdx];
    contextLabel = "STIMULUS";
    contextTitle = q.title;
    contextText = q.context;
  } else if (sectionIdx === 2) {
    const q = qrFlat[qIdx];
    contextLabel = "DATA";
    contextTitle = q.datasetTitle;
    contextText = q.scenario;
  } else {
    const q = sjtFlat[qIdx];
    contextLabel = "SCENARIO";
    contextTitle = q.scenarioTitle;
    contextText = q.scenarioText;
  }

  const dmQ = sectionIdx === 1 ? (currentQ as FlatDMQ) : null;
  const sjtQ = sectionIdx === 3 ? (currentQ as FlatSJTQ) : null;
  const vrQ = sectionIdx === 0 ? (currentQ as FlatVRQ) : null;

  function renderQuestion() {
    if (dmQ?.format === "YN-5") {
      return (
        <YN5Question
          q={dmQ}
          answer={userAnswer as number[]}
          setAnswer={setAnswer}
        />
      );
    }
    if (sjtQ?.fmt === "most/least" && sjtQ.factors) {
      return (
        <MostLeastQuestion
          q={sjtQ}
          answer={userAnswer as MostLeastAnswer}
          setAnswer={v => setAnswer(v)}
        />
      );
    }
    const opts = vrQ?.isTFCT
      ? ["True", "False", "Can't tell"]
      : (currentQ as any).options ?? [];
    return (
      <MCQQuestion
        questionText={(currentQ as any).questionText ?? ""}
        options={opts}
        answer={typeof userAnswer === "number" ? userAnswer : -1}
        setAnswer={setAnswer}
        color={sec.color}
      />
    );
  }

  // Progress dot helpers
  function isAnswered(i: number): boolean {
    if (sectionIdx === 0) return vrAnswers[i] !== -1;
    if (sectionIdx === 1) return Array.isArray(dmAnswers[i]) ? (dmAnswers[i] as number[]).some(a => a !== -1) : dmAnswers[i] !== -1;
    if (sectionIdx === 2) return qrAnswers[i] !== -1;
    const a = sjtAnswers[i];
    if (typeof a === "object") return (a as MostLeastAnswer).most !== -1 || (a as MostLeastAnswer).least !== -1;
    return a !== -1;
  }

  const cssVars = { "--section": sec.color, "--section-deep": sec.deep, "--section-tint": sec.tint } as React.CSSProperties;

  return (
    <div className="question-screen" style={cssVars}>
      {/* Top bar — same structure as diagnostic */}
      <div className="question-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i className="question-brand" style={{ background: sec.color, color: "white", fontStyle: "normal", fontWeight: 800, fontSize: 11, width: 35, height: 31, borderRadius: 8, display: "grid", placeItems: "center" }}>
            {sec.key}
          </i>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>{sec.label}</span>
        </div>

        <div className="question-progress">
          <span>Q{qIdx + 1} of {totalQ}</span>
          <div><i style={{ display: "block", height: "100%", background: "var(--section)", width: `${((qIdx + 1) / totalQ) * 100}%` }} /></div>
        </div>

        <div className="question-tools">
          <span style={{ fontVariantNumeric: "tabular-nums", color: timeLeft < 300 ? "#dc2626" : "var(--ink)", fontWeight: 800, fontSize: 13 }}>
            {fmtTime(timeLeft)}
          </span>
          <button onClick={handleSectionEnd}>
            {isLast && sectionIdx === 3 ? "Finish" : "End Section"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="question-main">
        <div className="question-meta">
          <span>{sec.label} · Q{qIdx + 1} / {totalQ}</span>
          <small>
            {/* Progress dots */}
            {Array.from({ length: Math.min(totalQ, 44) }).map((_, i) => (
              <span
                key={i}
                onClick={() => setQIdx(i)}
                title={`Q${i + 1}`}
                style={{
                  display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                  marginRight: 2, cursor: "pointer",
                  background: i === qIdx ? sec.color : isAnswered(i) ? sec.color + "66" : "#dfe5ed",
                  outline: i === qIdx ? `2px solid ${sec.color}` : "none",
                  outlineOffset: 1,
                }}
              />
            ))}
            {totalQ > 44 && <span style={{ fontSize: 9, color: "var(--ink-soft)" }}> +{totalQ - 44}</span>}
          </small>
        </div>

        <div className="question-columns">
          {/* Left — context (passage / stimulus / scenario) */}
          <div className="question-context">
            <p>{contextLabel}</p>
            <div>
              {contextText.split(/\n{2,}/).map((para, i) => (
                <p key={i} style={{ margin: "0 0 12px", lineHeight: 1.7 }}>{para.replace(/\n/g, " ").trim()}</p>
              ))}
            </div>
          </div>

          {/* Right — question + options */}
          <div className="question-answer">
            {renderQuestion()}

            <div className="question-actions" style={{ marginTop: 20 }}>
              <button
                className="ghost"
                onClick={() => setQIdx(i => Math.max(0, i - 1))}
                disabled={isFirst}
                style={{ opacity: isFirst ? 0.3 : 1 }}
              >
                ← Prev
              </button>
              <button
                className="question-primary"
                onClick={() => { if (isLast) handleSectionEnd(); else setQIdx(i => i + 1); }}
              >
                {isLast ? (sectionIdx === 3 ? "Finish →" : "Next Section →") : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
  color?: string;
}) {
  return (
    <div>
      <h2>{questionText}</h2>
      <div className="answer-list">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setAnswer(i)}
            className={answer === i ? "selected" : ""}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        ))}
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
        For each conclusion, select <strong>Yes</strong> if it must follow from the information and <strong>No</strong> if it does not.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(q.statements || []).map((stmt, i) => {
          const userYes = ans[i] === 0;
          const userNo  = ans[i] === 1;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              border: "1.5px solid var(--line)", borderRadius: 10, background: "white"
            }}>
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
                >Yes</button>
                <button
                  onClick={() => toggle(i, 1)}
                  style={{
                    padding: "5px 14px", borderRadius: 8, border: "1.5px solid",
                    borderColor: userNo ? "#dc2626" : "var(--line)",
                    background: userNo ? "#fef2f2" : "white",
                    color: userNo ? "#dc2626" : "var(--ink-soft)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}
                >No</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MostLeastQuestion({
  q,
  answer,
  setAnswer,
}: {
  q: FlatSJTQ;
  answer: MostLeastAnswer;
  setAnswer: (v: MostLeastAnswer) => void;
}) {
  const ml = answer && typeof answer === "object" ? answer : { most: -1, least: -1 };

  function pick(idx: number, role: "most" | "least") {
    const next = { ...ml };
    if (next[role] === idx) {
      next[role] = -1;
    } else {
      next[role] = idx;
      // can't be both most and least
      if (role === "most" && next.least === idx) next.least = -1;
      if (role === "least" && next.most === idx) next.most = -1;
    }
    setAnswer(next);
  }

  return (
    <div>
      <p style={{ fontSize: 14, lineHeight: 1.65, fontWeight: 500, margin: "0 0 16px" }}>
        {q.questionText}
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 800 }}>MOST</span>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 800 }}>LEAST</span>
        <span style={{ fontSize: 11, color: "var(--ink-soft)", alignSelf: "center" }}>Click a factor to assign</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(q.factors || []).map((factor, i) => {
          const isMost = ml.most === i;
          const isLeast = ml.least === i;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
              border: `1.5px solid ${isMost ? "#16a34a" : isLeast ? "#dc2626" : "var(--line)"}`,
              borderRadius: 10,
              background: isMost ? "#f0fdf4" : isLeast ? "#fef2f2" : "white",
            }}>
              <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: "var(--ink)" }}>{factor}</span>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => pick(i, "most")}
                  style={{
                    padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 800,
                    border: "1.5px solid", cursor: "pointer",
                    borderColor: isMost ? "#16a34a" : "var(--line)",
                    background: isMost ? "#16a34a" : "white",
                    color: isMost ? "white" : "var(--ink-soft)",
                  }}
                >Most</button>
                <button
                  onClick={() => pick(i, "least")}
                  style={{
                    padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 800,
                    border: "1.5px solid", cursor: "pointer",
                    borderColor: isLeast ? "#dc2626" : "var(--line)",
                    background: isLeast ? "#dc2626" : "white",
                    color: isLeast ? "white" : "var(--ink-soft)",
                  }}
                >Least</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Review cards ───────────────────────────────────────────────────────────────

function ReviewCard({
  num, correct, context, contextTitle, question, options,
  userAnswer, correctAnswer, explanation,
}: {
  num: number; correct: boolean;
  context: string; contextTitle: string;
  question: string; options: string[];
  userAnswer: number; correctAnswer: number;
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
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
          Q{num}. {question.slice(0, 90)}{question.length > 90 ? "…" : ""}
        </span>
        <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--line)" }}>
          {context && (
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", margin: "12px 0", fontSize: 12, lineHeight: 1.65, color: "var(--ink-soft)" }}>
              <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>{contextTitle}</strong>
              {context.slice(0, 500)}{context.length > 500 ? "…" : ""}
            </div>
          )}
          <p style={{ fontSize: 13, fontWeight: 600, margin: "10px 0 8px" }}>{question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {options.map((opt, i) => (
              <div key={i} style={{
                padding: "7px 10px", borderRadius: 7, fontSize: 12,
                background: i === correctAnswer ? "#dcfce7" : i === ua && !correct ? "#fee2e2" : "transparent",
                color: i === correctAnswer ? "#16a34a" : i === ua && !correct ? "#dc2626" : "var(--ink-soft)",
                fontWeight: (i === correctAnswer || (i === ua && !correct)) ? 700 : 400,
              }}>
                {String.fromCharCode(65 + i)}. {opt}
                {i === correctAnswer && " ✓"}
                {i === ua && i !== correctAnswer && " ✗"}
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
                const stmtOk = ua === ca;
                return (
                  <div key={i} style={{
                    padding: "8px 10px", borderRadius: 7, fontSize: 12, lineHeight: 1.5,
                    background: stmtOk ? "#dcfce7" : "#fee2e2",
                    color: stmtOk ? "#16a34a" : "#dc2626",
                  }}>
                    <strong>{i + 1}.</strong> {stmt}
                    <span style={{ marginLeft: 8, fontWeight: 600 }}>
                      {ua === -1 ? "(unanswered)" : ua === 0 ? "Your: Yes" : "Your: No"}
                      {" · Correct: "}{ca === 0 ? "Yes" : "No"}
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
                      fontWeight: (i === ca || (i === ua && ua !== ca)) ? 700 : 400,
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

function ReviewCardSJT({ num, correct, q, userAnswer }: {
  num: number; correct: boolean;
  q: FlatSJTQ; userAnswer: SJTAnswer;
}) {
  const [open, setOpen] = useState(false);

  const isMostLeast = q.fmt === "most/least";
  const ml = isMostLeast ? (userAnswer as MostLeastAnswer) : null;

  let statusIcon = "✗";
  let statusBg = "#fee2e2";
  let statusColor = "#dc2626";
  if (correct) { statusIcon = "✓"; statusBg = "#dcfce7"; statusColor = "#16a34a"; }
  else if (!isMostLeast && (userAnswer as number) === -1) { statusIcon = "–"; statusBg = "#f1f5f9"; statusColor = "var(--ink-soft)"; }
  else if (isMostLeast) {
    // partial?
    const bothOk = ml?.most === q.correctMost && ml?.least === q.correctLeast;
    const oneOk = ml?.most === q.correctMost || ml?.least === q.correctLeast;
    if (bothOk) { statusIcon = "✓"; statusBg = "#dcfce7"; statusColor = "#16a34a"; }
    else if (oneOk) { statusIcon = "½"; statusBg = "#fef9c3"; statusColor = "#b45309"; }
  } else {
    // partial credit for SJT
    const ua = userAnswer as number;
    if (ua !== -1 && q.correct >= 0) {
      const diff = Math.abs(ua - q.correct);
      if (diff === 1) { statusIcon = "½"; statusBg = "#fef9c3"; statusColor = "#b45309"; }
    }
  }

  return (
    <div className="content-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{
          width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center",
          background: statusBg, color: statusColor, fontSize: 12, fontWeight: 800, flexShrink: 0
        }}>
          {statusIcon}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
          Q{num}. {q.questionText.slice(0, 90)}{q.questionText.length > 90 ? "…" : ""}
        </span>
        <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--line)" }}>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", margin: "12px 0", fontSize: 12, lineHeight: 1.65, color: "var(--ink-soft)" }}>
            <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>{q.scenarioTitle}</strong>
            {q.scenarioText}
          </div>

          {isMostLeast && q.factors ? (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>{q.questionText}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {q.factors.map((f, i) => {
                  const isCorrMost = i === q.correctMost;
                  const isCorrLeast = i === q.correctLeast;
                  const isUserMost = ml?.most === i;
                  const isUserLeast = ml?.least === i;
                  return (
                    <div key={i} style={{
                      padding: "8px 10px", borderRadius: 7, fontSize: 12, lineHeight: 1.5,
                      background: (isCorrMost || isCorrLeast) ? "#dcfce7" : (isUserMost || isUserLeast) && !(isCorrMost || isCorrLeast) ? "#fee2e2" : "transparent",
                      color: (isCorrMost || isCorrLeast) ? "#16a34a" : (isUserMost || isUserLeast) && !(isCorrMost || isCorrLeast) ? "#dc2626" : "var(--ink-soft)",
                    }}>
                      {f}
                      {isCorrMost && <span style={{ marginLeft: 6, fontWeight: 800 }}>[Correct MOST ✓]</span>}
                      {isCorrLeast && <span style={{ marginLeft: 6, fontWeight: 800 }}>[Correct LEAST ✓]</span>}
                      {isUserMost && !isCorrMost && <span style={{ marginLeft: 6 }}>[Your MOST ✗]</span>}
                      {isUserLeast && !isCorrLeast && <span style={{ marginLeft: 6 }}>[Your LEAST ✗]</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>{q.questionText}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {q.options.map((opt, i) => {
                  const ua = typeof userAnswer === "number" ? userAnswer : -1;
                  const ca = q.correct;
                  return (
                    <div key={i} style={{
                      padding: "7px 10px", borderRadius: 7, fontSize: 12,
                      background: i === ca ? "#dcfce7" : i === ua && ua !== ca ? "#fee2e2" : "transparent",
                      color: i === ca ? "#16a34a" : i === ua && ua !== ca ? "#dc2626" : "var(--ink-soft)",
                      fontWeight: (i === ca || (i === ua && ua !== ca)) ? 700 : 400,
                    }}>
                      {String.fromCharCode(65 + i)}. {opt}
                      {i === ca && " ✓"}
                      {i === ua && i !== ca && " ✗"}
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
