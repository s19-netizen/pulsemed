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

  const recentActivity = responses.slice(0, 5);

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
            <Link href={(() => {
              const p = plan?.priority?.[0];
              const href = p?.href ?? "";
              let base = "/practice/dm";
              if (href.includes("verbal_reasoning") || href.includes("/vr")) base = "/practice/vr";
              else if (href.includes("quantitative") || href.includes("/qr")) base = "/practice/qr";
              else if (href.includes("situational") || href.includes("/sjt")) base = "/practice/sjt";
              if (!p) return base;
              return `${base}?from=plan&focus=${encodeURIComponent(p.label ?? "")}&reason=${encodeURIComponent(p.reason ?? "")}`;
            })()}>
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

      {/* Main grid */}
      <div className="home-lower-grid">
        {/* Left: Sections + Recent activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Section cards */}
          <div className="content-card">
            <div className="section-heading">
              <div>
                <p className="section-kicker">SECTIONS</p>
                <h2>Your progress</h2>
              </div>
            </div>
            <div className="home-section-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
              {sectionStats.map(s => (
                <div
                  key={s.key}
                  className="home-subject-card"
                  style={{ "--card-color": s.cardColor, "--card-tint": s.cardTint } as any}
                >
                  <div className="subject-card-head">
                    <span><span style={{ fontWeight: 900, fontSize: 11, color: s.color }}>{s.short}</span></span>
                    <div>
                      <small>{s.short}</small>
                      <h3>{s.label.split(" ")[0]}</h3>
                    </div>
                  </div>
                  <div className="subject-score">
                    <div><span>Accuracy</span><strong>{s.accuracy}%</strong></div>
                    <div>
                      {s.key === "sjt" && s.lastBand != null ? (
                        <>
                          <span>Predicted band</span>
                          <strong style={{ color: s.color }}>Band {s.lastBand}</strong>
                        </>
                      ) : s.avgPredicted != null ? (
                        <>
                          <span>Avg predicted</span>
                          <strong style={{ color: s.color }}>{s.avgPredicted}</strong>
                        </>
                      ) : (
                        <>
                          <span>Target time</span>
                          <strong>{s.targetTime}s</strong>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 6, marginBottom: 8 }}>
                    <span style={{ color: "var(--ink-soft)", fontSize: 8, fontWeight: 750 }}>
                      {s.total} questions · {s.sessionCount} session{s.sessionCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="subject-progress"><span style={{ width: `${s.accuracy}%` }} /></div>
                  <div className="subject-actions">
                    <Link href={`/section/${s.key}`}><button>Learn</button></Link>
                    <Link href={`/practice/${s.key}`}><button>Practice</button></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="content-card week-card">
            <div className="week-head">
              <div className="week-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div>
                <h2>Recent activity</h2>
                <p>Your latest practice sessions</p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              {recentActivity.length === 0 ? (
                <p style={{ color: "var(--ink-soft)", fontSize: 12, padding: "16px 0" }}>No activity yet — start practising!</p>
              ) : recentActivity.map((r, i) => (
                <div key={i} className="activity-row">
                  <div className="activity-icon">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/></svg>
                  </div>
                  <p>
                    <strong>{r.question_tag?.split("-").slice(0, 2).join(" ").toUpperCase() ?? "Question"}</strong>
                    <small>{r.is_correct ? "Correct ✓" : "Incorrect ✗"}</small>
                  </p>
                  <time>{new Date(r.created_at).toLocaleDateString()}</time>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Today's focus */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {plan && (
            <div className="recommend-card">
              <div className="recommend-head">
                <span>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </span>
                <div>
                  <p>AI Study Plan</p>
                  <h2>Today's focus</h2>
                </div>
              </div>

              {/* Weekly plan */}
              <div style={{ background: "#F4F7FB", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#1A2A3A", lineHeight: 1.5, margin: 0 }}>{plan.weeklyPlan}</p>
              </div>

              {/* Timing note */}
              {plan.timingNote && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 14, padding: "8px 12px", background: "#FFF8ED", border: "1px solid #F6D884", borderRadius: 10 }}>
                  <span style={{ fontSize: 14 }}>⏱</span>
                  <p style={{ fontSize: 12, color: "#7A5800", margin: 0, lineHeight: 1.5 }}>{plan.timingNote}</p>
                </div>
              )}

              {/* Priority list */}
              {plan.priority?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Focus order</p>
                  {plan.priority.slice(0, 3).map((p: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800,
                        background: i === 0 ? "#FFEAEA" : i === 1 ? "#FFF4E0" : "#EAF2FF",
                        color: i === 0 ? "#D94B3E" : i === 1 ? "#B06A00" : "#2D7FF9",
                      }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1A2A3A", margin: "0 0 1px" }}>{p.label}</p>
                        <p style={{ fontSize: 11, color: "#6B7A8C", margin: 0 }}>{p.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths */}
              {plan.strengths?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Strengths</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {plan.strengths.map((s: any, i: number) => (
                      <div key={i} title={s.detail} style={{
                        background: "#EDFBF3", border: "1px solid #A8E8C0", borderRadius: 20,
                        padding: "4px 10px", fontSize: 12, fontWeight: 600, color: "#1B7A42",
                      }}>✓ {s.label}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {plan.weaknesses?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Needs work</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {plan.weaknesses.map((w: any, i: number) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "#FFF2F2", border: "1px solid #F5C0BC", borderRadius: 10,
                        padding: "7px 12px",
                      }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#C0392B", margin: "0 0 1px" }}>{w.label}</p>
                          <p style={{ fontSize: 11, color: "#7A3A35", margin: 0 }}>{w.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {plan.priority?.[0] && (
                <Link href={(() => {
                  const p = plan.priority[0];
                  const href = p.href ?? "";
                  let base = "/practice/dm";
                  if (href.includes("verbal_reasoning") || href.includes("/vr")) base = "/practice/vr";
                  else if (href.includes("quantitative") || href.includes("/qr")) base = "/practice/qr";
                  else if (href.includes("situational") || href.includes("/sjt")) base = "/practice/sjt";
                  return `${base}?from=plan&focus=${encodeURIComponent(p.label ?? "")}&reason=${encodeURIComponent(p.reason ?? "")}`;
                })()}>
                  <button className="plan-button">Start today's session →</button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
