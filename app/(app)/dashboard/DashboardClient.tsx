"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { User } from "next-auth";

const SECTIONS = [
  { key: "vr",  label: "Verbal Reasoning",      short: "VR",  color: "#2d7ff9", deep: "#1a5fd0", tint: "#eaf2ff", targetTime: 32 },
  { key: "dm",  label: "Decision Making",        short: "DM",  color: "#8b6bff", deep: "#6747d8", tint: "#f1ecff", targetTime: 61 },
  { key: "qr",  label: "Quantitative Reasoning", short: "QR",  color: "#3dbe6c", deep: "#259650", tint: "#edfbf3", targetTime: 39 },
  { key: "sjt", label: "Situational Judgement",  short: "SJT", color: "#ff6b5c", deep: "#d94b3e", tint: "#ffedea", targetTime: 23 },
];

type Props = {
  user: User;
  userRow: any;
  responses: any[];
  testDate: string | null;
  diagnosticDone: boolean;
  diagnosticScore: number | null;
  diagnosticBand: number | null;
  diagnosticVr: number | null;
  diagnosticDm: number | null;
  diagnosticQr: number | null;
  practiceSessions: any[];
};

function blendScore(diagScore: number | null, accuracy: number, sessionCount: number): number | null {
  if (diagScore === null && sessionCount === 0) return null;
  const practiceScore = Math.round(300 + (accuracy / 100) * 600);
  if (diagScore === null) return practiceScore;
  if (sessionCount === 0) return diagScore;
  const pw = Math.min(sessionCount * 0.15, 0.6);
  return Math.round(diagScore * (1 - pw) + practiceScore * pw);
}

function sjtBandFromAccuracy(accuracy: number): number {
  return accuracy >= 80 ? 1 : accuracy >= 65 ? 2 : accuracy >= 50 ? 3 : 4;
}

