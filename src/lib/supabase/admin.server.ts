import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicConfig } from "@/lib/config/public";
import { AppError } from "@/lib/result";
export function getAdminSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !publicConfig.supabaseUrl)
    throw new AppError("CONFIG_MISSING", "Tác vụ máy chủ chưa được cấu hình.");
  return createClient(publicConfig.supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
