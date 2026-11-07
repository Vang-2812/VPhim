import "server-only";
import { getOptionalMember, requireMember } from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { errorResult, type Result } from "@/lib/result";
import type { Page } from "@/features/movies/types";
import { toMovieRef } from "@/features/library/service.server";
import type { MovieRef } from "@/features/library/types";
export interface ContinueItem {
  movie: MovieRef;
  episodeKey: string;
  serverKey: string;
  position: number | null;
  duration: number | null;
  completed: boolean;
}
export async function getContinueWatching(
  page: number,
): Promise<Result<Page<ContinueItem>>> {
  try {
    const m = await requireMember(),
      c = await createServerSupabase(),
      p = Math.max(1, Math.floor(page) || 1);
    const { data, error, count } = await c
      .from("watch_resume")
      .select("*,movie_refs(*)", { count: "exact" })
      .eq("user_id", m.userId)
      .order("updated_at", { ascending: false })
      .range((p - 1) * 12, p * 12 - 1);
    if (error) throw error;
    const items = await Promise.all(
      (data || []).map(async (r) => {
        const { data: progress } = await c
          .from("watch_progress")
          .select("position,duration,completed")
          .eq("user_id", m.userId)
          .eq("movie_ref_id", r.movie_ref_id)
          .eq("episode_key", r.episode_key)
          .maybeSingle();
        return {
          movie: toMovieRef(r.movie_refs),
          episodeKey: r.episode_key,
          serverKey: r.server_key,
          position: progress?.position ?? null,
          duration: progress?.duration ?? null,
          completed: progress?.completed ?? false,
        };
      }),
    );
    return {
      ok: true,
      data: {
        items,
        page: p,
        totalPages: Math.max(1, Math.ceil((count || 0) / 12)),
      },
    };
  } catch (e) {
    return errorResult(e);
  }
}

export async function getMovieResume(
  slug: string,
): Promise<Result<{ episodeKey: string; serverKey: string } | null>> {
  try {
    const m = await getOptionalMember();
    if (!m) return { ok: true, data: null };
    const c = await createServerSupabase();
    const { data: ref } = await c
      .from("movie_refs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!ref) return { ok: true, data: null };
    const { data, error } = await c
      .from("watch_resume")
      .select("episode_key,server_key")
      .eq("user_id", m.userId)
      .eq("movie_ref_id", ref.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: true, data: null };
    return {
      ok: true,
      data: {
        episodeKey: data.episode_key,
        serverKey: data.server_key,
      },
    };
  } catch (e) {
    return errorResult(e);
  }
}
