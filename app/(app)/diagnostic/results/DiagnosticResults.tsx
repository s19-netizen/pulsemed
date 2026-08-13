"use client";
import Link from "next/link";

const COLORS: Record<string, string> = { vr: "#2D7FF9", dm: "#8B6BFF", qr: "#3DBE6C", sjt: "#FF6B5C" };
const TINTS: Record<string, string>  = { vr: "#EAF2FF", dm: "#F1ECFF", qr: "#EDFBF3", sjt: "#FFEDEA" };
const FULL: Record<string, string>   = { vr: "Verbal Reasoning", dm: "Decision Making", qr: "Quantitative Reasoning", sjt: "Situational Judgement" };
const MAX_RAW: Record<string, number> = { vr: 20, dm: 24, qr: 18 };

type SubtypeScore = { correct: number; total: number; rawPts: number; maxPts: number; label: string; section: string };
type Report = {
  vr_score: number; dm_score: number; qr_score: number; total_score: number;
  sjt_band: number;
  subtype_scores: Record<string, SubtypeScore>;
  groq_analysis: string; groq_study_plan: string;
  created_at: string;
};

type AiSubtypeItem = { subtype: string; score: string; missedMarks?: number };
type AiSection = { verdict: string; strong?: AiSubtypeItem[]; weak?: AiSubtypeItem[]; band?: number };
type StructuredAnalysis = { sections: Record<string, AiSection>; overallVerdict?: string };
type WeekTask = { title: string; focus: string; tasks: string[] };

const CLASSIFICATIONS = [
  { min: 2400, label: "Exceptional",                color: "#3DBE6C" },
  { min: 2250, label: "Very strong",                color: "#3DBE6C" },
  { min: 2100, label: "Strong",                     color: "#2D7FF9" },
  { min: 1950, label: "Developing well",            color: "#2D7FF9" },
  { min: 1800, label: "Needs targeted improvement", color: "#f59e0b" },
  { min: 0,    label: "Priority development",       color: "#FF6B5C" },
];

function perfColor(pct: number) {
  if (pct >= 0.7) return "#3DBE6C";
  if (pct >= 0.4) return "#f59e0b";
  return "#FF6B5C";
}

