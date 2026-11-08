import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo/config";
import { listMovies } from "@/features/movies/client.server";

export const revalidate = 86400; // 24 hours cache

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${origin}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${origin}/kham-pha`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${origin}/dieu-khoan`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const res = await listMovies({ page: 1 });
    if (res.ok && res.data.items) {
      const movieRoutes: MetadataRoute.Sitemap = res.data.items.flatMap((movie) => [
        {
          url: `${origin}/phim/${movie.slug}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.8,
        },
        {
          url: `${origin}/xem/${movie.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ]);
      return [...staticRoutes, ...movieRoutes];
    }
  } catch {
    // Graceful fallback to static routes if remote upstream catalog fails
  }

  return staticRoutes;
}
