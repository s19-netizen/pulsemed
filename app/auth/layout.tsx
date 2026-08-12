import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in to Pulsemed — Free UCAT Prep",
  description: "Sign in or create your free Pulsemed account to access AI UCAT diagnostics, personalised study plans, and full question banks.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
