import type { Metadata } from "next";

const SECTION_META: Record<string, { title: string; description: string }> = {
  vr: {
    title: "UCAT Verbal Reasoning Study Guide — Free, Complete",
    description:
      "Complete free UCAT Verbal Reasoning study guide. Covers True/False/Can't Tell logic, MCQ inference, assumptions, and writer's view — with technique walkthroughs and memory aids.",
  },
  dm: {
    title: "UCAT Decision Making Study Guide — Free, Complete",
    description:
      "Complete free UCAT Decision Making study guide. Step-by-step technique for syllogisms, Venn diagrams, probability, argument evaluation and statistical reasoning.",
  },
  qr: {
    title: "UCAT Quantitative Reasoning Study Guide — Free, Complete",
    description:
      "Complete free UCAT Quantitative Reasoning study guide. Percentages, ratios, fractions, rates, data interpretation, geometry and algebra — with worked examples.",
  },
  sjt: {
    title: "UCAT Situational Judgement Study Guide — Free, Complete",
    description:
      "Complete free UCAT Situational Judgement study guide. Learn how to approach Appropriateness, Importance and Most/Least questions using the SHAPE framework.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { section: string };
}): Promise<Metadata> {
  const meta = SECTION_META[params.section] ?? {
    title: "UCAT Study Guide — Free",
    description: "Free UCAT study guide covering all sections on Pulsemed.",
  };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/study-guide/${params.section}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/study-guide/${params.section}`,
    },
  };
}

export default function StudyGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
