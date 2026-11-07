import { it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
const url = process.env.VPHIM_TEST_SUPABASE_URL,
  key = process.env.VPHIM_TEST_SUPABASE_PUBLISHABLE_KEY,
  secret = process.env.VPHIM_TEST_SUPABASE_SERVICE_ROLE_KEY;
it("verifies hosted Auth, ownership and stale blocked sessions on an explicit test project", async () => {
  if (
    !url ||
    !key ||
    !secret ||
    process.env.VPHIM_ALLOW_INTEGRATION_TESTS !== "1"
  )
    throw new Error(
      "Chưa có project TEST riêng. Cấu hình VPHIM_TEST_SUPABASE_URL, VPHIM_TEST_SUPABASE_PUBLISHABLE_KEY, VPHIM_TEST_SUPABASE_SERVICE_ROLE_KEY và VPHIM_ALLOW_INTEGRATION_TESTS=1. Không chạy với production.",
    );
  const admin = createClient(url, secret, { auth: { persistSession: false } }),
    ids: string[] = [];
  let movieId: string | undefined;
  const tag = crypto.randomUUID();
  try {
    const users = [];
    for (const suffix of ["a", "b"]) {
      const email = `vphim-test-${tag}-${suffix}@example.com`,
        password = crypto.randomUUID() + "aA1!";
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      expect(created.error).toBeNull();
      const id = created.data.user!.id;
      ids.push(id);
      const c = createClient(url, key, { auth: { persistSession: false } });
      const logged = await c.auth.signInWithPassword({ email, password });
      expect(logged.error).toBeNull();
      users.push(c);
    }
    const movie = await admin
      .from("movie_refs")
      .insert({
        provider_id: "test-" + tag,
        slug: "test-" + tag,
        title: "Temporary integration fixture",
      })
      .select("id")
      .single();
    expect(movie.error).toBeNull();
    movieId = movie.data!.id;
    expect(
      (
        await users[0]
          .from("favorites")
          .insert({ user_id: ids[0], movie_ref_id: movieId })
      ).error,
    ).toBeNull();
    expect(
      (await users[1].from("favorites").select("*").eq("user_id", ids[0])).data,
    ).toEqual([]);
    expect(
      (
        await users[1]
          .from("favorites")
          .insert({ user_id: ids[0], movie_ref_id: movieId })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await admin
          .from("user_access")
          .update({ status: "blocked" })
          .eq("user_id", ids[0])
      ).error,
    ).toBeNull();
    expect(
      (
        await users[0]
          .from("playlists")
          .insert({ user_id: ids[0], name: "Blocked session" })
      ).error,
    ).not.toBeNull();
    expect(
      (await users[0].rpc("admin_list_users", { p_page: 1 })).error,
    ).not.toBeNull();
  } finally {
    for (const id of ids) await admin.auth.admin.deleteUser(id);
    if (movieId) await admin.from("movie_refs").delete().eq("id", movieId);
  }
});
