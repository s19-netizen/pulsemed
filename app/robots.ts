import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemed.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/section/",
          "/study-guide/",
          "/practice/",
          "/blog",
          "/blog/",
        ],
        disallow: [
          "/dashboard",
          "/onboarding",
          "/diagnostic",
          "/question",
          "/results",
          "/mocks",
          "/settings",
          "/api/",
          "/auth/",
        ],
      },
      // Let AI crawlers index public content explicitly
      {
        userAgent: "GPTBot",
        allow: ["/", "/section/", "/study-guide/", "/blog"],
        disallow: ["/api/", "/auth/", "/dashboard"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/section/", "/study-guide/", "/blog"],
        disallow: ["/api/", "/auth/", "/dashboard"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/section/", "/study-guide/", "/blog"],
        disallow: ["/api/", "/auth/", "/dashboard"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
