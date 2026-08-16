"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const SECTIONS = [
  { key: "vr", label: "Verbal Reasoning",       short: "VR",  color: "#2D7FF9", tint: "#EAF2FF" },
  { key: "dm", label: "Decision Making",         short: "DM",  color: "#8B6BFF", tint: "#F1ECFF" },
  { key: "qr", label: "Quantitative Reasoning",  short: "QR",  color: "#3DBE6C", tint: "#EDFBF3" },
  { key: "sjt", label: "Situational Judgement",  short: "SJT", color: "#FF6B5C", tint: "#FFEDEA" },
];
const TASK_COUNTS: Record<string, number> = { vr: 16, dm: 15, qr: 16, sjt: 23 };
const SEC_COLOR: Record<string, string> = { vr: "#2D7FF9", dm: "#8B6BFF", qr: "#3DBE6C", sjt: "#FF6B5C" };

function inferSection(label: string): string {
  const u = label.toUpperCase();
  if (u.startsWith("DM") || u.includes("DECISION")) return "dm";
  if (u.startsWith("QR") || u.includes("QUANTITATIVE")) return "qr";
  if (u.startsWith("SJT") || u.includes("SITUATIONAL")) return "sjt";
  return "vr";
}

// ── State A: Cold start ─────────────────────────────────────────────────────

