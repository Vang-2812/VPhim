"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicConfig } from "@/lib/config/public";
export function createBrowserSupabase() {
  if (!publicConfig.supabaseUrl || !publicConfig.supabasePublishableKey)
    throw new Error("Supabase chưa được cấu hình.");
  return createBrowserClient(
    publicConfig.supabaseUrl,
    publicConfig.supabasePublishableKey,
  );
}
