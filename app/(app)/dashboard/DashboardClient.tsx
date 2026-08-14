"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { User } from "next-auth";

const SECTIONS = [
  { key: "vr", label: "Verbal Reasoning", short: "VR", color: "#2d7ff9", deep: "#1a5fd0", tint: "#eaf2ff", cardColor: "var(--blue)", cardTint: "var(--blue-tint)", targetTime: 32 },
  { key: "dm", label: "Decision Making", short: "DM", color: "#8b6bff", deep: "#6747d8", tint: "#f1ecff", cardColor: "var(--purple)", cardTint: "#f1ecff", targetTime: 61 },
  { key: "qr", label: "Quantitative Reasoning", short: "QR", color: "#3dbe6c", deep: "#259650", tint: "#edfbf3", cardColor: "var(--green)", cardTint: "#edfbf3", targetTime: 39 },
  { key: "sjt", label: "Situational Judgement", short: "SJT", color: "#ff6b5c", deep: "#d94b3e", tint: "#ffedea", cardColor: "var(--coral)", cardTint: "#ffedea", targetTime: 23 },
];

type Props = {
  user: User;
  userRow: any;
  responses: any[];
  testDate: string | null;
  diagnosticDone: boolean;
  diagnosticScore: number | null;
  diagnosticBand: number | null;
  practiceSessions: any[];
};

