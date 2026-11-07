import "server-only";
import {
  getOptionalMember,
  requireMember,
} from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { errorResult, type Result } from "@/lib/result";
import type { Page } from "@/features/movies/types";
import { toMovieRef } from "@/features/library/service.server";
import type { MovieRef } from "@/features/library/types";
import { getMovie } from "@/features/movies/client.server";
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
    const resumes = data || [];
    const byEpisode = new Map<
      string,
      { position: number | null; duration: number | null; completed: boolean }
    >();
    if (resumes.length) {
      // Bound both dimensions: <=12 movie IDs x <=12 episode keys, never an
      // unbounded history. Explicit quoted literals handle filename punctuation
      // that the installed SDK's .in() does not escape (quotes/backslashes).
      const episodeKeys = [
        ...new Set(resumes.map((r) => String(r.episode_key))),
      ];
      const literals = episodeKeys.map(
        (key) => '"' + key.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"',
      );
      const { data: progressRows, error: progressError } = await c
        .from("watch_progress")
        .select("movie_ref_id,episode_key,position,duration,completed")
        .eq("user_id", m.userId)
        .in(
          "movie_ref_id",
          resumes.map((r) => r.movie_ref_id),
        )
        .filter("episode_key", "in", "(" + literals.join(",") + ")");
      if (progressError) throw progressError;
      for (const progress of progressRows || [])
        byEpisode.set(
          JSON.stringify([progress.movie_ref_id, progress.episode_key]),
          progress,
        );
    }
    const items = resumes.map((r) => {
      const progress = byEpisode.get(
        JSON.stringify([r.movie_ref_id, r.episode_key]),
      );
      return {
        movie: toMovieRef(r.movie_refs),
        episodeKey: r.episode_key,
        serverKey: r.server_key,
        position: progress?.position ?? null,
        duration: progress?.duration ?? null,
        completed: progress?.completed ?? false,
      };
    });
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
    const movie = await getMovie(slug);
    if (!movie.ok) return movie;
    const c = await createServerSupabase();
    const { data, error } = await c
      .from("watch_resume")
      .select("episode_key,server_key,movie_refs!inner(slug)")
      .eq("user_id", m.userId)
      .eq("movie_refs.slug", slug)
      .eq("movie_refs.provider_id", movie.data.id)
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
