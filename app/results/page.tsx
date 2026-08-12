"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const SECTION_META: Record<string, { color: string; tint: string; label: string; short: string }> = {
  vr:  { color: "#2d7ff9", tint: "#eaf2ff", label: "Verbal Reasoning",       short: "VR"  },
  dm:  { color: "#8b6bff", tint: "#f1ecff", label: "Decision Making",        short: "DM"  },
  qr:  { color: "#3dbe6c", tint: "#edfbf3", label: "Quantitative Reasoning", short: "QR"  },
  sjt: { color: "#ff6b5c", tint: "#ffedea", label: "Situational Judgement",  short: "SJT" },
};

const TARGET_S: Record<string, number> = { vr: 32, dm: 61, qr: 39, sjt: 23 };

const SJT_BAND_LABELS: Record<number, string> = {
  1: "Band 1 — Excellent",
  2: "Band 2 — Good",
  3: "Band 3 — Developing",
  4: "Band 4 — Needs focus",
};

// ── Insight renderer ──────────────────────────────────────────────────────────

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    const m = p.match(/^\*\*([^*]+)\*\*$/);
    return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{p}</span>;
  });
}

function InsightsBlock({ text, color }: { text: string; color: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { nodes.push(<div key={i} style={{ height: 6 }} />); continue; }

    // Full-line bold heading: **...**
    if (/^\*\*.+\*\*$/.test(line)) {
      nodes.push(
        <p key={i} style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)", margin: 0, lineHeight: 1.55 }}>
          {parseInline(line)}
        </p>
      );
      continue;
    }

    // Section label (e.g. "What went well:")
    if (/^[A-Z][^•*\n]+:$/.test(line)) {
      nodes.push(
        <p key={i} style={{ fontSize: 10.5, fontWeight: 800, color: "var(--ink-soft)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "4px 0 4px" }}>
          {line}
        </p>
      );
      continue;
    }

    // Bullet
    if (line.startsWith("•")) {
      nodes.push(
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color, fontWeight: 900, fontSize: 14, flexShrink: 0, lineHeight: 1.5 }}>•</span>
          <p style={{ fontSize: 13, color: "var(--ink)", margin: 0, lineHeight: 1.65 }}>{parseInline(line.slice(1).trim())}</p>
        </div>
      );
      continue;
    }

    // Regular line with possible inline bold
    nodes.push(
      <p key={i} style={{ fontSize: 13, color: "var(--ink)", margin: 0, lineHeight: 1.65 }}>
        {parseInline(line)}
      </p>
    );
  }

  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{nodes}</div>;
}

// ── Main results content ──────────────────────────────────────────────────────