export default function DashboardClient({ user, userRow, responses, testDate, diagnosticDone, diagnosticScore, diagnosticBand, practiceSessions }: Props) {
  const [plan, setPlan] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    fetch("/api/study-plan")
      .then(r => r.json())
      .then(d => { setPlan(d.plan); setPlanLoading(false); })
      .catch(() => setPlanLoading(false));
  }, []);

  const totalDone = responses.length;
  const totalCorrect = responses.filter(r => r.is_correct).length;
  const accuracy = totalDone > 0 ? Math.round((totalCorrect / totalDone) * 100) : 0;

  const examDate = testDate ? new Date(testDate) : null;
  const daysLeft = examDate ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000)) : null;
  const examDateFormatted = examDate
    ? examDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const sectionStats = SECTIONS.map(s => {
    const sResponses = responses.filter(r => r.question_tag?.startsWith(s.key + "-"));
    const correct = sResponses.filter(r => r.is_correct).length;
    const pct = sResponses.length > 0 ? Math.round((correct / sResponses.length) * 100) : 0;
    const avgMs = sResponses.length > 0 && sResponses[0].time_taken_ms !== undefined
      ? sResponses.reduce((sum, r) => sum + (r.time_taken_ms ?? 0), 0) / sResponses.length
      : null;
    const avgSec = avgMs !== null ? Math.round(avgMs / 1000) : null;

    // Average predicted score from practice_sessions
    const sSessions = practiceSessions.filter(p => p.section === s.key);
    const withScore = sSessions.filter(p => p.predicted_score != null);
    const avgPredicted = withScore.length > 0
      ? Math.round(withScore.reduce((a, p) => a + p.predicted_score, 0) / withScore.length)
      : null;
    const lastBand = s.key === "sjt"
      ? (sSessions.find(p => p.sjt_band != null)?.sjt_band ?? null)
      : null;
    const sessionCount = sSessions.length;

    return { ...s, total: sResponses.length, accuracy: pct, avgSec, avgPredicted, lastBand, sessionCount };
  });


  const firstName = (user.name ?? "").split(" ")[0] || "there";

  return (
    <div style={{ "--section": "var(--blue)", "--section-deep": "var(--blue-deep)", "--section-tint": "var(--blue-tint)" } as any}>
      {/* Hero */}
      <div className="home-hero">
        <div>
          <p className="section-kicker">YOUR DASHBOARD</p>
          <h2>Welcome back, {firstName}</h2>
          {examDateFormatted && (
            <p style={{ margin: "6px 0 12px", fontSize: 13, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 6 }}>
              <svg style={{ width: 14, height: 14, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              UCAT exam &nbsp;·&nbsp; {examDateFormatted}
              {daysLeft !== null && <span style={{ marginLeft: 4, background: "rgba(255,255,255,0.2)", color: "white", borderRadius: 6, padding: "1px 8px", fontSize: 12 }}>{daysLeft}d left</span>}
            </p>
          )}
          <p style={{ opacity: planLoading ? 0.6 : 1 }}>
            {plan?.summary ?? (planLoading ? "Loading your study plan…" : "Complete more questions to unlock your personalised study plan.")}
          </p>
          {plan?.strengths?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {plan.strengths.slice(0, 2).map((s: any, i: number) => (
                <span key={i} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>✓ {s.label}</span>
              ))}
              {plan.weaknesses?.slice(0, 1).map((w: any, i: number) => (
                <span key={i} style={{ background: "rgba(255,100,80,0.35)", color: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>↑ {w.label}</span>
              ))}
            </div>
          )}
          <div className="hero-actions">
            <Link href="/study-plan">
              <button>Start today's plan →</button>
            </Link>
          </div>
        </div>
        <div className="hero-ring">
          <strong>{accuracy}%</strong>
          <span>overall<br />accuracy</span>
        </div>
      </div>

      {/* Diagnostic CTA or summary */}
      {!diagnosticDone ? (
        <div className="diag-cta-card">
          <div className="diag-cta-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D7FF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="diag-cta-body">
            <h3>Take your diagnostic test</h3>
            <p>91 questions across all four UCAT sections — about 55 minutes. Find your baseline score, discover your weak spots, and get a personalised 4-week AI study plan.</p>
          </div>
          <Link href="/diagnostic" style={{ flexShrink: 0 }}>
            <button className="diag-cta-btn">Start diagnostic →</button>
          </Link>
        </div>
      ) : (
        <div className="diag-done-card">
          <div className="diag-done-scores">
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
            <button className="diag-done-btn">View full report →</button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div>
            <span>Questions answered</span>
            <strong>{totalDone}</strong>
            <small><span className="positive">↑ keep going</span></small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon primary">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <span>Overall accuracy</span>
            <strong>{accuracy}%</strong>
            <small><span className={accuracy >= 70 ? "positive" : "time-good"}>{accuracy >= 70 ? "↑ on track" : "room to grow"}</span></small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <span>Days to exam</span>
            <strong>{daysLeft ?? "—"}</strong>
            <small>{examDateFormatted ? <span className="time-good">{examDateFormatted}</span> : <span>add exam date in settings</span>}</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon primary">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div>
            <span>Correct answers</span>
            <strong>{totalCorrect}</strong>
            <small><em>of {totalDone} attempted</em></small>
          </div>
        </div>
      </div>

      {/* Your progress */}
      <div className="content-card" style={{ padding: "20px 24px" }}>
        <p className="section-kicker" style={{ marginBottom: 16 }}>YOUR PROGRESS</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {sectionStats.map((s, i) => (
            <div key={s.key} style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 120px 160px",
              alignItems: "center",
              gap: 16,
              padding: "14px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--line)",
            }}>
              {/* Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: 10,
                  background: s.tint, color: s.color,
                  fontSize: 10, fontWeight: 900, letterSpacing: "0.04em", flexShrink: 0,
                }}>
                  {s.short}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>
                  {s.label.split(" ")[0]}<br />
                  <span style={{ fontWeight: 500, color: "var(--ink-soft)", fontSize: 11 }}>{s.label.split(" ").slice(1).join(" ")}</span>
                </span>
              </div>

              {/* Progress bar + question count */}
              <div>
                <div style={{ height: 6, background: "var(--line)", borderRadius: 4, overflow: "hidden", marginBottom: 5 }}>
                  <div style={{ height: "100%", width: `${s.accuracy}%`, background: s.color, borderRadius: 4, transition: "width .4s ease" }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 500 }}>
                  {s.total > 0 ? `${s.total} questions · ${s.sessionCount} session${s.sessionCount !== 1 ? "s" : ""}` : "No questions yet"}
                </span>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: s.total > 0 ? s.color : "var(--ink-soft)", lineHeight: 1 }}>
                  {s.total > 0 ? `${s.accuracy}%` : "—"}
                </span>
                <span style={{ fontSize: 10, color: "var(--ink-soft)", fontWeight: 500 }}>
                  {s.key === "sjt" && s.lastBand != null
                    ? `Band ${s.lastBand} predicted`
                    : s.avgPredicted != null
                    ? `${s.avgPredicted} predicted`
                    : "accuracy"}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6 }}>
                <Link href={`/section/${s.key}`}>
                  <button style={{
                    height: 32, padding: "0 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    background: "white", color: s.color, border: `1.5px solid ${s.color}33`,
                  }}>Learn</button>
                </Link>
                <Link href={`/practice/${s.key}`}>
                  <button style={{
                    height: 32, padding: "0 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    background: s.color, color: "white", border: "none",
                  }}>Practice</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
