import "server-only";
import { requireMember } from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { errorResult, type Result } from "@/lib/result";
import type { Gender } from "./validation";
export interface Profile {
  userId: string;
  email: string;
  displayName: string;
  gender: Gender;
  avatarUrl: string | null;
}
export async function getProfile(): Promise<Result<Profile>> {
  try {
    const m = await requireMember(),
      c = await createServerSupabase();
    const [
      { data, error },
      {
        data: { user },
      },
    ] = await Promise.all([
      c.from("profiles").select("*").eq("id", m.userId).single(),
      c.auth.getUser(),
    ]);
    if (error || !data) throw error;
    let avatarUrl: null | string = null;
    if (data.avatar_path) {
      const r = await c.storage
        .from("avatars")
        .createSignedUrl(data.avatar_path, 300);
      avatarUrl = r.data?.signedUrl || null;
    }
    return {
      ok: true,
      data: {
        userId: m.userId,
        email: user?.email || "",
        displayName: data.display_name,
        gender: data.gender,
        avatarUrl,
      },
    };
  } catch (e) {
    return errorResult(e);
  }
}
