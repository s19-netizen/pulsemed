"use client";
import { useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog-shared";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/blog-shared";


export default function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState("All");

  const visible = active === "All" ? posts : posts.filter(p => p.category === active);

  return (
    <>
      {/* Category filter */}
      <div className="blog-filter-row">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`blog-filter-btn${active === cat ? " active" : ""}`}
            style={active === cat ? { background: CATEGORY_COLORS[cat] ?? "#1A2A3A", color: "white", borderColor: CATEGORY_COLORS[cat] ?? "#1A2A3A" } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post count */}
      <p className="blog-count">{visible.length} article{visible.length !== 1 ? "s" : ""}</p>

      {/* Grid */}
      <div className="blog-grid">
        {visible.map(post => {
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
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-desc">{post.metaDescription}</p>
                <span className="blog-card-read">{post.readingTime} min read</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
