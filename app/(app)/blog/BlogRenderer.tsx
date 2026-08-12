import Link from "next/link";
import { IMAGE_MAP } from "@/lib/blog-shared";

const SECTION_CTA: Record<string, { label: string; href: string; color: string; tint: string }> = {
  vr:  { label: "Practice Verbal Reasoning", href: "/practice/vr",  color: "#2D7FF9", tint: "#EAF2FF" },
  dm:  { label: "Practice Decision Making",  href: "/practice/dm",  color: "#8B6BFF", tint: "#F1ECFF" },
  qr:  { label: "Practice Quantitative Reasoning", href: "/practice/qr", color: "#3DBE6C", tint: "#EDFBF3" },
  sjt: { label: "Practice Situational Judgement", href: "/practice/sjt", color: "#FF6B5C", tint: "#FFEDEA" },
};

// Headings injected after section-transition images
const IMAGE_HEADINGS: Record<string, string> = {
  "Verbal Reasoning":                    "Verbal Reasoning",
  "Decision Making":                     "Decision Making",
  "Quantitative Reasoning":              "Quantitative Reasoning",
  "Situational Judgement":               "Situational Judgement",
  "UCAT Overview Four Part Test Structure": "The Four UCAT Sections",
  "Study Plan":                          "Building Your Plan",
  "PulseMed UCAT Study Dashboard":       "Putting It Into Practice",
};

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={m.index}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

// Try to pull a heading from a paragraph's first sentence.
// Returns { heading, rest } if a pattern matches, otherwise null.
function extractParagraphHeading(text: string): { heading: string; rest: string } | null {
  // "The first/second/third/fourth section is X. ..."
  const ordinalMatch = text.match(/^The (?:first|second|third|fourth) section is ([^.]+)\.(.*)/si);
  if (ordinalMatch) {
    return { heading: ordinalMatch[1].trim(), rest: ordinalMatch[2].trim() };
  }
  // "In Verbal Reasoning / Decision Making / QR / SJT, ..."
  const inSectionMatch = text.match(/^In (Verbal Reasoning|Decision Making|Quantitative Reasoning|Situational Judgement),\s*(.*)/si);
  if (inSectionMatch) {
    return { heading: inSectionMatch[1], rest: inSectionMatch[2].trim() };
  }
  return null;
}

