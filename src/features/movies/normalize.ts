import type { MovieSummary, MovieDetail, Page, CatalogOption } from "./types";
import { safeMediaUrl } from "./media-policy";
type Row = Record<string, unknown>;
const obj = (v: unknown): Row =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Row) : {};
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const text = (v: unknown): string => (typeof v === "string" ? v : "");
export function normalizeCatalog(input: unknown): CatalogOption[] {
  const root = obj(input),
    items = Array.isArray(input) ? input : obj(root.data).items || root.items;
  return arr(items)
    .filter((v) => text(obj(v).slug) && text(obj(v).name))
    .map((v) => ({ slug: text(obj(v).slug), name: text(obj(v).name) }));
}
const num = (v: unknown, fallback: number) =>
  Number.isFinite(Number(v)) ? Number(v) : fallback;
function image(v: unknown, base?: string) {
  const s = text(v);
  if (!s) return null;
  return safeMediaUrl(
    s.startsWith("https://")
      ? s
      : base
        ? base.replace(/\/$/, "") + "/" + s.replace(/^\//, "")
        : s,
    "image",
  );
}
function summary(v: unknown, base?: string): MovieSummary {
  const r = obj(v);
  return {
    id: text(r._id) || text(r.slug),
    slug: text(r.slug),
    title: text(r.name) || "Chưa có tên phim",
    originalTitle: text(r.origin_name) || null,
    posterUrl: image(r.poster_url, base),
    thumbUrl: image(r.thumb_url, base),
    year: num(r.year, 0) || null,
    quality: text(r.quality) || null,
    language: text(r.lang) || null,
  };
}
export function normalizeList(
  input: unknown,
  imageBase?: string,
): Page<MovieSummary> {
  const root = obj(input),
    data = root.data ? obj(root.data) : root,
    p = obj(obj(data.params).pagination || data.pagination),
    base = text(data.APP_DOMAIN_CDN_IMAGE) || text(root.pathImage) || imageBase;
  return {
    items: arr(data.items)
      .filter((v) => text(obj(v).slug))
      .map((v) => summary(v, base)),
    page: Math.max(1, num(p.currentPage, 1)),
    totalPages: Math.max(
      1,
      num(
        p.totalPages,
        Math.ceil(
          num(p.totalItems, 0) / Math.max(1, num(p.totalItemsPerPage, 24)),
        ),
      ),
    ),
  };
}
export function normalizeDetail(input: unknown): MovieDetail {
  const root = obj(input),
    data = root.data ? obj(root.data) : root,
    m = obj(data.movie || data.item || data),
    base = text(data.APP_DOMAIN_CDN_IMAGE) || undefined;
  const description = text(m.content)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return {
    ...summary(m, base),
    description,
    genres: arr(m.category).map((v) => text(obj(v).name)),
    countries: arr(m.country).map((v) => text(obj(v).name)),
    actors: arr(m.actor).map(text),
    director: arr(m.director).map(text),
    duration: text(m.time) || null,
    status: text(m.episode_current) || null,
    servers: arr(data.episodes || m.episodes).map((v, i) => {
      const s = obj(v),
        label = text(s.server_name) || `Nguồn ${i + 1}`;
      return {
        key: encodeURIComponent(label),
        label,
        episodes: arr(s.server_data).map((v, j) => {
          const e = obj(v),
            slug = text(e.slug) || text(e.filename) || `episode-${j + 1}`;
          return {
            key: slug,
            slug,
            label: text(e.name) || slug,
            hlsUrl: safeMediaUrl(e.link_m3u8, "hls"),
            embedUrl: safeMediaUrl(e.link_embed, "embed"),
          };
        }),
      };
    }),
  };
}
