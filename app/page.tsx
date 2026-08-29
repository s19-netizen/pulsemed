import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { getAllPosts, CATEGORY_COLORS } from "@/lib/blog";
import { BadgeCheck, BarChart2, BookOpen } from "lucide-react";


export const metadata: Metadata = {
  title: "Free UCAT Prep 2026 — Diagnostic, Plans & Practice | Pulsemed",
  description:
    "The free UCAT prep platform for 2026 UK applicants. Identify weak sub-skills in 25 minutes, get a personalised study plan, and practise VR, DM, QR & SJT with full explanations. No credit card, no paywall.",
  alternates: {
    canonical: "/",
    languages: { "en-GB": "/" },
  },
  openGraph: {
    title: "Free UCAT Prep 2026 — Diagnostic, Plans & Practice | Pulsemed",
    description:
      "Free UCAT diagnostic, personalised study plan, and full question banks for VR, DM, QR & SJT. No credit card, no paywall. Built for 2026 UK applicants.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free UCAT Prep 2026 — Diagnostic, Plans & Practice | Pulsemed",
    description:
      "Free UCAT diagnostic, personalised study plan, and full question banks for VR, DM, QR & SJT. No credit card, no paywall.",
  },
};

export default async function Home() {
  const blogPosts = getAllPosts().slice(0, 3);
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1A2A3A", background: "#fff" }}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
        @keyframes floatSlow{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-8px) rotate(3deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(45,127,249,0.3)}50%{box-shadow:0 0 0 14px rgba(45,127,249,0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes wiggle{0%,100%{transform:rotate(0)}5%{transform:rotate(-8deg)}10%{transform:rotate(6deg)}15%{transform:rotate(0)}}
        .hero-card{animation:float 4s ease-in-out infinite}
        .blob1{animation:floatSlow 6s ease-in-out infinite}
        .blob2{animation:floatSlow 8s ease-in-out infinite 1s}
        .logo-icon{animation:wiggle 4s ease-in-out infinite}
        .pulse-btn{animation:pulse 2s ease-in-out infinite}
      `}</style>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px", borderBottom: "2px solid #EAEEF4", position: "sticky", top: 0,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 20 }}>
          <div className="logo-icon" style={{ width: 34, height: 34, borderRadius: 10, background: "#2D7FF9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M1 9H5L7 3L11 15L13 9H17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          Pulsemed
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Link href="/section/vr" style={{ fontSize: 14, fontWeight: 600, color: "#6B7A8C", textDecoration: "none" }}>VR</Link>
          <Link href="/section/dm" style={{ fontSize: 14, fontWeight: 600, color: "#6B7A8C", textDecoration: "none" }}>DM</Link>
          <Link href="/section/qr" style={{ fontSize: 14, fontWeight: 600, color: "#6B7A8C", textDecoration: "none" }}>QR</Link>
          <Link href="/section/sjt" style={{ fontSize: 14, fontWeight: 600, color: "#6B7A8C", textDecoration: "none" }}>SJT</Link>
          <Link href="/blog" style={{ fontSize: 14, fontWeight: 600, color: "#6B7A8C", textDecoration: "none" }}>Blog</Link>
          <Link href="/auth/signin" style={{
            padding: "9px 18px", borderRadius: 10, border: "2px solid #EAEEF4",
            fontWeight: 600, fontSize: 14, color: "#1A2A3A", textDecoration: "none", background: "#fff",
          }}>Sign in</Link>
          <Link href="/auth/signin" className="pulse-btn" style={{
            padding: "9px 20px", borderRadius: 10, background: "#2D7FF9",
            fontWeight: 700, fontSize: 14, color: "#fff", textDecoration: "none",
          }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 48px 48px", position: "relative", overflow: "hidden" }}>
        <div className="blob1" style={{
          position: "absolute", top: 20, right: -60, width: 320, height: 320,
          borderRadius: "50%", background: "radial-gradient(circle, #EAF2FF 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div className="blob2" style={{
          position: "absolute", bottom: -40, left: -40, width: 240, height: 240,
          borderRadius: "50%", background: "radial-gradient(circle, #F1ECFF 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center", position: "relative" }}>
          <div style={{ animation: "slideUp .7s ease both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, background: "#EAF2FF", color: "#2D7FF9",
              fontWeight: 700, fontSize: 13, borderRadius: 20, padding: "5px 14px", marginBottom: 20,
            }}>
              <span>✨</span> Built for the 2026 UCAT
            </div>
            <h1 style={{
              fontFamily: "'Baloo 2', sans-serif", fontSize: 52, lineHeight: 1.08,
              marginBottom: 18, fontWeight: 800,
            }}>
              Stop guessing what to practise.<br />
              Start fixing what&apos;s{" "}
              <span style={{ background: "#EAF2FF", color: "#2D7FF9", padding: "0 10px", borderRadius: 10, display: "inline-block", transform: "rotate(-1.5deg)" }}>
                actually
              </span>{" "}
              wrong.
            </h1>
            <p style={{ fontSize: 18, color: "#6B7A8C", maxWidth: 480, marginBottom: 32, lineHeight: 1.6 }}>
              Take a full diagnostic, get a breakdown of every sub-skill, and practise at real exam speed — with the technique explained the moment you slip up.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/auth/signin" style={{
                padding: "14px 26px", borderRadius: 12, background: "#2D7FF9",
                fontWeight: 700, fontSize: 16, color: "#fff", textDecoration: "none",
                boxShadow: "0 4px 0 #1A5FD0",
              }}>Start the diagnostic →</Link>
              <Link href="/section/vr" style={{
                padding: "14px 26px", borderRadius: 12, border: "2px solid #EAEEF4",
                fontWeight: 600, fontSize: 16, color: "#1A2A3A", textDecoration: "none",
              }}>See how it works</Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24 }}>
              {["No card needed", "Report instant", "Always free"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#6B7A8C", fontWeight: 600 }}>
                  <span style={{ color: "#3DBE6C" }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="hero-card" style={{
            background: "#fff", border: "2px solid #EAEEF4", borderRadius: 20,
            padding: 24, boxShadow: "0 12px 0 #EAF2FF",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 36, fontWeight: 800, color: "#2D7FF9", lineHeight: 1 }}>12</div>
                <div style={{ fontSize: 12, color: "#6B7A8C", fontWeight: 600 }}>day streak</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 28, fontWeight: 800, color: "#1A2A3A", lineHeight: 1 }}>2,140</div>
                <div style={{ fontSize: 12, color: "#6B7A8C", fontWeight: 600 }}>projected score</div>
              </div>
              <span style={{ fontSize: 32 }}>🔥</span>
            </div>
            {[
              { icon: "💬", label: "Verbal reasoning", pct: 78, color: "#2D7FF9" },
              { icon: "🧩", label: "Decision making", pct: 61, color: "#8B6BFF" },
              { icon: "📊", label: "Quant reasoning", pct: 85, color: "#3DBE6C" },
              { icon: "⚖️", label: "Situational J.", pct: 60, color: "#FF6B5C" },
            ].map(({ icon, label, pct, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>{label}</div>
                  <div style={{ height: 7, borderRadius: 4, background: "#EAEEF4" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: color }} />
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</div>
              </div>
            ))}
            <div style={{ background: "#EDFBF3", border: "1px solid #A8E8C0", borderRadius: 10, padding: "10px 12px", marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#3DBE6C", marginBottom: 3 }}>🎯 Focus next: DM Syllogisms</div>
              <div style={{ fontSize: 11, color: "#6B7A8C" }}>43% accuracy — targeted drills will move this fast</div>
            </div>
          </div>
        </div>
      </section>


      {/* Sections */}
      <section className="lp-section">
        <p className="lp-section-eyebrow">What&apos;s covered</p>
        <h2 className="lp-section-title">Every UCAT section, fully covered</h2>
        <div className="lp-sections-grid">
          {[
            { key: "vr", short: "VR", label: "Verbal Reasoning", color: "#2D7FF9", tint: "#EAF2FF", desc: "True, False, Can't Tell questions across a range of academic and professional passages." },
            { key: "dm", short: "DM", label: "Decision Making", color: "#8B6BFF", tint: "#F1ECFF", desc: "Syllogisms, Venn diagrams, probability, and argument evaluation under timed conditions." },
            { key: "qr", short: "QR", label: "Quantitative Reasoning", color: "#3DBE6C", tint: "#EDFBF3", desc: "Tables, charts, and data interpretation. No calculator — just fast mental arithmetic." },
            { key: "sjt", short: "SJT", label: "Situational Judgement", color: "#FF6B5C", tint: "#FFEDEA", desc: "Appropriateness and importance ratings for real-world clinical and professional scenarios." },
          ].map(s => (
            <div key={s.key} className="lp-section-card" style={{ "--sc": s.color, "--st": s.tint } as React.CSSProperties}>
              <span className="lp-section-badge">{s.short}</span>
              <h3>{s.label}</h3>
              <p>{s.desc}</p>
              <div className="lp-section-links">
                <Link href={`/section/${s.key}`} className="lp-section-link">Learn →</Link>
                <Link href={`/practice/${s.key}`} className="lp-section-link-soft">Practice →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section style={{ background: "#F4F7FB", padding: "72px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
            <div>
              <div style={{
                display: "inline-block", background: "#EAF2FF", color: "#2D7FF9",
                fontWeight: 700, fontSize: 13, borderRadius: 20, padding: "5px 14px", marginBottom: 14,
              }}>📖 Pulsemed blog</div>
              <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 36, fontWeight: 800 }}>Tips, strategy & technique</h2>
            </div>
            <Link href="/blog" style={{ fontSize: 14, fontWeight: 700, color: "#2D7FF9", textDecoration: "none" }}>
              All posts →
            </Link>
          </div>
          <div className="blog-grid">
            {blogPosts.map((post) => {
              const color = CATEGORY_COLORS[post.category] ?? "#64748B";
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                  {post.heroImage && (
                    <div className="blog-card-img-wrap">
                      <img src={post.heroImage} alt={post.title} className="blog-card-img" />
                    </div>
                  )}
                  <div className="blog-card-body">
                    <span className="blog-card-cat" style={{ color, background: color + "18" }}>{post.category}</span>
                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-card-desc">{post.metaDescription}</p>
                    <span className="blog-card-read">{post.readingTime} min read</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why free — semantic content for crawlers + users */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 48px 0" }}>
        <div style={{
          background: "#F4F7FB", borderRadius: 24, padding: "40px 48px",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32,
        }}>
          <div>
            <div style={{ marginBottom: 10 }}><BadgeCheck size={28} color="#2D7FF9" /></div>
            <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
              Completely free — always
            </h3>
            <p style={{ fontSize: 14, color: "#6B7A8C", lineHeight: 1.65 }}>
              No credit card, no free trial, no premium tier. Every question, explanation, and study plan on Pulsemed is free for every user, forever.
            </p>
          </div>
          <div>
            <div style={{ marginBottom: 10 }}><BarChart2 size={28} color="#2D7FF9" /></div>
            <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
              Personalised diagnostics
            </h3>
            <p style={{ fontSize: 14, color: "#6B7A8C", lineHeight: 1.65 }}>
              The diagnostic analyses every answer to pinpoint the exact sub-skills holding you back — VR inference, DM syllogisms, QR ratios — and builds a study plan around them.
            </p>
          </div>
          <div>
            <div style={{ marginBottom: 10 }}><BookOpen size={28} color="#2D7FF9" /></div>
            <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
              All 4 UCAT sections covered
            </h3>
            <p style={{ fontSize: 14, color: "#6B7A8C", lineHeight: 1.65 }}>
              Full question banks for VR, DM, QR and SJT — 1,000+ questions with worked explanations, timed practice, and difficulty levels from Bronze to Diamond.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 48px 80px" }}>
        <div style={{
          background: "linear-gradient(135deg, #2D7FF9 0%, #8B6BFF 100%)", borderRadius: 28,
          padding: "52px 32px", textAlign: "center", boxShadow: "0 10px 0 #D6E5FF",
        }}>
          <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 34, fontWeight: 800, marginBottom: 10, color: "#fff" }}>
            Ready to find out where you actually stand?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 28 }}>
            Take the diagnostic. Get your full breakdown at the end.
          </p>
          <Link href="/auth/signin" style={{
            display: "inline-block", padding: "14px 30px", borderRadius: 14,
            background: "#fff", color: "#2D7FF9", fontWeight: 700, fontSize: 16, textDecoration: "none",
            boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
          }}>Start the diagnostic →</Link>
        </div>

        <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 48, paddingTop: 24, borderTop: "2px solid #EAEEF4" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#2D7FF9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                <path d="M1 9H5L7 3L11 15L13 9H17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Pulsemed
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            {[["Diagnostic", "/auth/signin"], ["Sign in", "/auth/signin"]].map(([l, h]) => (
              <a key={l} href={h} style={{ color: "#6B7A8C", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#6B7A8C" }}>UCAT prep that gets you. 🚀</div>
        </footer>
      </section>
    </div>
  );
}
