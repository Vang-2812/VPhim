// Opt-in server diagnostics. Never include URL/query, headers, payload or errors.
export function createTimedFetch(
  scope: "server" | "proxy",
  transport: typeof fetch = fetch,
): typeof fetch {
  return async (input, init) => {
    if (process.env.SUPABASE_TIMING !== "1") return transport(input, init);
    const started = performance.now();
    let status = 0;
    let endpoint = "other";
    const request = input instanceof Request ? input : null;
    try {
      const path = new URL(request?.url || String(input)).pathname;
      endpoint =
        path === "/auth/v1/user"
          ? "auth-user"
          : path === "/auth/v1/token"
            ? "auth-token"
            : path.endsWith("/.well-known/jwks.json")
              ? "jwks"
              : path.startsWith("/rest/v1/")
                ? "rest"
                : path.startsWith("/storage/v1/")
                  ? "storage"
                  : "other";
    } catch {
      /* Retain generic class for nonstandard input. */
    }
    try {
      const response = await transport(input, init);
      status = response.status;
      return response;
    } finally {
      console.info("[supabase-timing]", {
        scope,
        endpoint,
        method: init?.method || request?.method || "GET",
        status,
        durationMs: Math.round(performance.now() - started),
      });
    }
  };
}
