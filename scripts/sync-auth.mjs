import { createClient } from "@supabase/supabase-js";
import { syncSupabaseAuth } from "../src/features/admin/auth-sync.ts";
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.error("Cần cấu hình Supabase trong .env.local.");
  process.exit(1);
}
const c = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(15000) }),
    },
  },
);
const { data: jobs, error } = await c
  .from("auth_sync_jobs")
  .select("user_id")
  .eq("pending", true);
if (error) {
  console.error("Không đọc được hàng đợi Auth.");
  process.exit(1);
}
let failed = 0;
for (const job of jobs) {
  try {
    if (!(await syncSupabaseAuth(c, job.user_id))) failed++;
  } catch {
    failed++;
  }
}
console.log(
  `Đã xử lý ${jobs.length} tác vụ; ${failed} tác vụ cần thử lại (lease lỗi hết hạn sau 2 phút).`,
);
if (failed) process.exitCode = 1;
