import { beforeEach, expect, it, vi } from "vitest";
import { GET } from "@/app/api/search-suggestions/route";
import { listMovies } from "@/features/movies/client.server";

vi.mock("@/features/movies/client.server", () => ({ listMovies: vi.fn() }));

const search = vi.mocked(listMovies);

beforeEach(() => search.mockReset());

it("does not query the provider for a one-character or whitespace search", async () => {
  for (const keyword of [" a ", "   "]) {
    const response = await GET(
      new Request("http://localhost/api/search-suggestions?keyword=" + encodeURIComponent(keyword)),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [] });
  }
  expect(search).not.toHaveBeenCalled();
});

it("returns only five lightweight suggestions for a trimmed keyword", async () => {
  search.mockResolvedValue({
    ok: true,
    data: {
      page: 1,
      totalPages: 1,
      items: Array.from({ length: 6 }, (_, i) => ({
        id: String(i),
        slug: "phim-" + i,
        title: "Phim " + i,
        originalTitle: null,
        posterUrl: null,
        thumbUrl: null,
        year: 2026,
        quality: "HD",
        language: null,
      })),
    },
  });

  const response = await GET(
    new Request("http://localhost/api/search-suggestions?keyword=%20phim%20"),
  );
  const body = await response.json();
  expect(response.status).toBe(200);
  expect(search).toHaveBeenCalledWith({ page: 1, keyword: "phim" });
  expect(body.items).toHaveLength(5);
  expect(body.items[0]).toEqual({
    slug: "phim-0",
    title: "Phim 0",
    posterUrl: null,
    year: 2026,
    quality: "HD",
  });
});

it("reports provider failures without exposing a broken dropdown payload", async () => {
  search.mockResolvedValue({
    ok: false,
    code: "UPSTREAM_UNAVAILABLE",
    message: "Nguồn phim phản hồi chậm.",
  });

  const response = await GET(
    new Request("http://localhost/api/search-suggestions?keyword=batman"),
  );
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    items: [],
    error: "Nguồn phim phản hồi chậm.",
  });
});
