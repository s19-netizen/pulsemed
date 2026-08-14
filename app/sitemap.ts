import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.online";

const SECTIONS = ["vr", "dm", "qr", "sjt"] as const;

// Study guide topic IDs per section (high-value content pages)
const STUDY_GUIDE_TOPICS: Record<string, string[]> = {
  vr: ["tfct", "tfct-true-false", "tfct-cant-tell", "mcq", "mcq-main-idea", "mcq-writers-view", "mcq-meaning", "mcq-assumptions"],
  dm: ["syllogisms", "venn-diagrams", "probability", "interpreting-info", "recognising-assumptions", "figures-tables"],
  qr: ["percentages", "ratios", "fractions", "rates", "data-interpretation", "geometry", "algebra"],
  sjt: ["sjt-formats", "appropriateness-questions", "importance-questions", "most-least-questions", "sjt-themes", "patient-safety", "honesty", "confidentiality", "teamwork"],
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  const sectionRoutes: MetadataRoute.Sitemap = SECTIONS.map(slug => ({
    url: `${BASE_URL}/section/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const studyGuideRoots: MetadataRoute.Sitemap = SECTIONS.map(slug => ({
    url: `${BASE_URL}/study-guide/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const studyGuideTopics: MetadataRoute.Sitemap = SECTIONS.flatMap(slug =>
    (STUDY_GUIDE_TOPICS[slug] ?? []).map(topic => ({
      url: `${BASE_URL}/study-guide/${slug}/${topic}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }))
  );

  const practiceRoutes: MetadataRoute.Sitemap = SECTIONS.map(slug => ({
    url: `${BASE_URL}/practice/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const blogIndex: MetadataRoute.Sitemap = [{
    url: `${BASE_URL}/blog`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }];

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map(p => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...sectionRoutes,
    ...studyGuideRoots,
    ...studyGuideTopics,
    ...practiceRoutes,
    ...blogIndex,
    ...blogPosts,
  ];
}
