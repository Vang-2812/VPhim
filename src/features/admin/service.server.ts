import "server-only";
import { requireAdmin } from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin.server";
import { errorResult, fail, type Result } from "@/lib/result";
import { processAuthJob } from "./auth-sync";
import type { Page } from "@/features/movies/types";
import type { AdminUserRow } from "./types";
export async function listUsers(input: {
  search?: string;
  membership?: "normal" | "vip";
  status?: "active" | "blocked";
  page: number;
}): Promise<Result<Page<AdminUserRow>>> {
  try {
    await requireAdmin();
    const c = await createServerSupabase();
    const { data, error } = await c.rpc("admin_list_users", {
      p_search: (input.search || "").slice(0, 100),
      p_membership: ["normal", "vip"].includes(input.membership || "")
        ? input.membership
        : null,
      p_status: ["active", "blocked"].includes(input.status || "")
        ? input.status
        : null,
      p_page: Math.max(1, Math.floor(input.page) || 1),
    });
    if (error) throw error;
    return { ok: true, data };
  } catch (e) {
    return errorResult(e);
  }
}
export async function syncAuthRestriction(
  userId: string,
): Promise<Result<null>> {
  try {
    await requireAdmin();
    const c = getAdminSupabase();
    const completed = await processAuthJob({
      get: async () => {
        const { data, error } = await c
          .from("auth_sync_jobs")
          .select("status,revision")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      apply: async (status) => {
        const { error } = await c.auth.admin.updateUserById(userId, {
          ban_duration: status === "blocked" ? "876000h" : "none",
        });
        if (error) throw error;
      },
      complete: async (revision) => {
        const { data, error } = await c
          .from("auth_sync_jobs")
          .delete()
          .eq("user_id", userId)
          .eq("revision", revision)
          .select("user_id");
        if (error) throw error;
        return Boolean(data?.length);
      },
    });
    if (!completed)
      return fail(
        "SAVE_FAILED",
        "Trạng thái đã thay đổi trong lúc đồng bộ. Vui lòng thử lại.",
      );
    return { ok: true, data: null };
  } catch (e) {
    return errorResult(e);
  }
}
