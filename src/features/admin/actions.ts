"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { syncAuthRestriction } from "./service.server";
import { errorResult, type Result } from "@/lib/result";
export async function changeUser(input: {
  userId: string;
  status?: "active" | "blocked";
  membership?: "normal" | "vip";
}): Promise<Result<{ authSyncPending: boolean }>> {
  try {
    await requireAdmin();
    const v = z
        .object({
          userId: z.string().uuid(),
          status: z.enum(["active", "blocked"]).optional(),
          membership: z.enum(["normal", "vip"]).optional(),
        })
        .refine((v) => v.status || v.membership)
        .parse(input),
      c = await createServerSupabase();
    const { data, error } = await c.rpc("admin_update_user", {
      p_target: v.userId,
      p_status: v.status || null,
      p_membership: v.membership || null,
    });
    if (error) throw error;
    let pending = Boolean(data.authSyncPending);
    if (pending) {
      const synced = await syncAuthRestriction(v.userId);
      pending = !synced.ok;
    }
    revalidatePath("/admin/nguoi-dung");
    return { ok: true, data: { authSyncPending: pending } };
  } catch (e) {
    return errorResult(e);
  }
}
export async function retryAuthSync(userId: string): Promise<Result<null>> {
  try {
    z.string().uuid().parse(userId);
    const r = await syncAuthRestriction(userId);
    revalidatePath("/admin/nguoi-dung");
    return r;
  } catch (e) {
    return errorResult(e);
  }
}
