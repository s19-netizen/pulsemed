// Client-safe exports — no fs/path

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroImage: string;
  content: string;
  category: string;
  readingTime: number;
  section: "vr" | "dm" | "qr" | "sjt" | null;
}

export const IMAGE_MAP: Record<string, string> = {
  "PulseMed UCAT Study Dashboard": "/blog/PulseMed UCAT Study Dashboard.png",
  "Decision Making": "/blog/Decision Making.png",
  "Quantitative Reasoning": "/blog/Quantitative Reasoning.png",
  "Situational Judgement": "/blog/Situational Judgement.png",
  "Study Plan": "/blog/Study Plan.png",
  "UCAT Overview Four Part Test Structure": "/blog/UCAT Overview Four Part Test Structure.png",
  "UCAT Overview": "/blog/UCAT Overview.png",
  "Verbal Reasoning": "/blog/Verbal Reasoning.png",
};

export const CATEGORIES = [
  "All",
  "UCAT Prep",
  "Verbal Reasoning",
  "Decision Making",
  "Quantitative Reasoning",
  "Situational Judgement",
  "Study Planning",
  "Strategy & Mindset",
];

export const CATEGORY_COLORS: Record<string, string> = {
  "Verbal Reasoning": "#2D7FF9",
  "Decision Making": "#8B6BFF",
  "Quantitative Reasoning": "#3DBE6C",
  "Situational Judgement": "#FF6B5C",
  "Study Planning": "#F59E0B",
  "Strategy & Mindset": "#06B6D4",
  "UCAT Prep": "#64748B",
  "All": "#1A2A3A",
};
