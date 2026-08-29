import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import SectionClient from "./SectionClient";

const VALID_SLUGS = ["vr", "dm", "qr", "sjt"];

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.online";

const SECTION_META: Record<string, {
  title: string;
  description: string;
  keywords: string[];
  full: string;
}> = {
  vr: {
    full: "Verbal Reasoning",
    title: "Free UCAT Verbal Reasoning Practice & Guide",
    description:
      "Master UCAT Verbal Reasoning for free. True/False/Can't Tell and MCQ question types with full worked explanations, technique walkthroughs, and a personalised study plan. No paywall.",
    keywords: ["UCAT verbal reasoning", "UCAT VR practice free", "UCAT true false cant tell", "UCAT verbal reasoning questions 2026", "free UCAT VR study guide"],
  },
  dm: {
    full: "Decision Making",
    title: "Free UCAT Decision Making Practice & Guide",
    description:
      "Master UCAT Decision Making for free. Syllogisms, Venn diagrams, probability and argument evaluation with step-by-step technique. Full question bank, no paywall.",
    keywords: ["UCAT decision making", "UCAT DM practice free", "UCAT syllogisms practice", "UCAT venn diagrams", "free UCAT DM study guide"],
  },
  qr: {
    full: "Quantitative Reasoning",
    title: "Free UCAT Quantitative Reasoning Practice",
    description:
      "Master UCAT Quantitative Reasoning for free. 540+ questions across Bronze to Diamond difficulty — percentages, ratios, data interpretation and graphs. No paywall.",
    keywords: ["UCAT quantitative reasoning", "UCAT QR practice free", "UCAT maths questions", "UCAT data interpretation 2026", "free UCAT QR study guide"],
  },
  sjt: {
    full: "Situational Judgement",
    title: "Free UCAT Situational Judgement Practice",
    description:
      "Master UCAT Situational Judgement for free. 400+ Appropriateness, Importance and Most/Least questions with band scoring and full explanations. No paywall.",
    keywords: ["UCAT situational judgement", "UCAT SJT practice free", "UCAT appropriateness questions", "UCAT SJT band scoring", "free UCAT SJT study guide"],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const meta = SECTION_META[params.slug];
  if (!meta) return {};
  const canonical = `${BASE_URL}/section/${params.slug}`;
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical,
      languages: { "en-GB": canonical },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
    },
    twitter: {
      card: "summary",
      title: meta.title,
      description: meta.description,
    },
  };
}

function SectionJsonLd({ slug }: { slug: string }) {
  const meta = SECTION_META[slug];
  if (!meta) return null;
  const url = `${BASE_URL}/section/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pulsemed", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Learn", item: `${BASE_URL}/section/${slug}` },
          { "@type": "ListItem", position: 3, name: meta.full, item: url },
        ],
      },
      {
        "@type": "Course",
        name: `UCAT ${meta.full} — Free Practice & Study Guide`,
        description: meta.description,
        url,
        inLanguage: "en-GB",
        provider: {
          "@type": "Organization",
          name: "Pulsemed",
          url: BASE_URL,
          areaServed: { "@type": "Country", name: "United Kingdom" },
        },
        educationalLevel: "Secondary",
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
          audienceType: "UK medical school applicants sitting the UCAT",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          description: "100% free — no credit card required",
        },
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

export default async function SectionPage({ params }: { params: { slug: string } }) {
  if (!VALID_SLUGS.includes(params.slug)) notFound();

  const session = await getServerSession(authOptions);

  if (session?.user) {
    const userId = (session.user as any).id;
    const { data: responses } = await supabase
      .from("question_responses")
      .select("question_tag, is_correct, created_at")
      .eq("user_id", userId)
      .like("question_tag", `${params.slug}-%`);
    return (
      <>
        <SectionJsonLd slug={params.slug} />
        <SectionClient slug={params.slug} responses={responses ?? []} />
      </>
    );
  }

  return (
    <>
      <SectionJsonLd slug={params.slug} />
      <SectionClient slug={params.slug} responses={[]} isGuest />
    </>
  );
}
