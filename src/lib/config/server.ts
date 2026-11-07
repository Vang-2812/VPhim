import "server-only";
export function getServerConfig(env: Partial<NodeJS.ProcessEnv>) {
  const origin =
    env.APP_ORIGIN ||
    (env.NODE_ENV === "production" ? "" : "http://localhost:3000");
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new Error("APP_ORIGIN chưa hợp lệ.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("APP_ORIGIN chưa hợp lệ.");
  return {
    appOrigin: url.origin,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || null,
  };
}