function BlogCTA({ section, variant }: { section: string | null; variant: "inline" | "end" }) {
  const cta = section ? SECTION_CTA[section] : null;

  if (variant === "inline") {
    return (
      <div className="blog-cta-inline">
        <div>
          <p>Free UCAT practice — no account needed to start</p>
          {cta && (
            <Link href={cta.href}>
              <button style={{ background: cta.color, color: "white", border: 0, borderRadius: 9, padding: "10px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer", marginRight: 8 }}>
                {cta.label} →
              </button>
            </Link>
          )}
          <Link href="/diagnostic">
            <button style={{ background: "white", color: "var(--ink)", border: "1.5px solid var(--line)", borderRadius: 9, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Take free diagnostic
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-cta-end">
      <div className="blog-cta-end-inner">
        <span className="blog-cta-eyebrow">100% free · no card required</span>
        <h3>Ready to put this into practice?</h3>
        <p>PulseMed gives you a full question bank across all four UCAT sections, a personalised diagnostic, and AI-powered study planning — completely free.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/auth/signin">
            <button className="blog-cta-primary">Sign up free →</button>
          </Link>
          <Link href="/diagnostic">
            <button className="blog-cta-secondary">Take your diagnostic</button>
          </Link>
          {cta && (
            <Link href={cta.href}>
              <button className="blog-cta-secondary" style={{ borderColor: cta.color, color: cta.color }}>
                {cta.label}
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlogRenderer({ content, section, heroImageSrc }: { content: string; section: string | null; heroImageSrc?: string }) {
  const rawBlocks = content.split(/\n\n+/);
  const nodes: React.ReactNode[] = [];
  let ctaShown = false;
  let imgCount = 0;
  let hasContent = false;
  let lastHeading = "";   // prevents duplicate consecutive headings
  let i = 0;

  while (i < rawBlocks.length) {
    const block = rawBlocks[i].trim();
    if (!block) { i++; continue; }

    // Strip trailing --- separator
    if (/^---+$/.test(block)) { i++; continue; }

    // Image marker — skip if it matches the hero (already shown above article)
    const imgMatch = block.match(/^\[([^\]]+)\]$/);
    if (imgMatch) {
      const imgName = imgMatch[1];
      const src = IMAGE_MAP[imgName];
      if (src && src !== heroImageSrc) {
        imgCount++;
        nodes.push(
          <div key={`img-${i}`} className="blog-img-wrap">
            <img src={src} alt={imgName} className="blog-img" />
          </div>
        );
        // Inject heading after section-transition image (skip if same heading just shown)
        const autoHeading = IMAGE_HEADINGS[imgName];
        if (autoHeading && hasContent && autoHeading !== lastHeading) {
          nodes.push(<h2 key={`img-h-${i}`} className="blog-h2">{autoHeading}</h2>);
          lastHeading = autoHeading;
        }
        if (!ctaShown && imgCount >= 2) {
          nodes.push(<BlogCTA key={`cta-${i}`} section={section} variant="inline" />);
          ctaShown = true;
        }
      }
      i++;
      continue;
    }

    // Unordered list
    const listLines = block.split("\n").filter(l => l.trim().startsWith("- "));
    if (listLines.length === block.split("\n").filter(Boolean).length && listLines.length > 0) {
      hasContent = true;
      nodes.push(
        <ul key={i} className="blog-list">
          {listLines.map((l, j) => <li key={j}>{renderInline(l.replace(/^-\s+/, ""))}</li>)}
        </ul>
      );
      i++;
      continue;
    }

    // Ordered list
    const olLines = block.split("\n").filter(l => /^\d+\.\s/.test(l.trim()));
    if (olLines.length === block.split("\n").filter(Boolean).length && olLines.length > 0) {
      hasContent = true;
      nodes.push(
        <ol key={i} className="blog-list blog-list--ol">
          {olLines.map((l, j) => <li key={j}>{renderInline(l.replace(/^\d+\.\s+/, ""))}</li>)}
        </ol>
      );
      i++;
      continue;
    }

    // Explicit h2
    if (block.startsWith("## ")) {
      lastHeading = block.slice(3);
      nodes.push(<h2 key={i} className="blog-h2">{renderInline(block.slice(3))}</h2>);
      i++;
      continue;
    }

    // Explicit h3
    if (block.startsWith("### ")) {
      lastHeading = block.slice(4);
      nodes.push(<h3 key={i} className="blog-h3">{renderInline(block.slice(4))}</h3>);
      i++;
      continue;
    }

    // Paragraph — try to extract implicit heading from first sentence
    const fullText = block.split("\n").filter(Boolean).join(" ");
    const extracted = extractParagraphHeading(fullText);
    if (extracted) {
      if (extracted.heading !== lastHeading) {
        nodes.push(<h2 key={`ph-${i}`} className="blog-h2">{extracted.heading}</h2>);
        lastHeading = extracted.heading;
      }
      if (extracted.rest) {
        nodes.push(
          <p key={i} className="blog-p">{renderInline(extracted.rest)}</p>
        );
      }
    } else {
      const lines = block.split("\n").filter(Boolean);
      nodes.push(
        <p key={i} className="blog-p">
          {lines.map((line, j) => (
            <span key={j}>{renderInline(line)}{j < lines.length - 1 ? " " : ""}</span>
          ))}
        </p>
      );
    }
    hasContent = true;
    i++;
  }

  nodes.push(<BlogCTA key="end-cta" section={section} variant="end" />);

  return <div className="blog-body">{nodes}</div>;
}
