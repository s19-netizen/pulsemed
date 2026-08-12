import fs from "fs";
import path from "path";
import type { BlogPost } from "./blog-shared";
export type { BlogPost } from "./blog-shared";
export { IMAGE_MAP, CATEGORIES, CATEGORY_COLORS } from "./blog-shared";

function deriveSection(slug: string): BlogPost["section"] {
  if (/verbal-reasoning|ucat-vr/.test(slug)) return "vr";
  if (/decision-making|ucat-dm|syllogism|venn-diagram|strongest-arg/.test(slug)) return "dm";
  if (/quantitative-reasoning|ucat-qr|percentage|ratio|maths|mental-maths|tables|charts|calculator/.test(slug)) return "qr";
  if (/situational-judgement|ucat-sjt|patient-safety|confidentiality/.test(slug)) return "sjt";
  return null;
}

function deriveCategory(slug: string): string {
  if (/verbal-reasoning|ucat-vr|true-false|false-vs-cant|question-or-passage/.test(slug)) return "Verbal Reasoning";
  if (/decision-making|ucat-dm|syllogism|venn-diagram|strongest-arg/.test(slug)) return "Decision Making";
  if (/quantitative-reasoning|ucat-qr|percentage|ratio|maths|mental-maths|tables|charts|calculator/.test(slug)) return "Quantitative Reasoning";
  if (/situational-judgement|ucat-sjt|patient-safety|confidentiality/.test(slug)) return "Situational Judgement";
  if (/study-plan|revision|how-long|when-to-start|how-many|questions-a-day|checklist|routine/.test(slug)) return "Study Planning";
  if (/score|mock|timing|accuracy|speed|burnout|mindset|calm|anxiety|confidence/.test(slug)) return "Strategy & Mindset";
  return "UCAT Prep";
}

function parsePosts(raw: string): BlogPost[] {
  const { IMAGE_MAP } = require("./blog-shared");
  const posts: BlogPost[] = [];
  const sections = raw.split(/\n# Blog Post \d+\n/).filter(s => s.trim());

  for (const section of sections) {
    const titleMatch = section.match(/## Title\s*\n([^\n]+)/);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();

    const slugMatch = section.match(/\*\*Slug:\*\*\s*([^\n]+)/);
    if (!slugMatch) continue;
    const slug = slugMatch[1].trim().replace(/^\//, "");

    const metaTitleMatch = section.match(/\*\*Meta title:\*\*\s*([^\n]+)/);
    const metaTitle = metaTitleMatch ? metaTitleMatch[1].trim() : title;

    const metaDescMatch = section.match(/\*\*Meta description:\*\*\s*([^\n]+)/);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : "";

    const suggestedMatch = section.match(/\*\*Suggested images:\*\*\s*([^\n]+)/);
    const firstImageName = suggestedMatch ? (suggestedMatch[1].match(/\[([^\]]+)\]/) ?? [])[1] ?? "" : "";
    const heroImage = IMAGE_MAP[firstImageName] ?? "";

    const suggestedIdx = section.indexOf("**Suggested images:**");
    const afterSuggested = suggestedIdx >= 0 ? section.slice(suggestedIdx) : section;
    const bodyStart = afterSuggested.indexOf("\n");
    const rawBody = afterSuggested.slice(bodyStart).replace(/\n---\s*$/, "").trim();

    // Strip hero image marker (shown separately at top of post page)
    const afterHero = firstImageName
      ? rawBody.replace(`[${firstImageName}]`, "").replace(/^\s*\n+/, "").trim()
      : rawBody;

    // Strip editorial "Notes for your posting AI" sections (with or without ## prefix)
    const notesIdx = afterHero.search(/(?:^|\n)#{0,3}\s*(?:Notes for your posting AI|Additional notes for the posting AI)/i);
    const body = notesIdx >= 0 ? afterHero.slice(0, notesIdx).trim() : afterHero;

    const wordCount = body.replace(/\[[^\]]+\]/g, "").split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    posts.push({
      slug,
      title,
      metaTitle,
      metaDescription,
      heroImage,
      content: body,
      category: deriveCategory(slug),
      readingTime,
      section: deriveSection(slug),
    });
  }

  return posts;
}

let _cache: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (_cache) return _cache;
  const filePath = path.join(process.cwd(), "content", "blog.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  _cache = parsePosts(raw);
  return _cache;
}

export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find(p => p.slug === slug);
}
