"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMovie } from "@/features/movies/client.server";
import { ensureMovieRef } from "./movie-ref.server";
import { errorResult, fail, type Result } from "@/lib/result";
const uuid = z.string().uuid(),
  nameSchema = z.string().trim().min(1).max(80);
export async function setFavorite(
  slug: string,
  selected: boolean,
): Promise<Result<{ selected: boolean }>> {
  try {
    const m = await requireMember(),
      c = await createServerSupabase();
    if (
      typeof selected !== "boolean" ||
      typeof slug !== "string" ||
      slug.length > 200
    )
      return fail("VALIDATION", "Thông tin phim chưa hợp lệ.");
    if (selected) {
      const r = await getMovie(slug);
      if (!r.ok) return r;
      const ref = await ensureMovieRef(r.data);
      const { error } = await c
        .from("favorites")
        .upsert(
          { user_id: m.userId, movie_ref_id: ref.id },
          { onConflict: "user_id,movie_ref_id", ignoreDuplicates: true },
        );
      if (error) throw error;
    } else {
      const { data: ref } = await c
        .from("movie_refs")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (ref) {
        const { error } = await c
          .from("favorites")
          .delete()
          .eq("user_id", m.userId)
          .eq("movie_ref_id", ref.id);
        if (error) throw error;
      }
    }
    revalidatePath("/tai-khoan/yeu-thich");
    return { ok: true, data: { selected } };
  } catch (e) {
    return errorResult(e);
  }
}
export async function createPlaylist(
  name: string,
): Promise<Result<{ id: string; name: string }>> {
  try {
    const m = await requireMember(),
      c = await createServerSupabase();
    const { data, error } = await c
      .from("playlists")
      .insert({ user_id: m.userId, name: nameSchema.parse(name) })
      .select("id,name")
      .single();
    if (error || !data) throw error;
    revalidatePath("/tai-khoan/danh-sach");
    return { ok: true, data };
  } catch (e) {
    return errorResult(e);
  }
}
export async function renamePlaylist(
  id: string,
  name: string,
): Promise<Result<null>> {
  try {
    const m = await requireMember(),
      c = await createServerSupabase();
    const { data, error } = await c
      .from("playlists")
      .update({
        name: nameSchema.parse(name),
        updated_at: new Date().toISOString(),
      })
      .eq("id", uuid.parse(id))
      .eq("user_id", m.userId)
      .select("id")
      .single();
    if (error || !data)
      return fail("FORBIDDEN", "Không cập nhật được danh sách này.");
    revalidatePath("/tai-khoan/danh-sach");
    return { ok: true, data: null };
  } catch (e) {
    return errorResult(e);
  }
}
export async function deletePlaylist(id: string): Promise<Result<null>> {
  try {
    const m = await requireMember(),
      c = await createServerSupabase();
    const { data, error } = await c
      .from("playlists")
      .delete()
      .eq("id", uuid.parse(id))
      .eq("user_id", m.userId)
      .select("id")
      .single();
    if (error || !data)
      return fail("FORBIDDEN", "Không xóa được danh sách này.");
    revalidatePath("/tai-khoan/danh-sach");
    return { ok: true, data: null };
  } catch (e) {
    return errorResult(e);
  }
}
export async function setPlaylistMovie(
  playlistId: string,
  slug: string,
  present: boolean,
): Promise<Result<null>> {
  try {
    await requireMember();
    uuid.parse(playlistId);
    if (typeof present !== "boolean")
      return fail("VALIDATION", "Thao tác chưa hợp lệ.");
    const c = await createServerSupabase();
    let movieId: string | undefined;
    if (present) {
      const r = await getMovie(slug);
      if (!r.ok) return r;
      movieId = (await ensureMovieRef(r.data)).id;
    } else {
      const { data } = await c
        .from("movie_refs")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      movieId = data?.id;
    }
    if (!movieId) return { ok: true, data: null };
    const { error } = present
      ? await c
          .from("playlist_items")
          .upsert(
            { playlist_id: playlistId, movie_ref_id: movieId },
            { onConflict: "playlist_id,movie_ref_id", ignoreDuplicates: true },
          )
      : await c
          .from("playlist_items")
          .delete()
          .eq("playlist_id", playlistId)
          .eq("movie_ref_id", movieId);
    if (error) throw error;
    revalidatePath("/tai-khoan/danh-sach");
    return { ok: true, data: null };
  } catch (e) {
    return errorResult(e);
  }
}
export async function getLibraryState(slug: string) {
  try {
    const m = await requireMember(),
      c = await createServerSupabase();
    const movie = await getMovie(slug);
    if (!movie.ok) return movie;
    const [favorite, lists] = await Promise.all([
      c
        .from("favorites")
        .select("movie_ref_id,movie_refs!inner(slug)")
        .eq("user_id", m.userId)
        .eq("movie_refs.slug", slug)
        .eq("movie_refs.provider_id", movie.data.id)
        .maybeSingle(),
      c
        .from("playlists")
        .select("id,name")
        .eq("user_id", m.userId)
        .order("created_at", { ascending: false }),
    ]);
    if (favorite.error) throw favorite.error;
    if (lists.error) throw lists.error;
    return {
      ok: true as const,
      data: {
        selected: Boolean(favorite.data),
        playlists: (lists.data || []).map((p) => ({ id: p.id, name: p.name })),
      },
    };
  } catch (e) {
    return errorResult(e);
  }
}
