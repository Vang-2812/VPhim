import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*", "/tai-khoan/*", "/auth/*"],
      },
      {
        // Explicit access for AI and Generative Search Engine crawlers
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: ["/", "/phim/*", "/xem/*", "/kham-pha", "/dieu-khoan"],
        disallow: ["/admin/*", "/api/*", "/tai-khoan/*", "/auth/*"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