function SectionCard({ sec, score, subtypes }: { sec: string; score: number; subtypes: [string, SubtypeScore][] }) {
  const raw = subtypes.reduce((s, [, v]) => s + v.rawPts, 0);
  const max = MAX_RAW[sec];
  const barPct = ((score - 300) / 600) * 100;
  const color = COLORS[sec];

  return (
    <div className="content-card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color }}>{sec.toUpperCase()}</span>
          <p style={{ fontSize: 11.5, color: "var(--ink-soft)", margin: "2px 0 0" }}>{FULL[sec]}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 22, fontWeight: 900, color }}>{score}</span>
          <span style={{ fontSize: 10, color: "var(--ink-soft)", display: "block" }}>scaled / 900</span>
        </div>
      </div>

      <div style={{ height: 5, background: "#f0f2f5", borderRadius: 3, overflow: "hidden", marginBottom: 5 }}>
        <div style={{ height: "100%", width: `${barPct}%`, background: color, borderRadius: 3 }} />
      </div>
      <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        <strong style={{ color: perfColor(raw / max) }}>{raw}</strong> / {max} raw marks
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 5, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
        {subtypes.map(([k, v]) => {
          const p = v.maxPts > 0 ? v.rawPts / v.maxPts : 0;
          const c = perfColor(p);
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: "var(--ink)" }}>{v.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: c, background: c + "18", padding: "1px 7px", borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>
                {v.rawPts}/{v.maxPts}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DiagnosticResults({ report }: { report: Report }) {
  const bandColours = ["", "#3DBE6C", "#2D7FF9", "#f59e0b", "#FF6B5C"];
  const bandLabels  = ["", "Band 1", "Band 2", "Band 3", "Band 4"];
  const sjtColor = bandColours[report.sjt_band];
  const sjtLabel = bandLabels[report.sjt_band];

  const cls = CLASSIFICATIONS.find(c => report.total_score >= c.min) ?? CLASSIFICATIONS[CLASSIFICATIONS.length - 1];

  // Group subtypes by section
  const bySection: Record<string, [string, SubtypeScore][]> = { vr: [], dm: [], qr: [], sjt: [] };
  for (const [k, v] of Object.entries(report.subtype_scores)) {
    const sec = k.split("-")[0];
    if (bySection[sec]) bySection[sec].push([k, v]);
  }

  // Strengths & priorities from subtype data
  const allSubs = Object.entries(report.subtype_scores).filter(([, v]) => v.maxPts > 0);
  const byperf = [...allSubs].sort((a, b) => (b[1].rawPts / b[1].maxPts) - (a[1].rawPts / a[1].maxPts));
  const strengths  = byperf.filter(([, v]) => v.rawPts / v.maxPts >= 0.7).slice(0, 4);
  const priorities = [...byperf].reverse().slice(0, 4);

  // Score ring
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const ringPct = (report.total_score - 900) / 1800;
  const dashOffset = circ * (1 - Math.max(0, Math.min(1, ringPct)));

  // Parse structured JSON from Groq
  let structuredAnalysis: StructuredAnalysis | null = null;
  let structuredWeeks: WeekTask[] | null = null;

  try {
    const parsed = JSON.parse(report.groq_analysis);
    if (parsed?.sections) structuredAnalysis = parsed;
  } catch {}

  try {
    const parsed = JSON.parse(report.groq_study_plan);
    if (Array.isArray(parsed) && parsed.length > 0) structuredWeeks = parsed;
  } catch {}

  // Fallback: parse prose analysis into colour-coded sentences
  const isFallback = report.groq_analysis?.startsWith("Your diagnostic is complete. VR:");
  const rawAnalysis = !structuredAnalysis && !isFallback ? (report.groq_analysis ?? "") : "";
  const insightItems = rawAnalysis
    ? rawAnalysis
        .replace(/\n+/g, " ")
        .split(/\.\s+(?=[A-Z"'])/)
        .map(s => s.trim())
        .filter(s => s.length > 15)
        .map(s => (s.endsWith(".") || s.endsWith("!") || s.endsWith("?")) ? s : s + ".")
    : [];

  function detectSection(text: string): "vr" | "dm" | "qr" | "sjt" | null {
    const u = text.toUpperCase();
    if (/\bVR\b/.test(u) || u.includes("VERBAL")) return "vr";
    if (/\bDM\b/.test(u) || u.includes("DECISION")) return "dm";
    if (/\bQR\b/.test(u) || u.includes("QUANTITATIVE")) return "qr";
    if (/\bSJT\b/.test(u) || u.includes("SITUATIONAL")) return "sjt";
    return null;
  }

  // Fallback: parse prose study plan into week blocks
  const planBlocks: { title: string; body: string }[] = [];
  if (!structuredWeeks && report.groq_study_plan) {
    const chunks = report.groq_study_plan.split(/\*\*(?=Week)/i);
    for (const chunk of chunks) {
      const m = chunk.match(/^([^*]+)\*\*([\s\S]*)$/);
      if (m) planBlocks.push({ title: m[1].trim(), body: m[2].trim() });
      else if (chunk.trim()) planBlocks.push({ title: "", body: chunk.trim() });
    }
  }

  // SJT raw totals
  const sjtRaw = bySection.sjt.reduce((s, [, v]) => s + v.rawPts, 0);
  const sjtMax = bySection.sjt.reduce((s, [, v]) => s + v.maxPts, 0);

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg, #1a2744 0%, #0f172a 100%)", borderRadius: 16, padding: "26px 28px", color: "white", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flexShrink: 0, position: "relative", width: 116, height: 116 }}>
          <svg width="116" height="116" viewBox="0 0 116 116" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="58" cy="58" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
            <circle cx="58" cy="58" r={radius} fill="none" stroke={cls.color} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 1s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <strong style={{ fontSize: 20, fontWeight: 900, color: cls.color, lineHeight: 1 }}>{report.total_score}</strong>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>/ 2700</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", margin: "0 0 4px" }}>DIAGNOSTIC COMPLETE</p>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "white" }}>Your UCAT baseline</h1>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: cls.color + "28", color: cls.color, marginBottom: 12 }}>
            {cls.label}
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["vr", "dm", "qr"] as const).map(s => {
              const raw = bySection[s].reduce((a, [, v]) => a + v.rawPts, 0);
              const scoreVal = report[`${s}_score` as "vr_score" | "dm_score" | "qr_score"];
              return (
                <span key={s} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                  {s.toUpperCase()} {scoreVal} <span style={{ opacity: 0.5 }}>({raw}/{MAX_RAW[s]})</span>
                </span>
              );
            })}
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: sjtColor + "28", color: sjtColor, fontWeight: 700 }}>
              SJT {sjtLabel} <span style={{ opacity: 0.7 }}>({sjtRaw}/{sjtMax} pts)</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Performance insights (structured JSON) ── */}
      {structuredAnalysis && (
        <div className="content-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ width: 24, height: 24, background: "#f4f7fb", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </span>
            <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Performance insights</h3>
          </div>

          {structuredAnalysis.overallVerdict && (
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)", margin: "0 0 16px", padding: "10px 14px", background: "#F8F9FB", borderRadius: 10, borderLeft: "3px solid #94A3B8" }}>
              {structuredAnalysis.overallVerdict}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(["vr", "dm", "qr", "sjt"] as const).map(sec => {
              const s = structuredAnalysis!.sections[sec];
              if (!s) return null;
              const color = COLORS[sec];
              const tint = TINTS[sec];
              return (
                <div key={sec} style={{ background: tint, borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", color, background: color + "28", borderRadius: 4, padding: "2px 7px" }}>
                      {sec.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)" }}>{FULL[sec]}</span>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink)", margin: "0 0 10px" }}>{s.verdict}</p>
                  {((s.strong?.length ?? 0) > 0 || (s.weak?.length ?? 0) > 0) && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {s.strong?.map((item, i) => (
                        <span key={`s${i}`} style={{ fontSize: 11, fontWeight: 700, color: "#3DBE6C", background: "#EDFBF3", border: "1px solid #3DBE6C28", borderRadius: 6, padding: "3px 9px" }}>
                          ✓ {item.subtype} {item.score}
                        </span>
                      ))}
                      {s.weak?.map((item, i) => (
                        <span key={`w${i}`} style={{ fontSize: 11, fontWeight: 700, color: "#FF6B5C", background: "#FFEDEA", border: "1px solid #FF6B5C28", borderRadius: 6, padding: "3px 9px" }}>
                          ↑ {item.subtype} {item.score}{item.missedMarks != null ? ` (missed ${item.missedMarks})` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Performance insights (prose fallback) ── */}
      {!structuredAnalysis && insightItems.length > 0 && (
        <div className="content-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 24, height: 24, background: "#f4f7fb", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </span>
            <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Performance insights</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {insightItems.map((sentence, i) => {
              const sec = detectSection(sentence);
              const color = sec ? COLORS[sec] : "#94A3B8";
              const tint = sec ? TINTS[sec] : "#F8F9FB";
              return (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  background: tint, borderRadius: 10, padding: "10px 14px",
                  borderLeft: `3px solid ${color}`,
                }}>
                  {sec && (
                    <span style={{
                      fontSize: 9, fontWeight: 900, letterSpacing: "0.08em",
                      color, background: color + "28",
                      borderRadius: 4, padding: "2px 6px",
                      flexShrink: 0, marginTop: 2,
                    }}>{sec.toUpperCase()}</span>
                  )}
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>{sentence}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {(["vr", "dm", "qr"] as const).map(sec => (
          <SectionCard
            key={sec} sec={sec}
            score={report[`${sec}_score` as "vr_score" | "dm_score" | "qr_score"]}
            subtypes={bySection[sec]}
          />
        ))}
      </div>

      {/* ── SJT ── */}
      {bySection.sjt.length > 0 && (
        <div className="content-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: COLORS.sjt }}>SJT</span>
              <p style={{ fontSize: 11.5, color: "var(--ink-soft)", margin: "2px 0 0" }}>Situational Judgement — {sjtRaw}/{sjtMax} points</p>
            </div>
            <span style={{ fontSize: 15, fontWeight: 900, color: sjtColor, background: sjtColor + "18", padding: "4px 14px", borderRadius: 8 }}>{sjtLabel}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6 }}>
            {bySection.sjt.map(([k, v]) => {
              const p = v.maxPts > 0 ? v.rawPts / v.maxPts : 0;
              const c = perfColor(p);
              return (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f8f9fb", borderRadius: 7 }}>
                  <span style={{ fontSize: 12, color: "var(--ink)" }}>{v.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c, marginLeft: 8 }}>{v.rawPts}/{v.maxPts}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Strengths / Priorities ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="content-card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#3DBE6C", margin: "0 0 12px", textTransform: "uppercase" }}>Your strengths</p>
          {strengths.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0, lineHeight: 1.6 }}>No subtypes yet scoring above 70% — this diagnostic is your starting point.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {strengths.map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{v.label}</span>
                    <span style={{ fontSize: 10, color: "var(--ink-soft)", marginLeft: 6 }}>{v.section.toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#3DBE6C", background: "#EDFBF3", padding: "2px 7px", borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>{v.rawPts}/{v.maxPts}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#FF6B5C", margin: "0 0 12px", textTransform: "uppercase" }}>Priority areas</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {priorities.map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{v.label}</span>
                  <span style={{ fontSize: 10, color: "var(--ink-soft)", marginLeft: 6 }}>{v.section.toUpperCase()}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#FF6B5C", background: "#FFEDEA", padding: "2px 7px", borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>{v.rawPts}/{v.maxPts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Study plan (structured JSON) ── */}
      {structuredWeeks && structuredWeeks.length > 0 && (
        <div className="content-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ width: 24, height: 24, background: "#eaf2ff", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D7FF9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Your 4-week study plan</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {structuredWeeks.map((week, i) => (
              <div key={i} style={{ background: "#f8f9fb", borderRadius: 12, padding: "16px 18px", borderLeft: "3px solid #2D7FF9" }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: "#2D7FF9", margin: "0 0 3px" }}>{week.title}</p>
                {week.focus && (
                  <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: "0 0 10px", lineHeight: 1.5 }}>{week.focus}</p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {week.tasks.map((task, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid #2D7FF928", background: "white", flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 12, lineHeight: 1.55, color: "var(--ink)", margin: 0 }}>{task}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Study plan (prose fallback) ── */}
      {!structuredWeeks && planBlocks.length > 0 && (
        <div className="content-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ width: 24, height: 24, background: "#eaf2ff", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D7FF9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Your 4-week study plan</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {planBlocks.filter(b => b.title).map((week, i) => (
              <div key={i} style={{ background: "#f8f9fb", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #2D7FF9" }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#2D7FF9", margin: "0 0 7px" }}>{week.title}</p>
                <p style={{ fontSize: 12, lineHeight: 1.75, color: "var(--ink)", margin: 0, whiteSpace: "pre-wrap" }}>{week.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingBottom: 24 }}>
        <Link href="/dashboard">
          <button style={{ minHeight: 44, padding: "0 24px", background: "#2D7FF9", color: "white", border: 0, borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            Go to dashboard →
          </button>
        </Link>
        <Link href="/section/vr">
          <button style={{ minHeight: 44, padding: "0 24px", background: "white", color: "var(--ink)", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Start studying
          </button>
        </Link>
      </div>
    </div>
  );
}
