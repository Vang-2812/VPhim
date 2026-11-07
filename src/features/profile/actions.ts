"use server";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { errorResult, fail, type Result } from "@/lib/result";
import { parseProfile, validateAvatar, type Gender } from "./validation";
import { getProfile, type Profile } from "./service.server";
import { replaceAvatar } from "./avatar-replacement";
export async function updateProfile(input: {
  displayName: string;
  gender: Gender;
}): Promise<Result<Profile>> {
  try {
    const member = await requireMember(),
      value = parseProfile(input),
      c = await createServerSupabase();
    const { data, error } = await c
      .from("profiles")
      .update({
        display_name: value.displayName,
        gender: value.gender,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.userId)
      .select("id")
      .single();
    if (error || !data)
      return fail("SAVE_FAILED", "Không lưu được hồ sơ. Vui lòng thử lại.");
    revalidatePath("/tai-khoan");
    return getProfile();
  } catch (e) {
    return errorResult(e);
  }
}
export async function uploadAvatar(
  form: FormData,
): Promise<Result<{ avatarUrl: string }>> {
  try {
    const member = await requireMember(),
      file = form.get("avatar");
    if (!(file instanceof File) || file.size > 2097152)
      return fail("VALIDATION", "Chọn ảnh JPEG, PNG hoặc WebP tối đa 2 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer()),
      check = validateAvatar(bytes, file.type);
    if (!check.ok) return check;
    const image = await sharp(bytes, { limitInputPixels: 20000000 })
      .rotate()
      .resize(512, 512, { fit: "cover", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const c = await createServerSupabase(),
      { data: old } = await c
        .from("profiles")
        .select("avatar_path")
        .eq("id", member.userId)
        .single();
    const path = await replaceAvatar(old?.avatar_path || null, {
      upload: async () => {
        const key = member.userId + "/" + crypto.randomUUID() + ".webp";
        const { error } = await c.storage
          .from("avatars")
          .upload(key, image, { contentType: "image/webp", upsert: false });
        if (error) throw error;
        return key;
      },
      save: async (path) => {
        const { data, error } = await c
          .from("profiles")
          .update({ avatar_path: path, updated_at: new Date().toISOString() })
          .eq("id", member.userId)
          .select("id")
          .single();
        if (error || !data) throw new Error("Avatar save failed");
      },
      remove: async (path) => {
        const { error } = await c.storage.from("avatars").remove([path]);
        if (error) throw error;
      },
    });
    const signed = await c.storage.from("avatars").createSignedUrl(path, 300);
    if (!signed.data)
      return fail(
        "SAVE_FAILED",
        "Đã lưu ảnh, nhưng chưa tải được bản xem. Hãy tải lại trang.",
      );
    revalidatePath("/tai-khoan");
    return { ok: true, data: { avatarUrl: signed.data.signedUrl } };
  } catch (e) {
    return errorResult(e);
  }
}
