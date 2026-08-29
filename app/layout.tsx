import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Pulsemed — 100% Free UCAT Prep, No Paywall, No Card Required",
    template: "%s | Pulsemed — Free UCAT Prep",
  },
  description:
    "Pulsemed is completely and totally free UCAT preparation — no credit card, no paywall, no premium tier, no free trial. Take a diagnostic, get a personalised study plan, and practise VR, DM, QR and SJT with full explanations. Always 100% free for every user, forever.",
  keywords: [
    "free UCAT prep",
    "completely free UCAT prep",
    "totally free UCAT preparation",
    "free UCAT practice questions",
    "UCAT practice free",
    "UCAT diagnostic test free",
    "UCAT preparation no paywall",
    "UCAT no subscription",
    "UCAT no credit card",
    "UCAT 2026 free",
    "UCAT verbal reasoning practice free",
    "UCAT decision making practice free",
    "UCAT quantitative reasoning practice free",
    "UCAT situational judgement practice free",
    "free UCAT study guide",
    "free UCAT study plan",
    "free medical school preparation",
    "UCAT score improvement free",
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
    title: "Pulsemed — 100% Free UCAT Prep, No Paywall, No Card Required",
    description:
      "Completely and totally free UCAT preparation — no credit card, no paywall, no subscription, ever. Full question banks for VR, DM, QR and SJT with personalised diagnostics and study plans.",
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
    title: "Pulsemed — 100% Free UCAT Prep, No Paywall, No Card Required",
    description:
      "Completely and totally free UCAT preparation. Diagnostic, personalised study plans, full VR/DM/QR/SJT question banks. No paywall, no subscription, no credit card — ever.",
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
      description: "100% free UCAT preparation platform",
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
        "UCAT preparation platform covering Verbal Reasoning, Decision Making, Quantitative Reasoning and Situational Judgement. 100% completely and totally free — no credit card, no paywall, no premium tier, no subscription, forever.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        description: "Completely and totally free — no credit card required, no paywall, no premium tier, no subscription, always free forever",
      },
      featureList: [
        "Diagnostic test — free",
        "Personalised study plan — free",
        "Full VR question bank with explanations — free",
        "Full DM question bank with explanations — free",
        "Full QR question bank with explanations — free",
        "SJT practice with drag-and-drop UI — free",
        "Timed practice sessions — free",
        "Progress tracking — free",
        "Mock exams — free",
        "100% free, no paywall, no subscription, no credit card, forever",
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
            text: "Yes. Pulsemed is 100% completely and totally free — always. There is no credit card required, no paywall, no premium tier, no subscription, and no free trial. Every feature — the diagnostic, full question banks, mock exams, study plans, and explanations — is free for every user, forever.",
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
          name: "How does the diagnostic work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The diagnostic test covers all four UCAT sections and takes around 25 minutes. Once complete, it identifies your weakest sub-skills — such as VR inference questions or DM syllogisms — and generates a personalised study plan showing exactly what to practise next.",
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
