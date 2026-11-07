import { createClient } from "@supabase/supabase-js";
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
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const { data: jobs, error } = await c
  .from("auth_sync_jobs")
  .select("user_id,status,revision");
if (error) {
  console.error("Không đọc được hàng đợi Auth.");
  process.exit(1);
}
let failed = 0;
for (const job of jobs) {
  const { error } = await c.auth.admin.updateUserById(job.user_id, {
    ban_duration: job.status === "blocked" ? "876000h" : "none",
  });
  if (error) {
    failed++;
    continue;
  }
  await c
    .from("auth_sync_jobs")
    .delete()
    .eq("user_id", job.user_id)
    .eq("revision", job.revision);
}
console.log(`Đã xử lý ${jobs.length} tác vụ; ${failed} tác vụ cần thử lại.`);
if (failed) process.exitCode = 1;
