import Link from "next/link";

const SECTION_CONFIG: Record<string, { label: string; short: string; color: string; deep: string; tint: string }> = {
  vr:  { label: "Verbal Reasoning",       short: "VR",  color: "#2D7FF9", deep: "#1A5FD0", tint: "#EAF2FF" },
  dm:  { label: "Decision Making",        short: "DM",  color: "#8B6BFF", deep: "#6846D9", tint: "#F1ECFF" },
  qr:  { label: "Quantitative Reasoning", short: "QR",  color: "#3DBE6C", deep: "#238A4B", tint: "#EDFBF3" },
  sjt: { label: "Situational Judgement",  short: "SJT", color: "#FF6B5C", deep: "#D84A3E", tint: "#FFEDEA" },
};

export default function GuestDoneCard({ section, correct, total }: { section: string; correct: number; total: number }) {
  const cfg = SECTION_CONFIG[section] ?? SECTION_CONFIG.vr;
  const pct = Math.round((correct / total) * 100);

  return (
    <div style={{ "--section": cfg.color, "--section-deep": cfg.deep, "--section-tint": cfg.tint } as any}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Practice</p>
          <div className="title-row">
            <span className="section-badge">{cfg.short}</span>
            <h1>{cfg.label}</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 540 }}>
        <div className="content-card" style={{ padding: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: "var(--section-tint)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 750, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".08em" }}>Free set complete</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "var(--section-deep)", lineHeight: 1.1 }}>{pct}% <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink-soft)" }}>{correct} / {total} correct</span></p>
            </div>
          </div>

          <h2 style={{ fontSize: 22, margin: "0 0 10px" }}>Want more {cfg.short} questions?</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.65, margin: "0 0 24px" }}>
            You've completed the free {cfg.label} set. Create a free account to unlock all practice questions, track your progress over time, and get a personalised study plan.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/auth/signin" style={{ display: "block" }}>
              <button style={{ width: "100%", minHeight: 48, border: 0, borderRadius: 13, background: "var(--section)", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                Create free account →
              </button>
            </Link>
            <Link href="/auth/signin" style={{ display: "block" }}>
              <button style={{ width: "100%", minHeight: 44, border: "1.5px solid var(--line)", borderRadius: 13, background: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "var(--ink)" }}>
                Sign in to existing account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
