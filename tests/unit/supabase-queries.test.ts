// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
const boundary = vi.hoisted(() => ({
  client: null as SupabaseClient | null,
  member: { userId: "user-a", role: "member", membership: "normal" } as {
    userId: string;
    role: string;
    membership: string;
  } | null,
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => boundary.client,
}));
vi.mock("@/features/auth/context.server", () => ({
  getOptionalMember: async () => boundary.member,
  requireMember: async () => {
    if (!boundary.member) throw new Error("Guest");
    return boundary.member;
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));
vi.mock("@/features/movies/client.server", () => ({
  getMovie: async () => ({ ok: true, data: { id: "p-current", slug: "a" } }),
}));
import {
  getMovieResume,
  getContinueWatching,
} from "@/features/playback/progress.server";
import { getLibraryState } from "@/features/library/actions";
let requests: URL[];
let rows: Record<string, unknown>[];
let progresses: Record<string, unknown>[];
let failure: string | null;
beforeEach(() => {
  requests = [];
  failure = null;
  boundary.member = { userId: "user-a", role: "member", membership: "normal" };
  rows = [
    {
      movie_ref_id: "m-a",
      episode_key: "tap-2",
      server_key: "vietsub",
      movie_refs: {
        id: "m-a",
        provider_id: "p-a",
        slug: "a",
        title: "A",
        poster_url: null,
      },
    },
  ];
  progresses = [];
  boundary.client = createClient("https://project.supabase.co", "public-test", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input) => {
        const url = new URL(String(input));
        requests.push(url);
        const table = url.pathname.split("/").at(-1);
        if (table === failure)
          return new Response(
            JSON.stringify({ message: "Unavailable", code: "XX000" }),
            { status: 500 },
          );
        const data =
          table === "movie_refs"
            ? [{ id: "m-a" }]
            : table === "watch_resume"
              ? rows
              : table === "watch_progress"
                ? progresses
                : table === "favorites"
                  ? [{ movie_ref_id: "m-a" }]
                  : table === "playlists"
                    ? [{ id: "list-a", name: "Watch later" }]
                    : [];
        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "Content-Range": `0-${Math.max(0, data.length - 1)}/${data.length}`,
          },
        });
      },
    },
  });
});
it("loads a movie resume in one owner-scoped joined query", async () => {
  expect(await getMovieResume("a")).toEqual({
    ok: true,
    data: { episodeKey: "tap-2", serverKey: "vietsub" },
  });
  expect(requests).toHaveLength(1);
  expect(requests[0].searchParams.get("user_id")).toBe("eq.user-a");
  expect(requests[0].searchParams.get("movie_refs.slug")).toBe("eq.a");
  expect(requests[0].searchParams.get("select")).toContain("!inner");
});
it("does not query resume for a guest", async () => {
  boundary.member = null;
  expect(await getMovieResume("a")).toEqual({ ok: true, data: null });
  expect(requests).toHaveLength(0);
});
it("does not reuse a different provider movie saved under the same slug", async () => {
  const transport = vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = new URL(String(input));
    requests.push(url);
    const hasIdentity =
      url.searchParams.get("movie_refs.provider_id") === "eq.p-current";
    const table = url.pathname.split("/").at(-1);
    const data =
      table === "playlists"
        ? []
        : hasIdentity
          ? []
          : table === "watch_resume"
            ? rows
            : [{ movie_ref_id: "m-old" }];
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  });
  boundary.client = createClient("https://project.supabase.co", "public-test", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: transport },
  });
  expect(await getMovieResume("a")).toEqual({ ok: true, data: null });
  expect(await getLibraryState("a")).toEqual({
    ok: true,
    data: { selected: false, playlists: [] },
  });
});
it("does not turn duplicate slug matches or query errors into a false resume", async () => {
  rows = [rows[0], { ...rows[0], movie_ref_id: "m-b" }];
  expect((await getMovieResume("a")).ok).toBe(false);
});
it("loads favorite and playlist summaries using only two queries", async () => {
  expect(await getLibraryState("a")).toEqual({
    ok: true,
    data: {
      selected: true,
      playlists: [{ id: "list-a", name: "Watch later" }],
    },
  });
  expect(requests).toHaveLength(2);
  const playlist = requests.find((r) => r.pathname.endsWith("/playlists"))!;
  expect(playlist.searchParams.get("select")).toBe("id,name");
  expect(
    requests.every((r) => r.searchParams.get("user_id") === "eq.user-a"),
  ).toBe(true);
});
it("batches twelve progress reads and matches exact movie/episode pairs", async () => {
  rows = Array.from({ length: 12 }, (_, i) => ({
    ...rows[0],
    movie_ref_id: "m-" + i,
    episode_key: i === 0 ? 'Tập "(1), A"' : "tap-" + i,
    movie_refs: {
      id: "m-" + i,
      provider_id: "p-" + i,
      slug: "film-" + i,
      title: "Film " + i,
      poster_url: null,
    },
  }));
  progresses = [
    {
      movie_ref_id: "m-0",
      episode_key: 'Tập "(1), A"',
      position: 120,
      duration: 900,
      completed: false,
    },
    {
      movie_ref_id: "m-0",
      episode_key: "tap-1",
      position: 800,
      duration: 900,
      completed: true,
    },
    {
      movie_ref_id: "m-1",
      episode_key: "tap-1",
      position: 300,
      duration: 900,
      completed: false,
    },
  ];
  const result = await getContinueWatching(1);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.data.items.slice(0, 3).map((i) => i.position)).toEqual([
    120,
    300,
    null,
  ]);
  expect(requests).toHaveLength(2);
  const batch = requests[1];
  expect(batch.searchParams.get("user_id")).toBe("eq.user-a");
  expect(batch.searchParams.get("movie_ref_id")).toMatch(/^in\./);
  expect(batch.searchParams.get("episode_key")).toMatch(/^in\./);
  expect(batch.searchParams.get("episode_key")).toContain('"Tập \\"(1), A\\""');
});
it("returns a real error when the progress batch fails", async () => {
  failure = "watch_progress";
  expect((await getContinueWatching(1)).ok).toBe(false);
});
it("skips the progress query when there is no history", async () => {
  rows = [];
  expect(await getContinueWatching(1)).toEqual({
    ok: true,
    data: { items: [], page: 1, totalPages: 1 },
  });
  expect(requests).toHaveLength(1);
});
