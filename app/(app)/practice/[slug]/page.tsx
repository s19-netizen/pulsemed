import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { requirePaid } from "@/lib/isPaid";
import PracticeBuilder from "./PracticeBuilder";
import GuestDoneCard from "./GuestDoneCard";
import Link from "next/link";

const VALID_SLUGS = ["vr", "dm", "qr", "sjt"];

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.online";

const PRACTICE_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  vr: {
    title: "Free UCAT VR Practice Questions 2026 | Pulsemed",
    description: "Free UCAT Verbal Reasoning practice — True/False/Can't Tell and MCQ questions with full explanations, Bronze to Diamond difficulty. No account needed to start.",
    keywords: ["UCAT verbal reasoning practice", "free UCAT VR questions", "UCAT true false cant tell practice", "UCAT verbal reasoning 2026", "UCAT VR free"],
  },
  dm: {
    title: "Free UCAT DM Practice Questions 2026 | Pulsemed",
    description: "Free UCAT Decision Making practice — syllogisms, Venn diagrams, probability and argument questions with worked explanations. Start instantly, no account needed.",
    keywords: ["UCAT decision making practice", "free UCAT DM questions", "UCAT syllogisms practice", "UCAT decision making 2026", "UCAT DM free"],
  },
  qr: {
    title: "Free UCAT QR Practice Questions 2026 | Pulsemed",
    description: "Free UCAT Quantitative Reasoning practice — percentages, ratios, data interpretation and graph questions with full worked solutions. 540+ questions, all difficulty levels.",
    keywords: ["UCAT quantitative reasoning practice", "free UCAT QR questions", "UCAT maths practice", "UCAT quantitative reasoning 2026", "UCAT QR free"],
  },
  sjt: {
    title: "Free UCAT SJT Practice Questions 2026 | Pulsemed",
    description: "Free UCAT Situational Judgement practice — Appropriateness, Importance and Most/Least questions with full explanations and band scoring. 400+ SJT questions.",
    keywords: ["UCAT situational judgement practice", "free UCAT SJT questions", "UCAT SJT 2026", "UCAT appropriateness questions", "UCAT SJT free"],
  },
};

const SECTION_FULL: Record<string, string> = {
  vr: "Verbal Reasoning", dm: "Decision Making", qr: "Quantitative Reasoning", sjt: "Situational Judgement",
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const meta = PRACTICE_META[params.slug];
  if (!meta) return {};
  const canonical = `${BASE_URL}/practice/${params.slug}`;
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical, languages: { "en-GB": canonical } },
    openGraph: { title: meta.title, description: meta.description, url: canonical },
    twitter: { card: "summary", title: meta.title, description: meta.description },
  };
}

function PracticeJsonLd({ slug }: { slug: string }) {
  const meta = PRACTICE_META[slug];
  const full = SECTION_FULL[slug];
  if (!meta) return null;
  const url = `${BASE_URL}/practice/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pulsemed", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Practice", item: `${BASE_URL}/practice` },
          { "@type": "ListItem", position: 3, name: full, item: url },
        ],
      },
      {
        "@type": "Course",
        name: `UCAT ${full} Practice`,
        description: meta.description,
        url,
        provider: { "@type": "Organization", name: "Pulsemed", url: BASE_URL },
        educationalLevel: "Secondary",
        audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "UK medical school applicants" },
        offers: { "@type": "Offer", price: "0", priceCurrency: "GBP", availability: "https://schema.org/InStock" },
        keywords: meta.keywords.join(", "),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

const SECTION_CONFIG: Record<string, { label: string; short: string; color: string; tint: string; sets: string; hasGuest: boolean }> = {
  vr:  { label: "Verbal Reasoning",       short: "VR",  color: "#2D7FF9", tint: "#EAF2FF", sets: "3 passages",   hasGuest: true  },
  dm:  { label: "Decision Making",        short: "DM",  color: "#8B6BFF", tint: "#F1ECFF", sets: "3 scenarios",  hasGuest: true  },
  qr:  { label: "Quantitative Reasoning", short: "QR",  color: "#3DBE6C", tint: "#EDFBF3", sets: "3 data sets",  hasGuest: false },
  sjt: { label: "Situational Judgement",  short: "SJT", color: "#FF6B5C", tint: "#FFEDEA", sets: "3 scenarios",  hasGuest: false },
};

export default async function PracticePage({ params }: { params: { slug: string } }) {
  if (!VALID_SLUGS.includes(params.slug)) notFound();

  const session = await getServerSession(authOptions);
  if (session?.user) {
    const u = session.user as any;
    await requirePaid(u.id, u.role ?? "user", u.email ?? "");
    return (
      <>
        <PracticeJsonLd slug={params.slug} />
        <PracticeBuilder slug={params.slug} />
      </>
    );
  }

  const cookieStore = cookies();
  const doneCookie = cookieStore.get(`pm_done_${params.slug}`);

  if (doneCookie) {
    let result = { correct: 0, total: 12 };
    try { result = JSON.parse(doneCookie.value); } catch {}
    return <GuestDoneCard section={params.slug} correct={result.correct} total={result.total} />;
  }

  // Guest, no cookie yet — show teaser
  const cfg = SECTION_CONFIG[params.slug];
  return (
    <>
    <PracticeJsonLd slug={params.slug} />
    <div style={{ "--section": cfg.color, "--section-tint": cfg.tint } as any}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Practice</p>
          <div className="title-row">
            <span className="section-badge">{cfg.short}</span>
            <h1>{cfg.label}</h1>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cfg.hasGuest && (
          <div className="content-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.tint, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 15, margin: "0 0 3px", fontWeight: 800 }}>Try the free {cfg.short} set — {cfg.sets} · 12 questions</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                Work through a real sample of {cfg.label} questions and see your score at the end. No account needed.
              </p>
            </div>
            <Link href={`/question?section=${params.slug}&guest=1`} style={{ flexShrink: 0 }}>
              <button style={{ minHeight: 40, padding: "0 18px", border: 0, borderRadius: 10, background: cfg.color, color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                Start {cfg.short} set →
              </button>
            </Link>
          </div>
        )}

        <div className="content-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.hasGuest ? "#f7f9fc" : cfg.tint, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cfg.hasGuest ? "var(--ink-soft)" : cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, margin: "0 0 3px", fontWeight: 800 }}>
              {cfg.hasGuest ? "More questions available" : `Unlock full ${cfg.short} practice`}
            </h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
              {cfg.hasGuest
                ? "Full question bank, difficulty filtering, and a personalised study plan. Free account required."
                : `Access the full ${cfg.label} question bank, difficulty filters, and your personalised study plan. Free account required.`}
            </p>
          </div>
          <Link href="/auth/signin" style={{ flexShrink: 0 }}>
            <button style={{ minHeight: 40, padding: "0 18px", border: cfg.hasGuest ? "1.5px solid var(--line)" : 0, borderRadius: 10, background: cfg.hasGuest ? "white" : cfg.color, fontSize: 12, fontWeight: cfg.hasGuest ? 700 : 800, cursor: "pointer", color: cfg.hasGuest ? "var(--ink)" : "white", whiteSpace: "nowrap" }}>
              {cfg.hasGuest ? "Sign up free" : `Start ${cfg.short} practice →`}
            </button>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
