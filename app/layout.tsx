import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.online";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Pulsemed — Free UCAT Prep 2026 | No Paywall",
    template: "%s | Pulsemed",
  },
  description:
    "100% free UCAT prep. Diagnostic, personalised study plan, and full question banks for VR, DM, QR & SJT. No credit card, no paywall — always free. Built for 2026 UK applicants.",
  keywords: [
    "free UCAT prep",
    "free UCAT practice questions",
    "UCAT preparation 2026",
    "UCAT practice free",
    "UCAT diagnostic test free",
    "UCAT no paywall",
    "UCAT no subscription",
    "UCAT verbal reasoning practice free",
    "UCAT decision making practice free",
    "UCAT quantitative reasoning practice free",
    "UCAT situational judgement practice free",
    "free UCAT study guide",
    "free UCAT study plan",
    "UCAT 2026 UK",
    "free UCAT question bank",
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
    title: "Pulsemed — Free UCAT Prep 2026 | No Paywall",
    description:
      "100% free UCAT preparation — diagnostic, personalised study plans, and full question banks for VR, DM, QR & SJT. No credit card, no paywall, ever.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pulsemed — Free UCAT Prep",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulsemed — Free UCAT Prep 2026 | No Paywall",
    description:
      "100% free UCAT prep. Full question banks for VR, DM, QR & SJT, plus diagnostic and personalised study plan. No paywall, no subscription, ever.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
    languages: { "en-GB": BASE_URL },
  },
  category: "education",
  other: {
    "geo.region": "GB",
    "geo.country": "GB",
    "geo.placename": "United Kingdom",
    "content-language": "en-GB",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Pulsemed",
      inLanguage: "en-GB",
      description: "100% free UCAT preparation platform for UK medical school applicants",
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
      description: "Free UCAT preparation for UK medical school applicants",
      areaServed: { "@type": "Country", name: "United Kingdom" },
      inLanguage: "en-GB",
      sameAs: [],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#app`,
      name: "Pulsemed",
      url: BASE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "en-GB",
      description:
        "UCAT preparation platform covering Verbal Reasoning, Decision Making, Quantitative Reasoning and Situational Judgement. 100% free — no credit card, no paywall, no subscription, forever.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        description: "Completely free — no credit card, no paywall, no subscription, always",
      },
      featureList: [
        "UCAT diagnostic test",
        "Personalised study plan",
        "Full VR question bank with worked explanations",
        "Full DM question bank with worked explanations",
        "Full QR question bank with worked explanations",
        "Full SJT question bank with worked explanations",
        "Timed mock exams",
        "Progress tracking and accuracy analytics",
        "100% free — no paywall, no subscription, no credit card",
      ],
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
        audienceType: "UK medical school applicants sitting the UCAT",
        geographicArea: { "@type": "Country", name: "United Kingdom" },
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
            text: "Yes. Pulsemed is 100% free — always. No credit card, no paywall, no premium tier, no subscription, no free trial. Every feature — diagnostic, full question banks, mock exams, study plans, and explanations — is free for every user, forever.",
          },
        },
        {
          "@type": "Question",
          name: "What UCAT sections does Pulsemed cover?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pulsemed covers all four UCAT sections: Verbal Reasoning (VR), Decision Making (DM), Quantitative Reasoning (QR), and Situational Judgement (SJT). Each section has a full question bank, complete study guide, and timed practice mode.",
          },
        },
        {
          "@type": "Question",
          name: "How does the Pulsemed diagnostic work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The diagnostic covers all four UCAT sections in around 25 minutes. It identifies your weakest sub-skills — such as VR inference, DM syllogisms, or QR ratios — and generates a personalised study plan showing exactly what to practise next.",
          },
        },
        {
          "@type": "Question",
          name: "Is Pulsemed good for UCAT 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Pulsemed is built and maintained specifically for UCAT 2026. Question banks, the diagnostic, and study plans reflect the current UCAT format, timing, and difficulty distribution used by Pearson VUE.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need an account to use Pulsemed?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can try a free sample of VR and DM questions without an account. Creating a free account unlocks the full question banks, diagnostic, personalised study plan, progress tracking, and mock exams. No credit card is ever required.",
          },
        },
        {
          "@type": "Question",
          name: "How many UCAT practice questions does Pulsemed have?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pulsemed has over 1,000 UCAT practice questions across VR, DM, QR and SJT, plus two full-length timed mock exams. Every question includes a worked explanation. All questions are free.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
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
