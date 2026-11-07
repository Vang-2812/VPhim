import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { isAuthConfigured } from "@/lib/config/public";
import { AppError } from "@/lib/result";
import { assertAccess, type MemberContext } from "./access";
export type { MemberContext } from "./access";
async function context(admin = false): Promise<MemberContext> {
  const client = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user)
    throw new AppError("UNAUTHENTICATED", "Vui lòng đăng nhập để tiếp tục.");
  const { data, error: dbError } = await client
    .from("user_access")
    .select("role,membership,status")
    .eq("user_id", user.id)
    .single();
  if (dbError || !data)
    throw new AppError(
      "FORBIDDEN",
      "Chưa xác minh được quyền tài khoản. Vui lòng thử lại.",
    );
  return assertAccess(
    {
      userId: user.id,
      role: data.role,
      membership: data.membership,
      status: data.status,
    },
    admin,
  );
}
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
  return context(true);
}
