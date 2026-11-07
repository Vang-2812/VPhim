import type { BrowseQuery } from "./types";
export const movieTypes = [
  ["phim-le", "Phim lẻ"],
  ["phim-bo", "Phim bộ"],
  ["hoat-hinh", "Hoạt hình"],
  ["tv-shows", "TV shows"],
] as const;
export function parseBrowseQuery(p: URLSearchParams): BrowseQuery {
  const raw = Number(p.get("page")),
    year = Number(p.get("year")),
    slug = (key: string) => {
      const v = p.get(key) || "";
      return /^[a-z0-9-]{1,80}$/.test(v) ? v : undefined;
    };
  return {
    page: Number.isSafeInteger(raw) && raw > 0 ? Math.min(raw, 10000) : 1,
    keyword: p.get("keyword")?.trim().slice(0, 120) || undefined,
    type: movieTypes.some(([key]) => key === p.get("type"))
      ? p.get("type")!
      : undefined,
    category: slug("category"),
    country: slug("country"),
    year: year >= 1900 && year <= 2100 ? Math.floor(year) : undefined,
    sort: p.get("sort") === "year" ? "year" : "updated",
  };
}
export function changeBrowseQuery(current: string, key: string, value: string) {
  const p = new URLSearchParams(current);
  if (value) p.set(key, value);
  else p.delete(key);
  p.set("page", "1");
  return p.toString();
}
