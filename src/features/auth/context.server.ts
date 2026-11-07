import "server-only";
import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { isAuthConfigured } from "@/lib/config/public";
import { AppError } from "@/lib/result";
import { assertAccess, type MemberContext } from "./access";
export type { MemberContext } from "./access";
// React cache is render-request scoped; never persist this across users/requests.
const context = cache(async (): Promise<MemberContext> => {
  const client = await createServerSupabase();
  const { data, error } = await client.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string" || !userId)
    throw new AppError("UNAUTHENTICATED", "Vui lòng đăng nhập để tiếp tục.");
  const { data: access, error: dbError } = await client
    .from("user_access")
    .select("role,membership,status")
    .eq("user_id", userId)
    .single();
  if (dbError || !access)
    throw new AppError(
      "FORBIDDEN",
      "Chưa xác minh được quyền tài khoản. Vui lòng thử lại.",
    );
  return assertAccess({
    userId,
    role: access.role,
    membership: access.membership,
    status: access.status,
  });
});
export async function getOptionalMember() {
  if (!isAuthConfigured()) return null;
  try {
    return await context();
  } catch {
    return null;
  }
}
export async function requireMember() {
  return context();
}
export async function requireAdmin() {
  const member = await context();
  return assertAccess({ ...member, status: "active" }, true);
}
