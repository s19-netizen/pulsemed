import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/blog";
import { CATEGORY_COLORS } from "@/lib/blog-shared";
import { notFound } from "next/navigation";
import BlogRenderer from "../BlogRenderer";

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    openGraph: { title: post.metaTitle, description: post.metaDescription, images: post.heroImage ? [post.heroImage] : [] },
  };
}

const SECTION_META: Record<string, { label: string; color: string; tint: string; href: string }> = {
  vr:  { label: "Verbal Reasoning",       color: "#2D7FF9", tint: "#EAF2FF", href: "/practice/vr" },
  dm:  { label: "Decision Making",        color: "#8B6BFF", tint: "#F1ECFF", href: "/practice/dm" },
  qr:  { label: "Quantitative Reasoning", color: "#3DBE6C", tint: "#EDFBF3", href: "/practice/qr" },
  sjt: { label: "Situational Judgement",  color: "#FF6B5C", tint: "#FFEDEA", href: "/practice/sjt" },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const sectionInfo = post.section ? SECTION_META[post.section] : null;
  const catColor = CATEGORY_COLORS[post.category] ?? "#64748B";

  // Related: same category first, then same section
  const related = allPosts
    .filter(p => p.slug !== post.slug && (p.category === post.category || p.section === post.section))
    .slice(0, 3);

  // More in this category for the sidebar (up to 8)
  const morePosts = allPosts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 8);

  // Recent posts for sidebar if category is sparse
  const recentPosts = allPosts.filter(p => p.slug !== post.slug).slice(0, 6);

  return (
    <div className="blog-post-page">
      <Link href="/blog" className="blog-back">← All articles</Link>

      <header className="blog-post-header">
        <span className="blog-card-cat" style={{ color: catColor, background: catColor + "18" }}>{post.category}</span>
        <h1 className="blog-post-title">{post.title}</h1>
        <div className="blog-post-meta">
          <span>{post.readingTime} min read</span>
          {sectionInfo && (
            <>
              <span>·</span>
              <Link href={sectionInfo.href} style={{ color: sectionInfo.color, fontWeight: 700, textDecoration: "none" }}>
                Practice {sectionInfo.label} →
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="blog-post-layout">
        {/* Article */}
        <article className="blog-post-article">
          <BlogRenderer content={post.content} section={post.section} heroImageSrc={post.heroImage} />
        </article>

        {/* Sidebar */}
        <aside className="blog-post-aside">
          {/* Sign up card */}
          <div className="blog-aside-card" style={{ background: "linear-gradient(135deg,#1a2a3a,#2d4060)", border: "none" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "#93c5fd", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 6px" }}>100% free</p>
            <h3 style={{ fontSize: 15, margin: "0 0 6px", fontWeight: 800, color: "white" }}>Start practising now</h3>
            <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 12px" }}>
              Full question bank, diagnostic test and AI study plan — no card needed.
            </p>
            <Link href="/auth/signin" style={{ display: "block" }}>
              <button className="blog-aside-btn-primary">Sign up free →</button>
            </Link>
            <Link href="/diagnostic" style={{ display: "block", marginTop: 8 }}>
              <button className="blog-aside-btn-secondary" style={{ background: "transparent", color: "#94a3b8", border: "1px solid rgba(255,255,255,.15)" }}>Take diagnostic</button>
            </Link>
          </div>

          {/* Section practice card */}
          {sectionInfo && (
            <div className="blog-aside-card" style={{ borderColor: sectionInfo.color + "40", background: sectionInfo.tint }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: sectionInfo.color, textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 6px" }}>Practice</p>
              <h3 style={{ fontSize: 14, margin: "0 0 6px", fontWeight: 800 }}>{sectionInfo.label}</h3>
              <p style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 12px" }}>
                Real questions with instant feedback and walkthroughs.
              </p>
              <Link href={sectionInfo.href} style={{ display: "block" }}>
                <button className="blog-aside-btn-primary" style={{ background: sectionInfo.color }}>
                  Start practice →
                </button>
              </Link>
            </div>
          )}

          {/* More in this category */}
          {morePosts.length > 0 && (
            <div className="blog-aside-card">
              <p className="blog-aside-section-label">More in {post.category}</p>
              <div className="blog-aside-posts">
                {morePosts.map(p => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-aside-post-link">
                    {p.heroImage && <img src={p.heroImage} alt="" className="blog-aside-post-img" />}
                    <span>{p.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent articles */}
          <div className="blog-aside-card">
            <p className="blog-aside-section-label">Recent articles</p>
            <div className="blog-aside-posts">
              {recentPosts.map(p => {
                const c = CATEGORY_COLORS[p.category] ?? "#64748B";
                return (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-aside-post-link">
                    <span className="blog-aside-dot" style={{ background: c }} />
                    <span>{p.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* All sections */}
          <div className="blog-aside-card">
            <p className="blog-aside-section-label">Practice sections</p>
            {([
              { label: "Verbal Reasoning",       href: "/practice/vr",  color: "#2D7FF9" },
              { label: "Decision Making",        href: "/practice/dm",  color: "#8B6BFF" },
              { label: "Quantitative Reasoning", href: "/practice/qr",  color: "#3DBE6C" },
              { label: "Situational Judgement",  href: "/practice/sjt", color: "#FF6B5C" },
            ] as const).map(s => (
              <Link key={s.href} href={s.href} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)", fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                {s.label}
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="blog-related">
          <h2>Related articles</h2>
          <div className="blog-related-grid">
            {related.map(p => {
              const color = CATEGORY_COLORS[p.category] ?? "#64748B";
              return (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card">
                  {p.heroImage && (
                    <div className="blog-card-img-wrap" style={{ aspectRatio: "16/7" }}>
                      <img src={p.heroImage} alt={p.title} className="blog-card-img" />
                    </div>
                  )}
                  <div className="blog-card-body">
                    <span className="blog-card-cat" style={{ color, background: color + "18" }}>{p.category}</span>
                    <h3 className="blog-card-title" style={{ fontSize: 14 }}>{p.title}</h3>
                    <span className="blog-card-read">{p.readingTime} min read</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
