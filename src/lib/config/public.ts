export function getPublicConfig(env: Partial<NodeJS.ProcessEnv>) {
  return {
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL || null,
    supabasePublishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || null,
  };
}
export const publicConfig = getPublicConfig({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
export const isAuthConfigured = () =>
  Boolean(publicConfig.supabaseUrl && publicConfig.supabasePublishableKey);
