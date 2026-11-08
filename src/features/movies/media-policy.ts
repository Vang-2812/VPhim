const imageHosts = [
  "phimimg.com",
  "phimapi.com",
  "img.phimapi.com",
  "image.tmdb.org",
  "phim.nguonc.com",
  "phimimg.net",
  "phimapi.net",
];

const hlsPatterns = [
  /^([a-z0-9-]+\.)?cdn-player\d*\.com$/i,
  /^([a-z0-9-]+\.)?kkphimplayer\d*\.com$/i,
  /^([a-z0-9-]+\.)?phimapi\.(com|net)$/i,
  /^([a-z0-9-]+\.)?kkphim\.com$/i,
  /^([a-z0-9-]+\.)?phim128\d*\.(tv|com|net)$/i,
  /^([a-z0-9-]+\.)?vphimmoi\.com$/i,
  /^([a-z0-9-]+\.)?kvp\d*\.com$/i,
  /^([a-z0-9-]+\.)?opstream\d*\.(com|org|net)$/i,
];

const embedPatterns = [
  /^player\.(phimapi|kkphim)\.(com|net)$/i,
];

export function safeMediaUrl(
  value: unknown,
  kind: "image" | "hls" | "embed",
): string | null {
  if (typeof value !== "string" || !value.startsWith("https://")) return null;
  try {
    const u = new URL(value);
    if (u.username || u.password || u.port) return null;

    if (kind === "image") {
      const match = imageHosts.some(
        (h) => u.hostname === h || u.hostname.endsWith("." + h),
      );
      return match ? u.href : null;
    }

    if (kind === "embed") {
      const match = embedPatterns.some((pattern) => pattern.test(u.hostname));
      return match ? u.href : null;
    }

    // kind === "hls"
    const match = hlsPatterns.some((pattern) => pattern.test(u.hostname));
    return match ? u.href : null;
  } catch {
    return null;
  }
}
