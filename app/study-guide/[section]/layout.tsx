import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.online";

const SECTION_META: Record<string, {
  title: string;
  description: string;
  keywords: string[];
  full: string;
}> = {
  vr: {
    full: "Verbal Reasoning",
    title: "UCAT VR Study Guide — Free & Complete 2026",
    description:
      "Complete free UCAT Verbal Reasoning study guide. True/False/Can't Tell logic, MCQ inference, assumptions and writer's view — with technique walkthroughs and timed practice. No paywall.",
    keywords: ["UCAT VR study guide", "UCAT verbal reasoning guide free", "UCAT true false cant tell explained", "UCAT VR technique 2026"],
  },
  dm: {
    full: "Decision Making",
    title: "UCAT DM Study Guide — Free & Complete 2026",
    description:
      "Complete free UCAT Decision Making study guide. Syllogisms, Venn diagrams, probability, argument evaluation — step-by-step technique with worked examples. No paywall.",
    keywords: ["UCAT DM study guide", "UCAT decision making guide free", "UCAT syllogisms explained", "UCAT DM technique 2026"],
  },
  qr: {
    full: "Quantitative Reasoning",
    title: "UCAT QR Study Guide — Free & Complete 2026",
    description:
      "Complete free UCAT Quantitative Reasoning study guide. Percentages, ratios, fractions, rates, data interpretation, geometry and algebra — with worked examples. No paywall.",
    keywords: ["UCAT QR study guide", "UCAT quantitative reasoning guide free", "UCAT maths technique 2026", "UCAT data interpretation guide"],
  },
  sjt: {
    full: "Situational Judgement",
    title: "UCAT SJT Study Guide — Free & Complete 2026",
    description:
      "Complete free UCAT Situational Judgement study guide. Appropriateness, Importance and Most/Least questions with the SHAPE framework and band scoring. No paywall.",
    keywords: ["UCAT SJT study guide", "UCAT situational judgement guide free", "UCAT SJT technique 2026", "UCAT appropriateness questions guide"],
  },
};

export async function generateMetadata({
  params,
}: {
  params: { section: string };
}): Promise<Metadata> {
  const meta = SECTION_META[params.section] ?? {
    full: "UCAT",
    title: "UCAT Study Guide — Free 2026",
    description: "Free UCAT study guide covering all sections on Pulsemed.",
    keywords: ["UCAT study guide free"],
  };
  const canonical = `${BASE_URL}/study-guide/${params.section}`;
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

export default function StudyGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
