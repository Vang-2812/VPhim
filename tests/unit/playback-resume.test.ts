import { describe, it, expect, vi } from "vitest";
import { selectPlayback } from "@/features/playback/selection";
import type { MovieDetail } from "@/features/movies/types";
import { getMovieResume } from "@/features/playback/progress.server";

const mockMovie: MovieDetail = {
  id: "test-movie-id",
  slug: "test-slug",
  title: "Test Movie",
  originalTitle: "Test Movie Original",
  description: "Test description",
  posterUrl: "https://phimimg.com/poster.jpg",
  thumbUrl: "https://phimimg.com/thumb.jpg",
  year: 2024,
  quality: "HD",
  duration: "45 phút",
  language: "Vietsub",
  status: "completed",
  director: ["Director A"],
  actors: ["Actor A"],
  genres: ["Hành Động"],
  countries: ["Việt Nam"],
  servers: [
    {
      key: "Vietsub",
      label: "Vietsub",
      episodes: [
        {
          key: "tap-01",
          label: "Tập 01",
          hlsUrl: "https://example.com/tap1.m3u8",
          embedUrl: "https://example.com/tap1.html",
        },
        {
          key: "tap-02",
          label: "Tập 02",
          hlsUrl: "https://example.com/tap2.m3u8",
          embedUrl: "https://example.com/tap2.html",
        },
        {
          key: "tap-03",
          label: "Tập 03",
          hlsUrl: "https://example.com/tap3.m3u8",
          embedUrl: "https://example.com/tap3.html",
        },
      ],
    },
  ],
};

describe("Playback resume selection", () => {
  it("defaults to episode 0 when no resume or request specified", () => {
    const s = selectPlayback(mockMovie, {});
    expect(s.ok).toBe(true);
    if (s.ok) {
      expect(s.data.episode.key).toBe("tap-01");
    }
  });

  it("selects resumed episode when specified in requested", () => {
    const s = selectPlayback(mockMovie, {
      serverKey: "Vietsub",
      episodeKey: "tap-02",
    });
    expect(s.ok).toBe(true);
    if (s.ok) {
      expect(s.data.episode.key).toBe("tap-02");
    }
  });

  it("exports getMovieResume function", () => {
    expect(typeof getMovieResume).toBe("function");
  });
});
