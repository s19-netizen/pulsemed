import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import SectionClient from "./SectionClient";

const VALID_SLUGS = ["vr", "dm", "qr", "sjt"];

const SECTION_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  vr: {
    title: "UCAT Verbal Reasoning — Free Practice & Study Guide",
    description:
      "Master UCAT Verbal Reasoning with free practice questions and a complete study guide. Covers True/False/Can't Tell and MCQ question types with worked explanations. 100% free on Pulsemed.",
    keywords: ["UCAT verbal reasoning", "UCAT VR practice free", "UCAT true false cant tell", "UCAT verbal reasoning questions", "UCAT VR study guide"],
  },
  dm: {
    title: "UCAT Decision Making — Free Practice & Study Guide",
    description:
      "Free UCAT Decision Making practice covering syllogisms, Venn diagrams, probability and argument evaluation. Full study guide with step-by-step technique. 100% free on Pulsemed.",
    keywords: ["UCAT decision making", "UCAT DM practice free", "UCAT syllogisms", "UCAT venn diagrams", "UCAT probability questions"],
  },
  qr: {
    title: "UCAT Quantitative Reasoning — Free Practice & Study Guide",
    description:
      "Free UCAT Quantitative Reasoning practice with 540+ questions across Bronze, Silver, Gold and Diamond difficulty. Tables, graphs, percentages, ratios and more. 100% free on Pulsemed.",
    keywords: ["UCAT quantitative reasoning", "UCAT QR practice free", "UCAT maths questions", "UCAT data interpretation", "UCAT quantitative reasoning questions"],
  },
  sjt: {
    title: "UCAT Situational Judgement — Free Practice & Study Guide",
    description:
      "Free UCAT Situational Judgement practice with 400+ questions — Appropriateness, Importance, and Most/Least Appropriate formats. Full study guide and worked explanations. 100% free on Pulsemed.",
    keywords: ["UCAT situational judgement", "UCAT SJT practice free", "UCAT appropriateness questions", "UCAT importance questions", "UCAT SJT study guide"],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const meta = SECTION_META[params.slug];
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `/section/${params.slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/section/${params.slug}`,
    },
  };
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
    return <SectionClient slug={params.slug} responses={responses ?? []} />;
  }

  // Guests can always access Learn pages — no cookie gate
  return <SectionClient slug={params.slug} responses={[]} isGuest />;
}