function SetupChecklist({ hasExamDate, hasDiagnostic }: { hasExamDate: boolean; hasDiagnostic: boolean }) {
  const steps = [
    {
      done: hasExamDate,
      title: "Set your exam date",
      desc: "We use this to calibrate your study intensity and countdown.",
      action: "Go to settings →",
      href: "/settings",
    },
    {
      done: hasDiagnostic,
      title: "Take the diagnostic",
      desc: "A 20-minute baseline across all 4 sections — this is how we find your weak spots.",
      action: "Start diagnostic →",
      href: "/diagnostic",
      highlight: true,
    },
    {
      done: false,
      title: "Complete your first practice session",
      desc: "After the diagnostic, your plan will tell you exactly where to start.",
      action: hasDiagnostic ? "Go to practice →" : null,
      href: "/practice/vr",
      locked: !hasDiagnostic,
    },
  ];

  const doneCount = steps.filter(s => s.done).length;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <p className="eyebrow">Getting started</p>
          <h1>Build your study plan</h1>
          <p style={{ maxWidth: 520 }}>Complete these 3 steps and we'll generate a personalised plan based on exactly where you need to improve.</p>
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>{doneCount}/3 steps complete</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: doneCount >= 2 ? "#3DBE6C" : "#2D7FF9" }}>
            {doneCount === 0 ? "Let's go!" : doneCount === 1 ? "Good start" : "Almost there"}
          </span>
        </div>
        <div style={{ height: 6, background: "#f0f2f5", borderRadius: 3 }}>
          <div style={{ height: 6, borderRadius: 3, background: "linear-gradient(90deg,#2D7FF9,#3DBE6C)", width: `${(doneCount / 3) * 100}%`, transition: "width .4s" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            background: "white",
            border: `1.5px solid ${step.done ? "#3DBE6C40" : step.highlight && !step.done ? "#2D7FF9" : "#e5e9f0"}`,
            borderRadius: 14, padding: "18px 22px",
            display: "flex", alignItems: "center", gap: 18,
            opacity: step.locked ? 0.5 : 1,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: step.done ? "#EDFBF3" : step.highlight && !step.done ? "#EAF2FF" : "#f5f7fb",
              border: `2px solid ${step.done ? "#3DBE6C" : step.highlight && !step.done ? "#2D7FF9" : "#e5e9f0"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: step.done ? 16 : 15, color: step.done ? "#3DBE6C" : step.highlight && !step.done ? "#2D7FF9" : "#9ba6b5", fontWeight: 800,
            }}>
              {step.done ? "✓" : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 800, color: step.locked ? "#9ba6b5" : "#1a2535" }}>{step.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7a8c", lineHeight: 1.5 }}>{step.desc}</p>
            </div>
            {step.action && !step.done && !step.locked && (
              <Link href={step.href} style={{ flexShrink: 0 }}>
                <button type="button" style={{
                  background: step.highlight ? "#2D7FF9" : "white",
                  color: step.highlight ? "white" : "#2D7FF9",
                  border: `1.5px solid #2D7FF9`, borderRadius: 10,
                  padding: "9px 18px", fontSize: 12, fontWeight: 800, cursor: "pointer",
                }}>{step.action}</button>
              </Link>
            )}
            {step.done && <span style={{ fontSize: 11, color: "#3DBE6C", fontWeight: 700, flexShrink: 0 }}>Done ✓</span>}
            {step.locked && <span style={{ fontSize: 18, color: "#c5cdd8", flexShrink: 0 }}>🔒</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── State B: Diagnostic done, limited practice ──────────────────────────────

function DiagnosticPlan({ report, practiceCount }: { report: any; practiceCount: number }) {
  let analysis: any = null;
  let weeks: any[] = [];
  try { analysis = JSON.parse(report.groq_analysis ?? "{}"); } catch { /* */ }
  try { weeks = JSON.parse(report.groq_study_plan ?? "[]"); } catch { /* */ }

  const thisWeek = weeks[0];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <p className="eyebrow">Based on your diagnostic</p>
          <h1>Your Study Plan</h1>
          <p style={{ maxWidth: 560 }}>{analysis?.overallVerdict ?? "Your diagnostic results are in. Here's where to focus."}</p>
        </div>
      </div>

      {practiceCount < 10 && (
        <div style={{ background: "#EAF2FF", border: "1.5px solid #2D7FF9", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 800, color: "#1A5FD0" }}>Plan built from your diagnostic</p>
            <p style={{ margin: 0, fontSize: 12, color: "#2D5FAA" }}>Do practice sessions and we'll update this with your live accuracy data.</p>
          </div>
          <Link href="/practice/vr" style={{ flexShrink: 0 }}>
            <button type="button" style={{ background: "#2D7FF9", color: "white", border: 0, borderRadius: 9, padding: "9px 18px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Practice now →</button>
          </Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 24, alignItems: "start" }}>
        <div>
          {thisWeek && (
            <div style={{ marginBottom: 20 }}>
              <p className="section-kicker" style={{ marginBottom: 12 }}>THIS WEEK · {(thisWeek.title ?? "Week 1").toUpperCase()}</p>
              <div style={{ background: "#F8F9FB", border: "1px solid #e5e9f0", borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#334354", lineHeight: 1.6 }}>{thisWeek.focus}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(thisWeek.tasks ?? []).map((task: string, i: number) => {
                  const sec = inferSection(task);
                  const s = SECTIONS.find(s => s.key === sec)!;
                  return (
                    <div key={i} style={{ background: "white", border: `1.5px solid ${s.color}30`, borderLeft: `4px solid ${s.color}`, borderRadius: 12, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: s.color, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 10, background: s.color, color: "white", borderRadius: 5, padding: "2px 7px", fontWeight: 800, marginBottom: 5, display: "inline-block" }}>{s.short}</span>
                        <p style={{ margin: "4px 0 10px", fontSize: 13, fontWeight: 700, color: "#1a2535", lineHeight: 1.4 }}>{task}</p>
                        <Link href={`/question?section=${sec}&difficulty=Bronze,Silver,Gold&count=${TASK_COUNTS[sec]}`}>
                          <button type="button" style={{ background: s.color, color: "white", border: 0, borderRadius: 9, padding: "8px 16px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Start {TASK_COUNTS[sec]} questions →</button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {analysis?.sections && (
            <div>
              <p className="section-kicker" style={{ marginBottom: 12 }}>SECTION BREAKDOWN</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SECTIONS.map(s => {
                  const sec = analysis.sections[s.key];
                  if (!sec) return null;
                  return (
                    <div key={s.key} style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 12, padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ background: s.color, color: "white", borderRadius: 6, padding: "2px 9px", fontSize: 10, fontWeight: 800 }}>{s.short}</span>
                        {s.key === "sjt" && report.sjt_band && <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>Band {report.sjt_band}</span>}
                        {s.key !== "sjt" && report[`${s.key}_score`] && <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{report[`${s.key}_score`]}/900</span>}
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#334354", lineHeight: 1.5 }}>{sec.verdict}</p>
                      {sec.weak?.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {sec.weak.map((w: any, i: number) => (
                            <span key={i} style={{ fontSize: 10, background: "#FFF2F2", color: "#C0392B", border: "1px solid #F5C0BC", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>↑ {w.subtype}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="content-card" style={{ padding: "16px 20px" }}>
            <p className="section-kicker" style={{ marginBottom: 12 }}>DIAGNOSTIC SCORES</p>
            {[{ key: "vr", label: "VR", score: report.vr_score },
              { key: "dm", label: "DM", score: report.dm_score },
              { key: "qr", label: "QR", score: report.qr_score }].map(s => (
              <div key={s.key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: SEC_COLOR[s.key] }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{s.score}/900</span>
                </div>
                <div style={{ height: 5, background: "#f0f2f5", borderRadius: 3 }}>
                  <div style={{ height: 5, borderRadius: 3, background: SEC_COLOR[s.key], width: `${Math.round((s.score / 900) * 100)}%` }} />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e9f0", paddingTop: 10, marginTop: 2 }}>
              <span style={{ fontSize: 12, color: "#6b7a8c", fontWeight: 700 }}>SJT</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: SEC_COLOR.sjt }}>Band {report.sjt_band}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7a8c", fontWeight: 700 }}>Cognitive total</span>
              <span style={{ fontSize: 14, fontWeight: 900 }}>{report.total_score}/2700</span>
            </div>
          </div>

          {weeks.length > 0 && (
            <div className="content-card" style={{ padding: "16px 20px" }}>
              <p className="section-kicker" style={{ marginBottom: 12 }}>4-WEEK ROADMAP</p>
              {weeks.map((w: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < weeks.length - 1 ? 12 : 0, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? "#2D7FF9" : "#f0f2f5", color: i === 0 ? "white" : "#9ba6b5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>W{i + 1}</div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: i === 0 ? "#1a2535" : "#6b7a8c" }}>{w.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ba6b5", lineHeight: 1.4 }}>{w.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── State C: Full AI plan ───────────────────────────────────────────────────

function FullPlan({ responses }: { responses: any[] }) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch("/api/study-plan").then(r => r.json()).then(d => { setPlan(d.plan); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetch("/api/study-plan", { method: "DELETE" });
    const d = await fetch("/api/study-plan").then(r => r.json());
    setPlan(d.plan);
    setRefreshing(false);
  }

  const sectionStats = SECTIONS.map(s => {
    const sr = responses.filter(r => r.question_tag?.startsWith(s.key + "-"));
    const correct = sr.filter(r => r.is_correct).length;
    const pct = sr.length > 0 ? Math.round((correct / sr.length) * 100) : null;
    return { ...s, total: sr.length, accuracy: pct };
  });

  const tasks: Array<{ sec: string; label: string; reason: string; href: string; count: number }> =
    (plan?.priority ?? []).map((p: any) => {
      const sec = inferSection(p.label ?? "");
      const count = TASK_COUNTS[sec];
      const href = sec === "sjt" ? `/practice/sjt?autostart=1&count=${count}` : `/question?section=${sec}&difficulty=Bronze,Silver,Gold&count=${count}`;
      return { sec, label: p.label, reason: p.reason, href, count };
    });

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <p className="eyebrow">AI-powered</p>
          <h1>Your Study Plan</h1>
          <p style={{ maxWidth: 560 }}>{loading ? "Generating your personalised plan…" : plan?.summary ?? "Keep practising to keep your plan up to date."}</p>
        </div>
        {plan && (
          <button type="button" onClick={handleRefresh} disabled={refreshing} style={{ background: "var(--surface)", border: "1.5px solid var(--line)", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "var(--ink-soft)", flexShrink: 0, opacity: refreshing ? 0.6 : 1 }}>
            {refreshing ? "Updating…" : "↻ Refresh plan"}
          </button>
        )}
      </div>

      {plan?.timingNote && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: "#FFF8ED", border: "1px solid #F6D884", borderRadius: 12, padding: "12px 16px", marginBottom: 24 }}>
          <span style={{ fontSize: 16 }}>⏱</span>
          <p style={{ fontSize: 13, color: "#7A5800", margin: 0, lineHeight: 1.5 }}>{plan.timingNote}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 24, alignItems: "start" }}>
        <div>
          <p className="section-kicker" style={{ marginBottom: 12 }}>THIS WEEK'S TASKS</p>
          {loading && <div className="content-card" style={{ padding: 40, textAlign: "center" }}><p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Building your study plan…</p></div>}
          {tasks.map((task, i) => {
            const sec = SECTIONS.find(s => s.key === task.sec)!;
            const priorityColor = i === 0 ? "#C0392B" : i === 1 ? "#B06A00" : "#2D7FF9";
            const priorityBg   = i === 0 ? "#FFEAEA" : i === 1 ? "#FFF4E0" : "#EAF2FF";
            const priorityLabel = i === 0 ? "High priority" : i === 1 ? "Medium priority" : "Lower priority";
            return (
              <div key={i} className="content-card" style={{ marginBottom: 14, padding: 0, overflow: "hidden", borderLeft: `4px solid ${sec.color}` }}>
                <div style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: sec.tint, border: `2px solid ${sec.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 900, fontSize: 15, color: sec.color }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ background: sec.color, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>{sec.short}</span>
                      <span style={{ background: priorityBg, color: priorityColor, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{priorityLabel}</span>
                    </div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800 }}>{task.label}</h3>
                    <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>{task.reason}</p>
                    <Link href={task.href}>
                      <button type="button" style={{ background: sec.color, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Start {task.count} questions →</button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          {plan?.weeklyPlan && (
            <div style={{ background: "#F4F7FB", borderRadius: 12, padding: "14px 18px", border: "1px solid var(--line)" }}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "var(--ink-soft)", margin: "0 0 6px" }}>This week's focus</p>
              <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.6, margin: 0 }}>{plan.weeklyPlan}</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="content-card" style={{ padding: "16px 20px" }}>
            <p className="section-kicker" style={{ marginBottom: 12 }}>SECTION OVERVIEW</p>
            {sectionStats.map(s => (
              <div key={s.key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.short}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: s.accuracy === null ? "var(--ink-soft)" : "var(--ink)" }}>{s.accuracy === null ? "—" : `${s.accuracy}%`}</span>
                </div>
                <div style={{ height: 5, background: "var(--line)", borderRadius: 3 }}>
                  <div style={{ height: 5, borderRadius: 3, background: s.color, width: `${s.accuracy ?? 0}%`, transition: "width .4s ease" }} />
                </div>
                <p style={{ fontSize: 10, color: "var(--ink-soft)", margin: "3px 0 0", fontWeight: 600 }}>{s.total} questions answered</p>
              </div>
            ))}
          </div>
          {plan?.strengths?.length > 0 && (
            <div className="content-card" style={{ padding: "16px 20px" }}>
              <p className="section-kicker" style={{ marginBottom: 10 }}>STRENGTHS</p>
              {plan.strengths.map((s: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "8px 10px", background: "#EDFBF3", border: "1px solid #A8E8C0", borderRadius: 10 }}>
                  <span style={{ color: "#1B7A42", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <div><p style={{ fontSize: 12, fontWeight: 700, color: "#1B7A42", margin: "0 0 1px" }}>{s.label}</p><p style={{ fontSize: 11, color: "#2A6A3A", margin: 0 }}>{s.detail}</p></div>
                </div>
              ))}
            </div>
          )}
          {plan?.weaknesses?.length > 0 && (
            <div className="content-card" style={{ padding: "16px 20px" }}>
              <p className="section-kicker" style={{ marginBottom: 10 }}>NEEDS WORK</p>
              {plan.weaknesses.map((w: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "8px 10px", background: "#FFF2F2", border: "1px solid #F5C0BC", borderRadius: 10 }}>
                  <span style={{ color: "#C0392B", fontSize: 13, flexShrink: 0, marginTop: 1 }}>↑</span>
                  <div><p style={{ fontSize: 12, fontWeight: 700, color: "#C0392B", margin: "0 0 1px" }}>{w.label}</p><p style={{ fontSize: 11, color: "#7A3A35", margin: 0 }}>{w.detail}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

type Props = { responses: any[]; diagnosticReport: any | null; examDate: string | null };

export default function StudyPlanClient({ responses, diagnosticReport, examDate }: Props) {
  const practiceCount = responses.filter(r => r.question_tag && !r.question_tag.startsWith("diagnostic")).length;
  const hasDiagnostic = !!diagnosticReport;
  const hasExamDate   = !!examDate;

  if (practiceCount >= 10) return <FullPlan responses={responses} />;
  if (hasDiagnostic)        return <DiagnosticPlan report={diagnosticReport} practiceCount={practiceCount} />;
  return <SetupChecklist hasExamDate={hasExamDate} hasDiagnostic={hasDiagnostic} />;
}
