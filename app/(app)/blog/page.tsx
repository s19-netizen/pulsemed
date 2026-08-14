import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllPosts } from "@/lib/blog";
import BlogIndex from "./BlogIndex";

export const metadata: Metadata = {
  title: "UCAT Prep Blog — Free Guides & Tips",
  description: "Free UCAT revision guides, section tips, study plans and strategies. Written for 2026 applicants.",
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
