import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Pulsemed — Free AI UCAT Prep, Completely Free",
    template: "%s | Pulsemed — Free UCAT Prep",
  },
  description:
    "Pulsemed is 100% free UCAT preparation — no card, no paywall, no premium tier. Take an AI-powered diagnostic, get a personalised study plan, and practise VR, DM, QR and SJT with full explanations. Built for 2026 UCAT applicants.",
  keywords: [
    "free UCAT prep",
    "free UCAT practice questions",
    "UCAT practice free",
    "UCAT diagnostic test free",
    "AI UCAT preparation",
    "UCAT 2026",
    "UCAT verbal reasoning practice",
    "UCAT decision making practice",
    "UCAT quantitative reasoning practice",
    "UCAT situational judgement practice",
    "UCAT study guide",
    "UCAT study plan",
    "free medical school preparation",
    "UCAT score improvement",
    "UCAT question bank free",
    "pulsemed",
  ],
  authors: [{ name: "Pulsemed" }],
  creator: "Pulsemed",
  publisher: "Pulsemed",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: BASE_URL,
    siteName: "Pulsemed",
    title: "Pulsemed — Free AI UCAT Prep, Completely Free",
    description:
      "100% free UCAT preparation with AI diagnostics, personalised study plans, and full question banks for VR, DM, QR and SJT. No card required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pulsemed — Free AI UCAT Prep",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulsemed — Free AI UCAT Prep, Completely Free",
    description:
      "100% free UCAT preparation. AI diagnostic, personalised study plans, full VR/DM/QR/SJT question banks. No paywall, ever.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: BASE_URL },
  category: "education",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Pulsemed",
      description: "100% free AI-powered UCAT preparation platform",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/study-guide/vr?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Pulsemed",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/og-image.png` },
      description: "Free AI-powered UCAT preparation for UK medical school applicants",
      sameAs: [],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#app`,
      name: "Pulsemed",
      url: BASE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description:
        "AI-powered UCAT preparation platform covering Verbal Reasoning, Decision Making, Quantitative Reasoning and Situational Judgement. 100% free — no credit card, no premium tier.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        description: "Completely free — no card required, no premium tier",
      },
      featureList: [
        "AI-powered diagnostic test",
        "Personalised study plan",
        "Full VR question bank with explanations",
        "Full DM question bank with explanations",
        "Full QR question bank with explanations",
        "SJT practice with drag-and-drop UI",
        "Timed practice sessions",
        "Progress tracking",
        "100% free, no paywall",
      ],
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
        audienceType: "UK medical school applicants sitting the UCAT",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is Pulsemed completely free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Pulsemed is 100% free. There is no credit card required, no premium tier, and no paywall. Every feature — the AI diagnostic, full question banks, study plans, and explanations — is free for all users.",
          },
        },
        {
          "@type": "Question",
          name: "What UCAT sections does Pulsemed cover?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pulsemed covers all four UCAT sections: Verbal Reasoning (VR), Decision Making (DM), Quantitative Reasoning (QR), and Situational Judgement (SJT). Each section has a full question bank, study guide, and timed practice mode.",
          },
        },
        {
          "@type": "Question",
          name: "How does the AI diagnostic work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The diagnostic test covers all four UCAT sections and takes around 25 minutes. Once complete, AI analyses your answers to identify your weakest sub-skills — such as VR inference questions or DM syllogisms — and generates a personalised study plan showing exactly what to practise next.",
          },
        },
        {
          "@type": "Question",
          name: "Is Pulsemed good for UCAT 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Pulsemed is built and updated specifically for UCAT 2026. The question banks, diagnostic, and study plans reflect the current UCAT format and difficulty distribution.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
