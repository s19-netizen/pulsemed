import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

const MOCKS = [
  { key: "mock-1", label: "Full Mock 1", desc: "All four UCAT sections under timed exam conditions. 184 questions, 111 minutes.", sections: "VR · DM · QR · SJT", time: "111 min", color: "mock-icon", href: "/mocks/mock-1" },
  { key: "mock-2", label: "Full Mock 2 (Hard)", desc: "All four UCAT sections under timed exam conditions. 184 questions, 111 minutes.", sections: "VR · DM · QR · SJT", time: "111 min", color: "mock-icon", href: "/mocks/mock-2" },
];

export default async function MocksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div style={{ "--section": "var(--purple)", "--section-deep": "#6747d8", "--section-tint": "#f1ecff" } as any}>
        <div className="page-header">
          <div>
            <p className="eyebrow">Mock exams</p>
            <h1>Simulate the real thing</h1>
            <p>Full-length papers covering all four UCAT sections under timed exam conditions, with detailed answer reviews.</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="content-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--section-tint)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B6BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 15, margin: "0 0 3px", fontWeight: 800 }}>{MOCKS.length} full mock papers available</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                Full-length papers covering all four UCAT sections under timed exam conditions. 178 questions, 2 hours 15 minutes.
              </p>
            </div>
            <Link href="/auth/signin" style={{ flexShrink: 0 }}>
              <button style={{ minHeight: 40, padding: "0 18px", border: 0, borderRadius: 10, background: "#8B6BFF", color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                Sign up to try one →
              </button>
            </Link>
          </div>

          <div className="content-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f7f9fc", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 15, margin: "0 0 3px", fontWeight: 800 }}>Track your performance</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                Score breakdowns, section analysis, and improvement trends. Free account required.
              </p>
            </div>
            <Link href="/auth/signin" style={{ flexShrink: 0 }}>
              <button style={{ minHeight: 40, padding: "0 18px", border: "1.5px solid var(--line)", borderRadius: 10, background: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "var(--ink)", whiteSpace: "nowrap" }}>
                Create free account
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ "--section": "var(--purple)", "--section-deep": "#6747d8", "--section-tint": "#f1ecff" } as any}>
      <div className="mock-hero">
        <div>
          <p className="section-kicker">MOCK EXAMS</p>
          <h2>Simulate the real thing</h2>
          <p>Full papers across all four sections under timed exam conditions. 184 questions, 111 minutes — the closest thing to sitting the real UCAT.</p>
          <Link href="/mocks/mock-1"><button style={{ marginTop: 18 }} className="start-session">Start Mock 1 →</button></Link>
        </div>
        <div>
          <span>Available mocks</span>
          <strong>{MOCKS.length}</strong>
          <small>full papers</small>
        </div>
      </div>

      <div className="mock-grid">
        {MOCKS.map(mock => (
          <div key={mock.key} className="mock-card">
            <div className={mock.color}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <small>{mock.sections}</small>
              <h3>{mock.label}</h3>
              <p>{mock.desc}</p>
            </div>
            <div className="mock-card-bottom">
              <strong>{mock.time}</strong>
              {mock.href ? (
                <Link href={mock.href}><button>Start →</button></Link>
              ) : (
                <button disabled style={{ opacity: 0.45, cursor: "not-allowed" }}>Coming soon</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
