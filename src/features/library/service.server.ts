import "server-only";
import { requireMember } from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { errorResult, type Result } from "@/lib/result";
import type { Page } from "@/features/movies/types";
import type { MovieRef, Playlist } from "./types";
export function toMovieRef(r: Record<string, unknown>): MovieRef {
  return {
    id: String(r.id),
    providerId: String(r.provider_id),
    slug: String(r.slug),
    title: String(r.title),
    posterUrl: typeof r.poster_url === "string" ? r.poster_url : null,
  };
}
export async function getFavorites(
  page: number,
): Promise<Result<Page<MovieRef>>> {
  try {
    const m = await requireMember(),
      c = await createServerSupabase(),
      p = Math.max(1, Math.floor(page) || 1);
    const { data, error, count } = await c
      .from("favorites")
      .select("movie_refs(*)", { count: "exact" })
      .eq("user_id", m.userId)
      .order("created_at", { ascending: false })
      .range((p - 1) * 24, p * 24 - 1);
    if (error) throw error;
    return {
      ok: true,
      data: {
        items: (data || []).map((r) =>
          toMovieRef(r.movie_refs as unknown as Record<string, unknown>),
        ),
        page: p,
        totalPages: Math.max(1, Math.ceil((count || 0) / 24)),
      },
    };
  } catch (e) {
    return errorResult(e);
  }
}
export async function getPlaylists(): Promise<Result<Playlist[]>> {
  try {
    const m = await requireMember(),
      c = await createServerSupabase();
    const { data, error } = await c
      .from("playlists")
      .select("id,name,playlist_items(movie_refs(*))")
      .eq("user_id", m.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return {
      ok: true,
      data: (data || []).map((r) => ({
        id: r.id,
        name: r.name,
        items: (r.playlist_items || []).map((i: { movie_refs: unknown }) =>
          toMovieRef(i.movie_refs as Record<string, unknown>),
        ),
      })),
    };
  } catch (e) {
    return errorResult(e);
  }
}
