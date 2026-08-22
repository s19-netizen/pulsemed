"use client";
import { useState } from "react";
import Link from "next/link";

type Session    = { section: string; correct: number; total: number; predicted_score: number | null; sjt_band: number | null; created_at: string; ai_insights: string | null };
type Response   = { is_correct: boolean; question_tag: string | null; time_taken_ms: number | null; created_at: string };
type Diagnostic = { total_score: number | null; vr_score: number | null; dm_score: number | null; qr_score: number | null; sjt_band: number | null; created_at: string } | null;
type Student    = { id: string; name: string; username: string; password_plain: string | null; exam_date: string | null; created_at: string };

const SECTION_COLORS: Record<string, string> = { vr: "#2d7ff9", dm: "#8b6bff", qr: "#3dbe6c", sjt: "#ff6b5c" };
const SECTION_LABELS: Record<string, string> = { vr: "Verbal Reasoning", dm: "Decision Making", qr: "Quantitative Reasoning", sjt: "Situational Judgement" };
const SECTIONS = ["vr", "dm", "qr", "sjt"];

export default function StudentDetailClient({
  student, sessions, responses, diagnostic
}: { student: Student; sessions: Session[]; responses: Response[]; diagnostic: Diagnostic }) {
  const [resetPw, setResetPw]   = useState("");
  const [pwStatus, setPwStatus] = useState<"" | "saving" | "saved" | "error">("");

  // -- Aggregates -----------------------------------------------------------
  const totalQ     = responses.length;
  const correctQ   = responses.filter(r => r.is_correct).length;
  const accuracy   = totalQ ? Math.round((correctQ / totalQ) * 100) : null;
  const timesMs    = responses.filter(r => r.time_taken_ms).map(r => r.time_taken_ms!);
  const avgTimeS   = timesMs.length ? Math.round(timesMs.reduce((a,b)=>a+b,0)/timesMs.length/1000) : null;

  // Per-section stats
  const sectionStats = SECTIONS.map(sec => {
    const secSessions = sessions.filter(s => s.section === sec);
    const totalC = secSessions.reduce((a, s) => a + (s.correct ?? 0), 0);
    const totalT = secSessions.reduce((a, s) => a + (s.total ?? 0), 0);
    const scores = secSessions.filter(s => s.predicted_score).map(s => s.predicted_score!);
    const secTimes = responses.filter(r => r.question_tag?.startsWith(sec)).map(r => r.time_taken_ms!).filter(Boolean);
    return {
      section: sec,
      sessions: secSessions.length,
      accuracy: totalT ? Math.round((totalC / totalT) * 100) : null,
      latestScore: scores.length ? scores[scores.length - 1] : null,
      avgTimeS: secTimes.length ? Math.round(secTimes.reduce((a,b)=>a+b,0)/secTimes.length/1000) : null,
    };
  }).filter(s => s.sessions > 0);

  // Score trend — last 10 sessions across all sections
  const recentSessions = [...sessions].reverse().slice(0, 15);

  // Topic breakdown
  const tagMap: Record<string, {c:number;t:number}> = {};
  for (const r of responses) {
    const tag = r.question_tag ?? "unknown";
    if (!tagMap[tag]) tagMap[tag] = { c:0, t:0 };
    tagMap[tag].t++;
    if (r.is_correct) tagMap[tag].c++;
  }
  const topics = Object.entries(tagMap)
    .map(([tag, d]) => ({ tag, pct: Math.round((d.c/d.t)*100), correct: d.c, total: d.t }))
    .sort((a,b) => b.total - a.total)
    .slice(0, 20);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus("saving");
    const res = await fetch(`/api/tutor/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPw }),
    });
    setPwStatus(res.ok ? "saved" : "error");
    if (res.ok) setResetPw("");
    setTimeout(() => setPwStatus(""), 3000);
  }

  const scoreColor = (pct: number | null) => !pct ? "#8a9ab0" : pct >= 70 ? "#3dbe6c" : pct >= 50 ? "#f5c842" : "#ff6b5c";
  const initials = (name: string) => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #eaeef4", padding: "0 clamp(20px,3vw,48px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/tutor" style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7a8c", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              My Students
            </Link>
            <span style={{ color: "#d0d8e4" }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{student.name}</span>
          </div>
          <span style={{ background: "#eaf2ff", color: "#2d7ff9", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20 }}>TUTOR VIEW</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px clamp(20px,3vw,48px)" }}>
        {/* Student header */}
        <div style={{ background: "white", border: "1px solid #eaeef4", borderRadius: 18, padding: "22px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#eaf2ff", color: "#2d7ff9", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
            {initials(student.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-baloo,sans-serif)", fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, letterSpacing: "-.025em", lineHeight: 1 }}>{student.name}</h1>
            <div style={{ color: "#8a9ab0", fontSize: 13, marginTop: 3 }}>
              @{student.username}
              {student.exam_date && <> · Exam: <strong style={{ color: "#1a2a3a" }}>{new Date(student.exam_date).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}</strong></>}
            </div>
          </div>

          {/* Top-line stats */}
          {[
            { label: "Sessions", value: sessions.length },
            { label: "Questions", value: totalQ },
            { label: "Accuracy", value: accuracy !== null ? `${accuracy}%` : "—", color: scoreColor(accuracy) },
            { label: "Avg Time/Q", value: avgTimeS !== null ? `${avgTimeS}s` : "—" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: "center", padding: "0 16px", borderLeft: "1px solid #f0f3f8" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8a9ab0", marginBottom: 2 }}>{label}</div>
              <div style={{ fontFamily: "var(--font-baloo,sans-serif)", fontSize: 24, fontWeight: 800, color: color ?? "#1a2a3a", lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Diagnostic */}
            <Card title="Diagnostic Test">
              {diagnostic ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Total", value: diagnostic.total_score ? `${diagnostic.total_score}/2700` : "—", color: "#2d7ff9" },
                    { label: "VR", value: diagnostic.vr_score ? `${diagnostic.vr_score}/900` : "—", color: SECTION_COLORS.vr },
                    { label: "DM", value: diagnostic.dm_score ? `${diagnostic.dm_score}/900` : "—", color: SECTION_COLORS.dm },
                    { label: "QR", value: diagnostic.qr_score ? `${diagnostic.qr_score}/900` : "—", color: SECTION_COLORS.qr },
                    { label: "SJT Band", value: diagnostic.sjt_band ? `Band ${diagnostic.sjt_band}` : "—", color: SECTION_COLORS.sjt },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#f8fafd", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#8a9ab0", fontWeight: 700 }}>{label}</div>
                      <div style={{ fontWeight: 800, fontSize: 18, color, fontFamily: "var(--font-baloo,sans-serif)" }}>{value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#a0aec0", fontSize: 13, padding: "8px 0" }}>Diagnostic not completed yet.</div>
              )}
            </Card>

            {/* Section performance */}
            {sectionStats.length > 0 && (
              <Card title="Section Performance">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sectionStats.map(({ section, sessions: n, accuracy, latestScore, avgTimeS }) => (
                    <div key={section} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: SECTION_COLORS[section], width: 30 }}>{section.toUpperCase()}</span>
                      <div style={{ flex: 1, background: "#f0f3f8", borderRadius: 99, height: 8, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${accuracy ?? 0}%`, background: SECTION_COLORS[section], borderRadius: 99, transition: "width .4s" }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor(accuracy), width: 36, textAlign: "right" }}>{accuracy !== null ? `${accuracy}%` : "—"}</span>
                      <span style={{ fontSize: 10, color: "#a0aec0", width: 50, textAlign: "right" }}>{n} session{n !== 1 ? "s" : ""}</span>
                      {avgTimeS && <span style={{ fontSize: 10, color: "#a0aec0", width: 30, textAlign: "right" }}>{avgTimeS}s/q</span>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Login credentials */}
            <Card title="Login Credentials">
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "USERNAME", value: student.username },
                  { label: "PASSWORD", value: student.password_plain ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ flex: 1, background: "#f8fafd", borderRadius: 10, padding: "11px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#a0aec0", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "monospace", color: "#1a2a3a", letterSpacing: "0.05em" }}>{value}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reset password */}
            <Card title="Reset Password">
              <form onSubmit={handleResetPassword} style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={resetPw}
                  onChange={e => setResetPw(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  required
                  style={{ flex: 1, border: "1.5px solid #e0e6ef", borderRadius: 9, padding: "9px 12px", fontSize: 12, outline: "none", fontFamily: "inherit" }}
                />
                <button
                  type="submit"
                  disabled={pwStatus === "saving"}
                  style={{ background: pwStatus === "saved" ? "#3dbe6c" : "#2d7ff9", color: "white", border: 0, borderRadius: 9, padding: "0 16px", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {pwStatus === "saving" ? "Saving…" : pwStatus === "saved" ? "Saved ✓" : "Set Password"}
                </button>
              </form>
              {pwStatus === "error" && <div style={{ color: "#ff6b5c", fontSize: 11, marginTop: 4 }}>Failed to update password.</div>}
            </Card>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Recent sessions */}
            {recentSessions.length > 0 && (
              <Card title={`Recent Sessions (${sessions.length} total)`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {recentSessions.map((s, i) => {
                    const pct = s.total ? Math.round((s.correct/s.total)*100) : 0;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "#f8fafd", borderRadius: 9 }}>
                        <span style={{ width: 28, height: 28, borderRadius: 8, background: `${SECTION_COLORS[s.section]}18`, color: SECTION_COLORS[s.section], display: "grid", placeItems: "center", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                          {s.section.toUpperCase()}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{SECTION_LABELS[s.section] ?? s.section}</span>
                            <span style={{ fontSize: 12, fontWeight: 800, color: scoreColor(pct) }}>{pct}%</span>
                          </div>
                          <div style={{ background: "#e8ecf4", borderRadius: 99, height: 4 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: SECTION_COLORS[s.section], borderRadius: 99 }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 10, color: "#a0aec0", flexShrink: 0 }}>
                          {new Date(s.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Topic breakdown */}
            {topics.length > 0 && (
              <Card title="Topic Accuracy">
                <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 300, overflowY: "auto" }}>
                  {topics.map(({ tag, pct, correct, total }) => {
                    const section = tag.split("-")[0];
                    const topicLabel = tag.split("-").slice(1).join(" ").replace(/-/g," ") || tag;
                    return (
                      <div key={tag} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: SECTION_COLORS[section] ?? "#8a9ab0", width: 24 }}>{section.toUpperCase()}</span>
                        <span style={{ fontSize: 11, color: "#1a2a3a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topicLabel}</span>
                        <div style={{ width: 60, background: "#f0f3f8", borderRadius: 99, height: 5 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: scoreColor(pct), borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: scoreColor(pct), width: 30, textAlign: "right" }}>{pct}%</span>
                        <span style={{ fontSize: 9, color: "#a0aec0", width: 28, textAlign: "right" }}>{correct}/{total}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {sessions.length === 0 && (
              <div style={{ background: "white", border: "1px solid #eaeef4", borderRadius: 16, padding: 24, textAlign: "center", color: "#a0aec0" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📚</div>
                <div style={{ fontWeight: 700 }}>No activity yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Sessions will appear here once {student.name} starts practising.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: "1px solid #eaeef4", borderRadius: 16, padding: "18px 20px", boxShadow: "0 4px 16px rgba(26,42,58,.04)" }}>
      <h2 style={{ margin: "0 0 14px", fontFamily: "var(--font-baloo,sans-serif)", fontSize: 16, fontWeight: 800, letterSpacing: "-.01em" }}>{title}</h2>
      {children}
    </div>
  );
}
