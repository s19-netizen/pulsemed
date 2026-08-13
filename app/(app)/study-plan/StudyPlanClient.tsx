"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const SECTIONS = [
  { key: "vr", label: "Verbal Reasoning", short: "VR", color: "#2D7FF9", deep: "#1A5FD0", tint: "#EAF2FF" },
  { key: "dm", label: "Decision Making",   short: "DM", color: "#8B6BFF", deep: "#6747D8", tint: "#F1ECFF" },
  { key: "qr", label: "Quantitative Reasoning", short: "QR", color: "#3DBE6C", deep: "#259650", tint: "#EDFBF3" },
  { key: "sjt", label: "Situational Judgement", short: "SJT", color: "#FF6B5C", deep: "#D94B3E", tint: "#FFEDEA" },
];

const TASK_COUNTS: Record<string, number> = { vr: 16, dm: 15, qr: 16, sjt: 23 };

function inferSection(label: string): "vr" | "dm" | "qr" | "sjt" {
  const u = label.toUpperCase();
  if (u.startsWith("DM") || u.includes(" DM ") || u.includes("DECISION")) return "dm";
  if (u.startsWith("QR") || u.includes(" QR ") || u.includes("QUANTITATIVE")) return "qr";
  if (u.startsWith("SJT") || u.includes("SITUATIONAL")) return "sjt";
  return "vr";
}

function extractVRSubtype(href: string): string {
  const parts = href.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  // Only return if it looks like a subtype key (not "vr", "learn", etc.)
  return ["vr", "verbal_reasoning", "learn", "practice"].includes(last) ? "" : last;
}

function extractDMFamily(label: string): string {
  const u = label.toLowerCase();
  if (u.includes("syllogism")) return "Syllogisms";
  if (u.includes("venn")) return "Venn Diagrams";
  if (u.includes("probability") || u.includes("statistic")) return "Probability & Statistics";
  if (u.includes("logic") || u.includes("puzzle")) return "Logic Puzzles";
  if (u.includes("argument") || u.includes("assumption")) return "Arguments & Assumptions";
  if (u.includes("interpret") || u.includes("information")) return "Interpreting Information";
  return "";
}

function buildHref(sec: string, label: string, aiHref: string): string {
  const count = TASK_COUNTS[sec];
  if (sec === "sjt") return `/practice/sjt?autostart=1&count=${count}`;

  if (sec === "vr") {
    const subtype = extractVRSubtype(aiHref);
    return `/question?section=vr&difficulty=Bronze,Silver,Gold&count=${count}${subtype ? `&subtype=${encodeURIComponent(subtype)}` : ""}`;
  }

  if (sec === "dm") {
    const family = extractDMFamily(label);
    return `/question?section=dm&difficulty=Bronze,Silver,Gold&count=${count}${family ? `&type=${encodeURIComponent(family)}` : ""}`;
  }

  return `/question?section=${sec}&difficulty=Bronze,Silver,Gold&count=${count}`;
}

type Props = { responses: any[] };

