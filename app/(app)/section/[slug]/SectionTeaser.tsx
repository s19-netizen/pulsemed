import Link from "next/link";

const SECTION_CONFIG: Record<string, { label: string; short: string; color: string; deep: string; tint: string; sets: string }> = {
  vr:  { label: "Verbal Reasoning",       short: "VR",  color: "#2D7FF9", deep: "#1A5FD0", tint: "#EAF2FF", sets: "3 passages" },
  dm:  { label: "Decision Making",        short: "DM",  color: "#8B6BFF", deep: "#6846D9", tint: "#F1ECFF", sets: "3 scenarios" },
  qr:  { label: "Quantitative Reasoning", short: "QR",  color: "#3DBE6C", deep: "#238A4B", tint: "#EDFBF3", sets: "3 data sets" },
  sjt: { label: "Situational Judgement",  short: "SJT", color: "#FF6B5C", deep: "#D84A3E", tint: "#FFEDEA", sets: "3 scenarios" },
};

export default function SectionTeaser({ slug }: { slug: string }) {
  const cfg = SECTION_CONFIG[slug] ?? SECTION_CONFIG.vr;

  return (
    <div style={{ "--section": cfg.color, "--section-deep": cfg.deep, "--section-tint": cfg.tint } as any}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Learn</p>
          <div className="title-row">
            <span className="section-badge">{cfg.short}</span>
            <h1>{cfg.label}</h1>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="content-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--section-tint)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, margin: "0 0 3px", fontWeight: 800 }}>Try the free {cfg.short} set — {cfg.sets} · 12 questions</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
              Work through a real sample of {cfg.label} questions and see your score at the end. No account needed.
            </p>
          </div>
          <Link href={`/practice/${slug}`} style={{ flexShrink: 0 }}>
            <button style={{ minHeight: 40, padding: "0 18px", border: 0, borderRadius: 10, background: "var(--section)", color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
              Start {cfg.short} set →
            </button>
          </Link>
        </div>

        <div className="content-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f7f9fc", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, margin: "0 0 3px", fontWeight: 800 }}>More questions available</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
              Full question bank, study guide, and a personalised plan. Create a free account to unlock everything.
            </p>
          </div>
          <Link href="/auth/signin" style={{ flexShrink: 0 }}>
            <button style={{ minHeight: 40, padding: "0 18px", border: "1.5px solid var(--line)", borderRadius: 10, background: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "var(--ink)", whiteSpace: "nowrap" }}>
              Sign up free
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
