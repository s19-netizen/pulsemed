import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.online";

const PUBLIC_ALLOW = ["/", "/section/", "/study-guide/", "/practice/", "/blog", "/blog/", "/llms.txt"];
const PRIVATE_DISALLOW = ["/dashboard", "/onboarding", "/diagnostic", "/question", "/results", "/mocks", "/settings", "/api/", "/auth/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      { userAgent: "GPTBot",        allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      { userAgent: "ChatGPT-User",  allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      { userAgent: "anthropic-ai",  allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      { userAgent: "ClaudeBot",     allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      { userAgent: "PerplexityBot", allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      { userAgent: "Google-Extended", allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      { userAgent: "Gemini",        allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      { userAgent: "cohere-ai",     allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      { userAgent: "meta-externalagent", allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