export default function StudyPlanClient({ responses }: Props) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch("/api/study-plan")
      .then(r => r.json())
      .then(d => { setPlan(d.plan); setLoading(false); })
      .catch(() => setLoading(false));
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
      return { sec, label: p.label, reason: p.reason, href: buildHref(sec, p.label ?? "", p.href ?? ""), count: TASK_COUNTS[sec] };
    });

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <p className="eyebrow">AI-powered</p>
          <h1>Your Study Plan</h1>
          <p style={{ maxWidth: 560 }}>
            {loading
              ? "Generating your personalised plan…"
              : plan?.summary ?? "Complete more questions to unlock your personalised study plan."}
          </p>
        </div>
        {plan && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: "var(--surface)", border: "1.5px solid var(--line)",
              borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", color: "var(--ink-soft)", flexShrink: 0,
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing ? "Updating…" : "↻ Refresh plan"}
          </button>
        )}
      </div>

      {/* Timing note */}
      {plan?.timingNote && (
        <div style={{
          display: "flex", gap: 10, alignItems: "center",
          background: "#FFF8ED", border: "1px solid #F6D884", borderRadius: 12,
          padding: "12px 16px", marginBottom: 24,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⏱</span>
          <p style={{ fontSize: 13, color: "#7A5800", margin: 0, lineHeight: 1.5 }}>{plan.timingNote}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 24, alignItems: "start" }}>
        {/* Tasks column */}
        <div>
          <p className="section-kicker" style={{ marginBottom: 12 }}>THIS WEEK'S TASKS</p>

          {loading && (
            <div className="content-card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Building your study plan…</p>
            </div>
          )}

          {!loading && !plan && (
            <div className="content-card" style={{ padding: 32 }}>
              <h3 style={{ marginBottom: 8 }}>Not enough data yet</h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                Complete at least 10 questions across any section — diagnostic, practice, or mocks — to unlock your AI study plan.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {SECTIONS.map(s => (
                  <Link key={s.key} href={`/practice/${s.key}`}>
                    <button type="button" style={{
                      background: s.tint, color: s.color, border: `1.5px solid ${s.color}33`,
                      borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}>
                      {s.short} Practice →
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tasks.map((task, i) => {
            const sec = SECTIONS.find(s => s.key === task.sec)!;
            const priority = i === 0 ? "High priority" : i === 1 ? "Medium priority" : "Lower priority";
            const priorityColor = i === 0 ? "#C0392B" : i === 1 ? "#B06A00" : "#2D7FF9";
            const priorityBg = i === 0 ? "#FFEAEA" : i === 1 ? "#FFF4E0" : "#EAF2FF";
            return (
              <div
                key={i}
                className="content-card"
                style={{
                  marginBottom: 14, padding: 0, overflow: "hidden",
                  borderLeft: `4px solid ${sec.color}`,
                }}
              >
                <div style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  {/* Number */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 12, background: sec.tint,
                    border: `2px solid ${sec.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontWeight: 900, fontSize: 15, color: sec.color,
                  }}>
                    {i + 1}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{
                        background: sec.color, color: "#fff",
                        borderRadius: 6, padding: "2px 8px",
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.05em",
                      }}>{sec.short}</span>
                      <span style={{
                        background: priorityBg, color: priorityColor,
                        borderRadius: 6, padding: "2px 8px",
                        fontSize: 10, fontWeight: 700,
                      }}>{priority}</span>
                    </div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
                      {task.label}
                    </h3>
                    <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                      {task.reason}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Link href={task.href}>
                        <button
                          type="button"
                          style={{
                            background: sec.color, color: "#fff",
                            border: "none", borderRadius: 10,
                            padding: "9px 18px", fontSize: 13, fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Start {task.count} questions →
                        </button>
                      </Link>
                      <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>
                        {task.count} questions · {sec.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Weekly plan */}
          {plan?.weeklyPlan && (
            <div style={{
              marginTop: 8,
              background: "#F4F7FB", borderRadius: 12,
              padding: "14px 18px", border: "1px solid var(--line)",
            }}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-soft)", margin: "0 0 6px" }}>
                This week's focus
              </p>
              <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.6, margin: 0 }}>{plan.weeklyPlan}</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Section overview */}
          <div className="content-card" style={{ padding: "16px 20px" }}>
            <p className="section-kicker" style={{ marginBottom: 12 }}>SECTION OVERVIEW</p>
            {sectionStats.map(s => (
              <div key={s.key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.short}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: s.accuracy === null ? "var(--ink-soft)" : "var(--ink)" }}>
                    {s.accuracy === null ? "—" : `${s.accuracy}%`}
                  </span>
                </div>
                <div style={{ height: 5, background: "var(--line)", borderRadius: 3 }}>
                  <div style={{
                    height: 5, borderRadius: 3,
                    background: s.accuracy === null ? "var(--line)" : s.color,
                    width: `${s.accuracy ?? 0}%`,
                    transition: "width .4s ease",
                  }} />
                </div>
                <p style={{ fontSize: 10, color: "var(--ink-soft)", margin: "3px 0 0", fontWeight: 600 }}>
                  {s.total} questions answered
                </p>
              </div>
            ))}
          </div>

          {/* Strengths */}
          {plan?.strengths?.length > 0 && (
            <div className="content-card" style={{ padding: "16px 20px" }}>
              <p className="section-kicker" style={{ marginBottom: 10 }}>STRENGTHS</p>
              {plan.strengths.map((s: any, i: number) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8,
                  padding: "8px 10px", background: "#EDFBF3",
                  border: "1px solid #A8E8C0", borderRadius: 10,
                }}>
                  <span style={{ color: "#1B7A42", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#1B7A42", margin: "0 0 1px" }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: "#2A6A3A", margin: 0 }}>{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Needs work */}
          {plan?.weaknesses?.length > 0 && (
            <div className="content-card" style={{ padding: "16px 20px" }}>
              <p className="section-kicker" style={{ marginBottom: 10 }}>NEEDS WORK</p>
              {plan.weaknesses.map((w: any, i: number) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8,
                  padding: "8px 10px", background: "#FFF2F2",
                  border: "1px solid #F5C0BC", borderRadius: 10,
                }}>
                  <span style={{ color: "#C0392B", fontSize: 13, flexShrink: 0, marginTop: 1 }}>↑</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#C0392B", margin: "0 0 1px" }}>{w.label}</p>
                    <p style={{ fontSize: 11, color: "#7A3A35", margin: 0 }}>{w.detail}</p>
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