export default function DashboardClient({ user, responses, testDate, diagnosticDone, diagnosticScore, diagnosticBand, diagnosticVr, diagnosticDm, diagnosticQr, practiceSessions }: Props) {
  const [plan, setPlan] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    fetch("/api/study-plan")
      .then(r => r.json())
      .then(d => { setPlan(d.plan); setPlanLoading(false); })
      .catch(() => setPlanLoading(false));
  }, []);

  const totalDone    = responses.length;
  const totalCorrect = responses.filter(r => r.is_correct).length;
  const accuracy     = totalDone > 0 ? Math.round((totalCorrect / totalDone) * 100) : 0;

  const examDate          = testDate ? new Date(testDate) : null;
  const daysLeft          = examDate ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000)) : null;
  const examDateFormatted = examDate
    ? examDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const sectionStats = SECTIONS.map(s => {
    const sResponses  = responses.filter(r => r.question_tag?.startsWith(s.key + "-"));
    const correct     = sResponses.filter(r => r.is_correct).length;
    const pct         = sResponses.length > 0 ? Math.round((correct / sResponses.length) * 100) : 0;
    const sSessions   = practiceSessions.filter(p => p.section === s.key);
    const withScore   = sSessions.filter(p => p.predicted_score != null);
    const avgPredicted = withScore.length > 0
      ? Math.round(withScore.reduce((a, p) => a + p.predicted_score, 0) / withScore.length)
      : null;
    const lastBand    = s.key === "sjt" ? (sSessions.find(p => p.sjt_band != null)?.sjt_band ?? null) : null;
    return { ...s, total: sResponses.length, accuracy: pct, avgPredicted, lastBand, sessionCount: sSessions.length };
  });

  // ── Working grade ─────────────────────────────────────────────────────────
  const vrStat  = sectionStats.find(s => s.key === "vr")!;
  const dmStat  = sectionStats.find(s => s.key === "dm")!;
  const qrStat  = sectionStats.find(s => s.key === "qr")!;
  const sjtStat = sectionStats.find(s => s.key === "sjt")!;

  const wgVr  = blendScore(diagnosticVr,  vrStat.accuracy,  vrStat.sessionCount);
  const wgDm  = blendScore(diagnosticDm,  dmStat.accuracy,  dmStat.sessionCount);
  const wgQr  = blendScore(diagnosticQr,  qrStat.accuracy,  qrStat.sessionCount);

  const wgTotal = (wgVr !== null && wgDm !== null && wgQr !== null)
    ? wgVr + wgDm + wgQr : null;

  const wgSjt = (() => {
    const hasData = sjtStat.sessionCount > 0;
    const practiceBand = hasData ? sjtBandFromAccuracy(sjtStat.accuracy) : null;
    if (diagnosticBand === null) return practiceBand;
    if (practiceBand === null) return diagnosticBand;
    return Math.round((diagnosticBand + practiceBand) / 2);
  })();

  const wgDelta = (wgTotal !== null && diagnosticScore !== null) ? wgTotal - diagnosticScore : null;

  const COG_SECTIONS = [
    { key: "vr", label: "VR", diagScore: diagnosticVr, wg: wgVr, sessions: vrStat.sessionCount },
    { key: "dm", label: "DM", diagScore: diagnosticDm, wg: wgDm, sessions: dmStat.sessionCount },
    { key: "qr", label: "QR", diagScore: diagnosticQr, wg: wgQr, sessions: qrStat.sessionCount },
  ];

  const firstName = (user.name ?? "").split(" ")[0] || "there";

  /* Accuracy ring SVG values */
  const R = 40, C = 2 * Math.PI * R;
  const dash = C * (accuracy / 100);

  return (
    <div className="d2">

      {/* ── Top strip ─────────────────────────────────────────── */}
      <div className="d2-top">
        <div className="d2-greet">
          <p className="d2-eyebrow">YOUR DASHBOARD</p>
          <h2 className="d2-name">Welcome back, {firstName}</h2>
          <p className="d2-summary" style={{ opacity: planLoading ? 0.55 : 1 }}>
            {plan?.summary ?? (planLoading ? "Loading your study plan…" : "Complete more questions to unlock your personalised study plan.")}
          </p>
          {plan?.strengths?.length > 0 && (
            <div className="d2-tags">
              {plan.strengths.slice(0, 2).map((s: any, i: number) => (
                <span key={i} className="d2-tag good">✓ {s.label}</span>
              ))}
              {plan.weaknesses?.slice(0, 1).map((w: any, i: number) => (
                <span key={i} className="d2-tag warn">↑ {w.label}</span>
              ))}
            </div>
          )}
          <Link href="/study-plan">
            <button className="d2-cta">Start today's plan →</button>
          </Link>
        </div>

        <div className="d2-kpis">
          {/* Accuracy ring */}
          <div className="d2-ring-card">
            <svg viewBox="0 0 96 96" className="d2-ring-svg">
              <circle cx="48" cy="48" r={R} fill="none" stroke="#edf1f6" strokeWidth="10"/>
              <circle
                cx="48" cy="48" r={R} fill="none"
                stroke="#2d7ff9" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${C}`}
                transform="rotate(-90 48 48)"
              />
            </svg>
            <div className="d2-ring-inner">
              <strong>{accuracy}%</strong>
              <span>accuracy</span>
            </div>
          </div>

          {/* Exam countdown */}
          <div className="d2-kpi-stack">
            <div className="d2-kpi">
              <strong>{daysLeft ?? "—"}</strong>
              <span>days left</span>
              {examDateFormatted && <small>{examDateFormatted}</small>}
            </div>
            <div className="d2-kpi">
              <strong>{totalDone}</strong>
              <span>questions done</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Diagnostic banner / Working grade ────────────────────── */}
      {!diagnosticDone ? (
        <div className="d2-diag-banner">
          <div className="d2-diag-banner-deco" aria-hidden="true" />
          <div className="d2-diag-banner-body">
            <div className="d2-diag-banner-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <p className="d2-diag-banner-kicker">RECOMMENDED FIRST STEP</p>
              <h3 className="d2-diag-banner-title">Take your diagnostic test</h3>
              <p className="d2-diag-banner-desc">91 questions across all four UCAT sections — about 55 minutes. Find your baseline score, spot your weak areas, and unlock a personalised 4-week study plan.</p>
            </div>
          </div>
          <Link href="/diagnostic">
            <button className="d2-diag-banner-btn">Start diagnostic →</button>
          </Link>
        </div>
      ) : (
        <div className="d2-wg">
          <div className="d2-wg-deco" aria-hidden="true" />

          {/* Total score */}
          <div className="d2-wg-left">
            <p className="d2-wg-kicker">WORKING GRADE</p>
            <div className="d2-wg-total">
              <strong>{wgTotal ?? "—"}</strong>
              <span>/ 2700</span>
            </div>
            {wgDelta !== null && (
              <span className={`d2-wg-delta ${wgDelta > 0 ? "up" : wgDelta < 0 ? "dn" : "eq"}`}>
                {wgDelta > 0 ? `↑ +${wgDelta}` : wgDelta < 0 ? `↓ ${wgDelta}` : "="} from diagnostic
              </span>
            )}
            {wgTotal === null && <span className="d2-wg-delta eq">Complete the diagnostic to set your baseline</span>}
          </div>

          {/* Per-section breakdown */}
          <div className="d2-wg-sections">
            {COG_SECTIONS.map(s => {
              const delta = s.wg !== null && s.diagScore !== null ? s.wg - s.diagScore : null;
              return (
                <div key={s.key} className="d2-wg-sec">
                  <span className="d2-wg-sec-label">{s.label}</span>
                  <strong className="d2-wg-sec-score">{s.wg ?? "—"}</strong>
                  <span className={`d2-wg-sec-delta ${delta === null ? "eq" : delta > 0 ? "up" : delta < 0 ? "dn" : "eq"}`}>
                    {delta === null ? (s.diagScore ? "baseline" : "—") : delta > 0 ? `↑ +${delta}` : delta < 0 ? `↓ ${delta}` : "="}
                  </span>
                  <span className="d2-wg-sec-note">{s.sessions > 0 ? `${s.sessions} session${s.sessions !== 1 ? "s" : ""}` : "no practice"}</span>
                </div>
              );
            })}
          </div>

          {/* SJT band */}
          <div className="d2-wg-sjt">
            <p className="d2-wg-kicker" style={{ color: "rgba(255,255,255,.6)" }}>SJT BAND</p>
            <strong className="d2-wg-sjt-band">{wgSjt ? `Band ${wgSjt}` : "—"}</strong>
            <span className="d2-wg-sjt-note">
              {wgSjt === 1 ? "Excellent" : wgSjt === 2 ? "Good" : wgSjt === 3 ? "Average" : wgSjt === 4 ? "Below average" : ""}
            </span>
          </div>

          <Link href="/diagnostic/results" className="d2-wg-link">
            <button className="d2-wg-btn">Full report →</button>
          </Link>
        </div>
      )}

      {/* ── Section cards 2×2 ─────────────────────────────────── */}
      <div className="d2-section-grid">
        {sectionStats.map(s => {
          const predLabel = s.key === "sjt" && s.lastBand != null
            ? `Band ${s.lastBand} predicted`
            : s.avgPredicted != null
            ? `${s.avgPredicted} predicted`
            : s.total > 0 ? "No prediction yet" : "Start practising";

          return (
            <div key={s.key} className="d2-sc" style={{ "--sc": s.color, "--sc-tint": s.tint, "--sc-deep": s.deep } as any}>
              <div className="d2-sc-head">
                <span className="d2-sc-badge">{s.short}</span>
                <div className="d2-sc-meta">
                  <strong>{s.label}</strong>
                  <small>{s.total > 0 ? `${s.total} Q · ${s.sessionCount} session${s.sessionCount !== 1 ? "s" : ""}` : "Not started yet"}</small>
                </div>
                <span className="d2-sc-pct">{s.total > 0 ? `${s.accuracy}%` : "—"}</span>
              </div>

              <div className="d2-sc-bar-wrap">
                <div className="d2-sc-bar">
                  <div className="d2-sc-fill" style={{ width: `${s.accuracy}%` }} />
                </div>
                <span className="d2-sc-pred">{predLabel}</span>
              </div>

              <div className="d2-sc-actions">
                <Link href={`/section/${s.key}`}>
                  <button className="d2-sc-btn learn">Learn</button>
                </Link>
                <Link href={`/practice/${s.key}`}>
                  <button className="d2-sc-btn practice">Practice</button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom row ────────────────────────────────────────── */}
      <div className="d2-bottom">

        {/* Diagnostic results (if done) or a motivational placeholder */}
        {diagnosticDone ? (
          <div className="d2-diag-done">
            <p className="d2-eyebrow" style={{ marginBottom: 10 }}>DIAGNOSTIC RESULTS</p>
            <div className="d2-diag-scores">
              <div>
                <span>Total score</span>
                <strong style={{ color: "#2D7FF9" }}>{diagnosticScore} <small>/ 2700</small></strong>
              </div>
              <div>
                <span>SJT</span>
                <strong style={{ color: "#FF6B5C" }}>Band {diagnosticBand}</strong>
              </div>
            </div>
            <Link href="/diagnostic/results">
              <button className="d2-diag-done-btn">View full report →</button>
            </Link>
          </div>
        ) : (
          <div className="d2-stats-card">
            <p className="d2-eyebrow" style={{ marginBottom: 14 }}>QUICK TIPS</p>
            <div className="d2-stats-list">
              <div className="d2-stat-row"><span>Complete the diagnostic to get your baseline score and personalised plan.</span></div>
            </div>
          </div>
        )}

        {/* Stats summary */}
        <div className="d2-stats-card">
          <p className="d2-eyebrow" style={{ marginBottom: 14 }}>OVERALL STATS</p>
          <div className="d2-stats-list">
            <div className="d2-stat-row">
              <span>Questions answered</span>
              <strong>{totalDone}</strong>
            </div>
            <div className="d2-stat-row">
              <span>Correct answers</span>
              <strong>{totalCorrect}</strong>
            </div>
            <div className="d2-stat-row">
              <span>Overall accuracy</span>
              <strong style={{ color: accuracy >= 70 ? "#3dbe6c" : "#ff6b5c" }}>{accuracy}%</strong>
            </div>
            <div className="d2-stat-row">
              <span>Days to exam</span>
              <strong>{daysLeft ?? "—"}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
