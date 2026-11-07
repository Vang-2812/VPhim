"use server";
import { z } from "zod";
import { requireMember } from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMovie } from "@/features/movies/client.server";
import { ensureMovieRef } from "@/features/library/movie-ref.server";
import { selectPlayback } from "./selection";
import { errorResult, fail, type Result } from "@/lib/result";
import { revalidatePath } from "next/cache";
export async function beginWatch(input: {
  slug: string;
  episodeKey: string;
  serverKey: string;
  sessionId: string;
}): Promise<
  Result<{
    sessionId: string;
    position: number | null;
    duration: number | null;
    completed: boolean;
  }>
> {
  try {
    await requireMember();
    z.string().uuid().parse(input.sessionId);
    const movie = await getMovie(input.slug);
    if (!movie.ok) return movie;
    const s = selectPlayback(movie.data, input);
    if (!s.ok) return s;
    const ref = await ensureMovieRef(movie.data),
      c = await createServerSupabase();
    const { data, error } = await c.rpc("begin_watch", {
      p_movie_ref: ref.id,
      p_episode_key: s.data.episode.key,
      p_server_key: s.data.server.key,
      p_session: input.sessionId,
    });
    if (error) throw error;
    return { ok: true, data };
  } catch (e) {
    return errorResult(e);
  }
}
export async function saveProgress(input: {
  sessionId: string;
  sequence: number;
  position: number | null;
  duration: number | null;
  completed: boolean;
}): Promise<Result<{ accepted: boolean }>> {
  try {
    await requireMember();
    const value = z
      .object({
        sessionId: z.string().uuid(),
        sequence: z.number().int().positive().safe(),
        position: z.number().finite().nonnegative().nullable(),
        duration: z.number().finite().positive().nullable(),
        completed: z.boolean(),
      })
      .parse(input);
    if (
      (value.position === null) !== (value.duration === null) ||
      (value.position !== null &&
        value.duration !== null &&
        value.position > value.duration)
    )
      return fail("VALIDATION", "Tiến độ không hợp lệ.");
    const c = await createServerSupabase();
    const { data, error } = await c.rpc("record_watch", {
      p_session: value.sessionId,
      p_sequence: value.sequence,
      p_position: value.position,
      p_duration: value.duration,
      p_completed: value.completed,
    });
    if (error) throw error;
    return { ok: true, data };
  } catch (e) {
    return errorResult(e);
  }
}
export async function clearWatchHistory(
  movieRefId: string,
): Promise<Result<null>> {
  try {
    await requireMember();
    z.string().uuid().parse(movieRefId);
    const c = await createServerSupabase(),
      { error } = await c.rpc("clear_watch", { p_movie_ref: movieRefId });
    if (error) throw error;
    revalidatePath("/tai-khoan/xem-tiep");
    return { ok: true, data: null };
  } catch (e) {
    return errorResult(e);
  }
}
