"use server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getServerConfig } from "@/lib/config/server";
import { safeNext } from "./redirect";
import { errorResult, fail, type Result } from "@/lib/result";
import { redirect } from "next/navigation";
function credentials(form: FormData) {
  const email = String(form.get("email") || "").trim(),
    password = String(form.get("password") || "");
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !password ||
    password.length > 1024
  )
    return null;
  return { email, password };
}
export async function signIn(
  form: FormData,
): Promise<Result<{ next: string }>> {
  try {
    const c = credentials(form);
    if (!c) return fail("VALIDATION", "Kiểm tra lại email và mật khẩu.");
    const client = await createServerSupabase();
    const { error } = await client.auth.signInWithPassword(c);
    if (error)
      return fail(
        "UNAUTHENTICATED",
        "Không đăng nhập được. Kiểm tra thông tin hoặc xác nhận email.",
      );
    return { ok: true, data: { next: safeNext(form.get("next")) } };
  } catch (e) {
    return errorResult(e);
  }
}
export async function signUp(
  form: FormData,
): Promise<Result<{ verificationRequired: true }>> {
  try {
    const c = credentials(form);
    if (!c || c.password.length < 8)
      return fail(
        "VALIDATION",
        "Nhập email hợp lệ và mật khẩu ít nhất 8 ký tự.",
      );
    const client = await createServerSupabase();
    const origin = getServerConfig(process.env).appOrigin;
    const { error } = await client.auth.signUp({
      ...c,
      options: {
        emailRedirectTo: origin + "/auth/callback",
        data: {
          display_name:
            String(form.get("displayName") || "")
              .trim()
              .slice(0, 80) || "Người xem",
        },
      },
    });
    if (error)
      return fail(
        "SAVE_FAILED",
        "Chưa đăng ký được. Thử lại hoặc dùng đăng nhập Google.",
      );
    return { ok: true, data: { verificationRequired: true } };
  } catch (e) {
    return errorResult(e);
  }
}
export async function requestPasswordReset(
  form: FormData,
): Promise<Result<null>> {
  try {
    const client = await createServerSupabase();
    const email = String(form.get("email") || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return fail("VALIDATION", "Vui lòng nhập email hợp lệ.");
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo:
        getServerConfig(process.env).appOrigin +
        "/auth/callback?next=/dat-lai-mat-khau",
    });
    if (
      error &&
      !["user_not_found", "user_banned", "email_not_confirmed"].includes(
        error.code || "",
      )
    )
      return fail(
        "SAVE_FAILED",
        "Tạm thời chưa gửi được hướng dẫn. Vui lòng thử lại sau.",
      );
    return { ok: true, data: null };
  } catch (e) {
    return errorResult(e);
  }
}
export async function resetPassword(form: FormData): Promise<Result<null>> {
  try {
    const client = await createServerSupabase();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user)
      return fail(
        "UNAUTHENTICATED",
        "Liên kết đã hết hạn. Vui lòng yêu cầu email mới.",
      );
    const password = String(form.get("password") || "");
    if (password.length < 8 || password.length > 1024)
      return fail("VALIDATION", "Mật khẩu phải có ít nhất 8 ký tự.");
    const { error } = await client.auth.updateUser({ password });
    if (error)
      return fail(
        "SAVE_FAILED",
        "Chưa đổi được mật khẩu. Yêu cầu liên kết mới và thử lại.",
      );
    await client.auth.signOut({ scope: "local" });
    return { ok: true, data: null };
  } catch (e) {
    return errorResult(e);
  }
}
export async function signOut() {
  try {
    const client = await createServerSupabase();
    await client.auth.signOut({ scope: "local" });
  } catch {
    /* No configured session to clear. */
  }
  redirect("/");
}
