import { describe, it, expect } from "vitest";
import {
  normalizeList,
  normalizeDetail,
  normalizeCatalog,
} from "@/features/movies/normalize";
import { safeMediaUrl } from "@/features/movies/media-policy";
describe("KKPhim data boundary", () => {
  it("uses episode IDs instead of array positions and rejects ambiguous duplicate slugs", () => {
    const normalize = (rows: unknown[]) =>
      normalizeDetail({
        movie: { slug: "a", name: "A" },
        episodes: [{ server_name: "vs", server_data: rows }],
      }).servers[0].episodes;
    const a = { _id: "episode-a", name: "A" },
      b = { _id: "episode-b", name: "B" };
    expect(normalize([a, b])[1].key).toBe(normalize([b])[0].key);
    const seasons = normalize([
      { slug: "tap-1", filename: "Season 1 Episode 1" },
      { slug: "tap-1", filename: "Season 2 Episode 1" },
    ]);
    expect(seasons).toHaveLength(2);
    expect(seasons[0].key).not.toBe(seasons[1].key);
    expect(
      normalize([{ slug: "tap-1", filename: "Season 2 Episode 1" }])[0].key,
    ).toBe(seasons[1].key);
    expect(normalize([{ name: "No stable identity" }])).toHaveLength(0);
    expect(normalize([{ slug: "tap-1" }, { slug: "tap-1" }])).toHaveLength(0);
  });
  it("accepts wrapped category and country responses from the live API", () => {
    expect(
      normalizeCatalog({
        status: "success",
        data: { items: [{ slug: "hanh-dong", name: "Hành Động" }] },
      }),
    ).toEqual([{ slug: "hanh-dong", name: "Hành Động" }]);
    expect(normalizeCatalog([{ slug: "viet-nam", name: "Việt Nam" }])).toEqual([
      { slug: "viet-nam", name: "Việt Nam" },
    ]);
  });
  it("normalizes legacy and v1 lists and relative media", () => {
    const row = {
      _id: "film1",
      slug: "phim-a",
      name: "Phim A",
      poster_url: "a.jpg",
      year: 2024,
    };
    expect(
      normalizeList({
        items: [row],
        pathImage: "https://phimimg.com/",
        pagination: { currentPage: 2, totalPages: 4 },
      }),
    ).toMatchObject({
      page: 2,
      totalPages: 4,
      items: [
        {
          id: "film1",
          title: "Phim A",
          posterUrl: "https://phimimg.com/a.jpg",
        },
      ],
    });
    expect(
      normalizeList({
        data: {
          items: [row],
          APP_DOMAIN_CDN_IMAGE: "https://phimimg.com",
          params: {
            pagination: {
              currentPage: 1,
              totalItems: 48,
              totalItemsPerPage: 24,
            },
          },
        },
      }).totalPages,
    ).toBe(2);
  });
  it("keeps absent media and episode data honest", () =>
    expect(
      normalizeDetail({ movie: { _id: "x", slug: "x", name: "X" } }),
    ).toMatchObject({ posterUrl: null, servers: [] }));
  it("rejects injected and non-provider media URLs", () => {
    for (const url of [
      "javascript:alert(1)",
      "https://evil.example/movie.jpg",
      "//evil.test/x",
      "http://phimimg.com/x",
    ])
      expect(safeMediaUrl(url, "image")).toBeNull();
  });
  it("distinguishes seasons and preserves the same episode across servers", () => {
    const movie = normalizeDetail({
      movie: { slug: "a", name: "A" },
      episodes: [
        {
          server_name: "Vietsub",
          server_data: [
            { slug: "s1-tap-1", name: "Tập 1" },
            { slug: "s2-tap-1", name: "Tập 1" },
          ],
        },
        {
          server_name: "Lồng tiếng",
          server_data: [{ slug: "s1-tap-1", name: "Tập 1" }],
        },
      ],
    });
    expect(movie.servers[0].episodes[0].key).not.toBe(
      movie.servers[0].episodes[1].key,
    );
    expect(movie.servers[0].episodes[0].key).toBe(
      movie.servers[1].episodes[0].key,
    );
  });
  it("strips HTML from descriptions rather than running it", () =>
    expect(
      normalizeDetail({
        movie: {
          slug: "x",
          name: "X",
          content: "<p>Nội dung</p><script>alert(1)</script>",
        },
      }).description,
    ).toBe("Nội dung"));

  it("permits dynamic provider CDN domains for HLS streams", () => {
    const validHlsUrls = [
      "https://v7.kkphimplayer7.com/20260622/trJXGtSz/index.m3u8",
      "https://s3.phim1280.tv/20240618/ZBCTUJoB/index.m3u8",
      "https://a.kvp726.com/20261022/Rqe5nHAL/index.m3u8",
      "https://vip.opstream1.org/20241010/film/index.m3u8",
    ];
    for (const url of validHlsUrls) {
      expect(safeMediaUrl(url, "hls")).toBe(url);
    }
  });

  it("extracts direct HLS stream from embedUrl if link_m3u8 is missing", () => {
    const detail = normalizeDetail({
      movie: { slug: "gia-toc-rong", name: "Gia Tộc Rồng" },
      episodes: [
        {
          server_name: "Vietsub",
          server_data: [
            {
              slug: "tap-08",
              name: "Tập 08",
              link_embed:
                "https://player.phimapi.com/player/?url=https://v7.kkphimplayer7.com/20260622/trJXGtSz/index.m3u8",
            },
          ],
        },
      ],
    });
    const ep = detail.servers[0].episodes[0];
    expect(ep.hlsUrl).toBe(
      "https://v7.kkphimplayer7.com/20260622/trJXGtSz/index.m3u8",
    );
  });
});
