export function safeNext(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x1f\x7f]/.test(value)
  )
    return "/";
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\x00-\x1f\x7f]/.test(decoded))
      return "/";
    const u = new URL(value, "https://vphim.local");
    return u.origin === "https://vphim.local"
      ? u.pathname + u.search + u.hash
      : "/";
  } catch {
    return "/";
  }
}
