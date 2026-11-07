const imageHosts = [
  "phimimg.com",
  "phimapi.com",
  "img.phimapi.com",
  "image.tmdb.org",
  "phim.nguonc.com",
  "phimimg.net",
  "phimapi.net",
];
const hlsHosts = [
  "cdn-player.com",
  "kkphimplayer.com",
  "phimapi.com",
  "kkphim.com",
  "phim1280.tv",
  "vphimmoi.com",
  "phimapi.net",
  "kvp726.com",
];
export function safeMediaUrl(
  value: unknown,
  kind: "image" | "hls" | "embed",
): string | null {
  if (typeof value !== "string" || !value.startsWith("https://")) return null;
  try {
    const u = new URL(value);
    if (u.username || u.password || u.port) return null;
    const hosts =
      kind === "image"
        ? imageHosts
        : kind === "embed"
          ? ["player.phimapi.com", "player.kkphim.com"]
          : hlsHosts;
    return hosts.some(
      (h) =>
        u.hostname === h || (kind !== "embed" && u.hostname.endsWith("." + h)),
    )
      ? u.href
      : null;
  } catch {
    return null;
  }
}
