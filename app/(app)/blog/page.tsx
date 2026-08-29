import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllPosts } from "@/lib/blog";
import BlogIndex from "./BlogIndex";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.online";
const canonical = `${BASE_URL}/blog`;

export const metadata: Metadata = {
  title: "UCAT Prep Blog — Free Strategy Guides 2026",
  description:
    "Free UCAT revision guides covering every section — VR, DM, QR and SJT. Technique walkthroughs, study plans, and score strategy for 2026 UK applicants. No paywall.",
  keywords: [
    "UCAT preparation blog",
    "free UCAT guides",
    "UCAT strategy 2026",
    "UCAT revision tips",
    "UCAT verbal reasoning guide",
    "UCAT decision making guide",
    "UCAT quantitative reasoning guide",
    "UCAT situational judgement guide",
  ],
  alternates: {
    canonical,
    languages: { "en-GB": canonical },
  },
  openGraph: {
    title: "UCAT Prep Blog — Free Strategy Guides 2026 | Pulsemed",
    description:
      "Free UCAT revision guides for VR, DM, QR and SJT. Technique walkthroughs and study strategy for 2026 UK applicants.",
    url: canonical,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "UCAT Prep Blog — Free Strategy Guides 2026 | Pulsemed",
    description:
      "Free UCAT revision guides for VR, DM, QR and SJT. Technique walkthroughs and study strategy for 2026 UK applicants.",
  },
};

export default async function BlogPage() {
  const posts = getAllPosts();
  const session = await getServerSession(authOptions);
  const isSignedIn = !!session?.user;

  return (
    <div className="blog-page">
      {/* Hero */}
      <div className="blog-hero">
        <p className="eyebrow">Free UCAT guides</p>
        <h1>The PulseMed Blog</h1>
        <p className="blog-hero-sub">
          {posts.length} articles covering every section, skill and strategy — completely free.
        </p>
        {!isSignedIn && (
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <Link href="/diagnostic">
              <button className="blog-hero-btn-primary">Take free diagnostic →</button>
            </Link>
            <Link href="/auth/signin">
              <button className="blog-hero-btn-secondary">Sign up free</button>
            </Link>
          </div>
        )}
      </div>

      <BlogIndex posts={posts} />
    </div>
  );
}
