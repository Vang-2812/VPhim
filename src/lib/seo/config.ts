export function getSiteOrigin(): string {
  const envOrigin =
    process.env.APP_ORIGIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? "https://vphim.vn" : "http://localhost:3000");

  try {
    const url = new URL(envOrigin);
    return url.origin;
  } catch {
    return "https://vphim.vn";
  }
}

export function cleanDescription(raw?: string | null, maxLength = 160): string {
  if (!raw) {
    return "Xem phim online chất lượng cao, cập nhật nhanh chóng với phụ đề Vietsub và Thuyết minh chuẩn trên VPhim.";
  }

  // Strip HTML tags and entities
  const text = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;

  // Cut cleanly at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }
  return truncated + "...";
}

export function buildMovieTitle(movie: {
  title: string;
  year?: number | null;
  originalTitle?: string | null;
}): string {
  const yearPart = movie.year ? ` (${movie.year})` : "";
  return `${movie.title}${yearPart} - Vietsub / Thuyết minh Full HD | VPhim`;
}
