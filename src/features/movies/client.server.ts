import "server-only";
import { unstable_cache } from "next/cache";
import { fail, type Result } from "@/lib/result";
import { normalizeList, normalizeDetail, normalizeCatalog } from "./normalize";
import type {
  BrowseQuery,
  Page,
  MovieSummary,
  MovieDetail,
  CatalogOption,
} from "./types";
const BASE = "https://phimapi.com";
export async function requestJson(
  path: string,
  fetcher: typeof fetch = fetch,
): Promise<Result<unknown>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetcher(BASE + path, {
        signal: AbortSignal.timeout(10000),
        headers: { accept: "application/json" },
        next: { revalidate: 300 },
      });
      if (response.status === 404)
        return fail("NOT_FOUND", "Không tìm thấy phim này.");
      if (!response.ok) {
        if (response.status < 500 && response.status !== 429) break;
        throw new Error("upstream");
      }
      const json = await response.json();
      if (json?.status === false || json?.status === "error")
        return fail("NOT_FOUND", "Nguồn phim chưa có nội dung này.");
      return { ok: true, data: json };
    } catch {
      if (attempt === 1) break;
    }
  }
  return fail(
    "UPSTREAM_UNAVAILABLE",
    "Nguồn phim đang phản hồi chậm. Vui lòng thử lại sau.",
  );
}
export async function listMovies(
  query: BrowseQuery,
): Promise<Result<Page<MovieSummary>>> {
  const p = new URLSearchParams({
    page: String(query.page),
    sort_field: query.sort === "year" ? "year" : "modified.time",
    sort_type: "desc",
  });
  for (const key of ["category", "country", "year"] as const)
    if (query[key]) p.set(key, String(query[key]));
  let path = "/v1/api/danh-sach/" + (query.type || "phim-moi");
  if (query.keyword) {
    path = "/v1/api/tim-kiem";
    p.set("keyword", query.keyword);
    p.set("limit", "24");
  }
  if (
    !query.keyword &&
    !query.type &&
    !query.category &&
    !query.country &&
    !query.year &&
    query.sort !== "year"
  )
    path = "/danh-sach/phim-moi-cap-nhat";
  const result = await requestJson(path + "?" + p);
  if (!result.ok) return result;
  try {
    return { ok: true, data: normalizeList(result.data) };
  } catch {
    return fail("UPSTREAM_UNAVAILABLE", "Dữ liệu nguồn phim chưa hợp lệ.");
  }
}
export const getMovie = unstable_cache(
  async (slug: string): Promise<Result<MovieDetail>> => {
    if (!/^[a-z0-9-]{1,200}$/.test(slug))
      return fail("NOT_FOUND", "Không tìm thấy phim.");
    const result = await requestJson("/phim/" + encodeURIComponent(slug));
    if (!result.ok) return result;
    try {
      const movie = normalizeDetail(result.data);
      return movie.slug
        ? { ok: true, data: movie }
        : fail("NOT_FOUND", "Không tìm thấy phim.");
    } catch {
      return fail("UPSTREAM_UNAVAILABLE", "Dữ liệu phim chưa hợp lệ.");
    }
  },
  ["kkphim-movie"],
  { revalidate: 300 },
);
export const getCatalogs = unstable_cache(
  async (): Promise<
    Result<{ genres: CatalogOption[]; countries: CatalogOption[] }>
  > => {
    const [genres, countries] = await Promise.all([
      requestJson("/the-loai"),
      requestJson("/quoc-gia"),
    ]);
    if (!genres.ok) return genres;
    if (!countries.ok) return countries;
    return {
      ok: true,
      data: {
        genres: normalizeCatalog(genres.data),
        countries: normalizeCatalog(countries.data),
      },
    };
  },
  ["kkphim-catalogs"],
  { revalidate: 86400 },
);