function ResultsContent() {
  const params     = useSearchParams();
  const section    = params.get("section") ?? "vr";
  const isGuest    = params.get("guest") === "1";
  const total      = Number(params.get("total"))   || 0;
  const correct    = Number(params.get("correct")) || 0;
  const avgMs      = Number(params.get("avgMs"))   || 0;
  const sessionId  = params.get("sessionId") ?? "";

  const meta    = SECTION_META[section] ?? SECTION_META.vr;
  const wrong   = total - correct;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
  const target  = TARGET_S[section] ?? 40;
  const avgSec  = avgMs > 0 ? Math.round(avgMs / 1000) : null;
  const onPace  = avgSec !== null && avgSec <= target * 1.15;
  const tooSlow = avgSec !== null && avgSec > target * 1.6;

  const [loading, setLoading]           = useState(!isGuest);
  const [predictedScore, setPredicted]  = useState<number | null>(null);
  const [sjtBand, setSjtBand]           = useState<number | null>(null);
  const [insights, setInsights]         = useState<string>("");

  useEffect(() => {
    if (isGuest || total === 0) { setLoading(false); return; }
    fetch("/api/practice/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, correct, total, avgMs, sessionId }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.predictedScore != null) setPredicted(d.predictedScore);
        if (d.sjtBand != null) setSjtBand(d.sjtBand);
        if (d.insights) setInsights(d.insights);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scoreBarPct = predictedScore != null ? ((predictedScore - 300) / 600) * 100 : pct;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Score hero ── */}
      <div style={{ background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}cc 100%)`, borderRadius: 16, padding: "26px 28px", color: "white" }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", opacity: 0.7, margin: "0 0 6px" }}>
          {meta.short} PRACTICE SESSION
        </p>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{correct}</span>
            <span style={{ fontSize: 20, opacity: 0.7 }}>/{total}</span>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>{pct}%</span>
            <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}>accuracy</span>
          </div>
          {avgSec !== null && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: tooSlow ? "#fcd34d" : onPace ? "#86efac" : "#fde68a" }}>
                {avgSec}s avg
              </span>
              <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 4 }}>/ {target}s target</span>
            </div>
          )}
        </div>

        {/* Predicted score */}
        {loading ? (
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>Calculating predicted score…</p>
          </div>
        ) : section === "sjt" && sjtBand != null ? (
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", opacity: 0.7, margin: "0 0 3px" }}>PREDICTED BAND</p>
            <p style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{SJT_BAND_LABELS[sjtBand]}</p>
          </div>
        ) : predictedScore != null ? (
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", opacity: 0.7, margin: "0 0 3px" }}>PREDICTED {meta.short} SCORE</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 900 }}>{predictedScore}</span>
              <span style={{ fontSize: 14, opacity: 0.6 }}>/900</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${scoreBarPct}%`, background: "white", borderRadius: 3, opacity: 0.9 }} />
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${avgSec !== null ? 4 : 3}, 1fr)`, gap: 10 }}>
        {[
          { label: "Correct",   val: String(correct), sub: "answers", color: "#3dbe6c" },
          { label: "Incorrect", val: String(wrong),   sub: "to revisit", color: "#ff6b5c" },
          { label: "Accuracy",  val: `${pct}%`,        sub: "overall",  color: meta.color },
          ...(avgSec !== null ? [{ label: "Avg time", val: `${avgSec}s`, sub: `target ${target}s`, color: tooSlow ? "#f59e0b" : onPace ? "#3dbe6c" : meta.color }] : []),
        ].map(({ label, val, sub, color }) => (
          <div key={label} className="content-card" style={{ padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", color: "var(--ink-soft)", margin: "0 0 4px", textTransform: "uppercase" }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 900, color, margin: "0 0 2px" }}>{val}</p>
            <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── AI insights ── */}
      {(insights || loading) && (
        <div className="content-card" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 24, height: 24, background: meta.tint, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </span>
            <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Session insights</h3>
          </div>

          {loading ? (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>Generating your personalised feedback…</p>
          ) : (
            <InsightsBlock text={insights} color={meta.color} />
          )}
        </div>
      )}

      {/* ── Next steps ── */}
      {!isGuest && (
        <div className="content-card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "var(--ink-soft)", margin: "0 0 12px", textTransform: "uppercase" }}>Next steps</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Practice again", sub: "Keep building accuracy", href: `/practice/${section}` },
              { label: "Study guide",    sub: `Review ${meta.short} strategies`, href: `/study-guide/${section}/foundations` },
              { label: "Dashboard",      sub: "See your overall progress", href: "/dashboard" },
            ].map(({ label, sub, href }, i) => (
              <Link key={label} href={href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>{sub}</p>
                  </div>
                  <span style={{ color: meta.color, fontWeight: 700, fontSize: 16 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Guest CTA ── */}
      {isGuest && (
        <div style={{ background: `linear-gradient(135deg, ${meta.color}15, ${meta.color}08)`, border: `1px solid ${meta.color}30`, borderRadius: 14, padding: "24px 24px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: meta.color, margin: "0 0 6px" }}>YOU SCORED {pct}% ON YOUR TASTER</p>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "var(--ink)" }}>Track your progress with a free account</h2>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 18px", lineHeight: 1.6 }}>
            Sign up to get a predicted UCAT score after every session, unlock all practice questions, and build a personalised study plan.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/auth/signin">
              <button style={{ minHeight: 42, padding: "0 20px", background: meta.color, color: "white", border: 0, borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                Create free account →
              </button>
            </Link>
            <Link href={`/practice/${section}`}>
              <button style={{ minHeight: 42, padding: "0 20px", background: "white", color: "var(--ink)", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Try another session
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "var(--ink-soft)" }}>Loading results…</div>}>
      <ResultsContent />
    </Suspense>
  );
}
