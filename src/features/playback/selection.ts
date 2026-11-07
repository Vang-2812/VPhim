import { fail, type Result } from "@/lib/result";
import type {
  MovieDetail,
  MovieServer,
  Episode,
} from "@/features/movies/types";
export interface PlaybackSelection {
  server: MovieServer;
  episode: Episode;
  mode: "hls" | "embed";
}
export function selectPlayback(
  movie: MovieDetail,
  requested: { serverKey?: string; episodeKey?: string },
): Result<PlaybackSelection> {
  const server = requested.serverKey
    ? movie.servers.find((s) => s.key === requested.serverKey)
    : movie.servers.find((s) => s.episodes.length);
  const episode = requested.episodeKey
    ? server?.episodes.find((e) => e.key === requested.episodeKey)
    : server?.episodes[0];
  if (!server || !episode)
    return fail(
      "NOT_FOUND",
      "Tập hoặc nguồn phát không còn khả dụng. Vui lòng chọn lại.",
    );
  if (!episode.hlsUrl && !episode.embedUrl)
    return fail("NOT_FOUND", "Nguồn phát cho tập này chưa sẵn sàng.");
  return {
    ok: true,
    data: { server, episode, mode: episode.hlsUrl ? "hls" : "embed" },
  };
}
