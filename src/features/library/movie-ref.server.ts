import "server-only";
import { requireMember } from "@/features/auth/context.server";
import { getAdminSupabase } from "@/lib/supabase/admin.server";
import type { MovieDetail } from "@/features/movies/types";
import type { MovieRef } from "./types";
import { AppError } from "@/lib/result";
export async function ensureMovieRef(movie: MovieDetail): Promise<MovieRef> {
  await requireMember();
  const c = getAdminSupabase();
  const { data, error } = await c
    .from("movie_refs")
    .upsert(
      {
        provider_id: movie.id,
        slug: movie.slug,
        title: movie.title,
        poster_url: movie.posterUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider_id" },
    )
    .select("*")
    .single();
  if (error || !data)
    throw new AppError("SAVE_FAILED", "Chưa lưu được thông tin phim.");
  return {
    id: data.id,
    providerId: data.provider_id,
    slug: data.slug,
    title: data.title,
    posterUrl: data.poster_url,
  };
}
