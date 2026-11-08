"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import type { MovieDetail } from "@/features/movies/types";
import type { PlaybackSelection } from "./selection";
import { VideoPlayer } from "./video-player";
import { WatchActionBar } from "./watch-action-bar";
import { getPlayerPreferences, setPlayerAutoNext } from "./storage";
import { beginWatch, saveProgress } from "./actions";
import { createProgressWriter } from "./progress-client";
import type { PlaybackSample } from "./types";

export function WatchScreen({
  movie,
  selection,
  member,
}: {
  movie: MovieDetail;
  selection: PlaybackSelection;
  member: boolean;
}) {
  const router = useRouter(),
    [notice, setNotice] = useState(
      member
        ? "Đang tải tiến độ…"
        : "Đăng nhập để lưu tiến độ và xem tiếp trên thiết bị khác.",
    ),
    [initial, setInitial] = useState<{
      position: number | null;
      completed: boolean;
    } | null>(null),
    [autoNext, setAutoNext] = useState(() => getPlayerPreferences().autoNext),
    writer = useRef<ReturnType<typeof createProgressWriter> | null>(null),
    autoNextRef = useRef(autoNext);

  autoNextRef.current = autoNext;
  const sourceKey = selection.server.key + "/" + selection.episode.key;

  const index = selection.server.episodes.findIndex(
    (e) => e.key === selection.episode.key,
  );
  function href(episodeKey: string, serverKey = selection.server.key) {
    return (
      "/xem/" +
      movie.slug +
      "?" +
      new URLSearchParams({ server: serverKey, episode: episodeKey })
    );
  }
  const prevHref =
    index > 0 ? href(selection.server.episodes[index - 1].key) : null;
  const nextHref =
    index < selection.server.episodes.length - 1
      ? href(selection.server.episodes[index + 1].key)
      : null;

  useEffect(() => {
    if (!member) return;
    let active = true;
    const sessionId = crypto.randomUUID();
    setInitial(null);
    beginWatch({
      slug: movie.slug,
      episodeKey: selection.episode.key,
      serverKey: selection.server.key,
      sessionId,
    }).then(async (r) => {
      if (!active) return;
      if (!r.ok) {
        setNotice(r.message);
        return;
      }
      setInitial({ position: r.data.position, completed: r.data.completed });
      setNotice("Tiến độ được lưu khi bạn xem phim.");
      const w = createProgressWriter(async (s, sequence) => {
        const result = await saveProgress({
          sessionId,
          sequence,
          position: s.position,
          duration: s.duration,
          completed: s.ended,
        });
        if (!result.ok) {
          setNotice(result.message);
          throw new Error(result.code);
        }
        setNotice(
          s.position === null
            ? "Đã ghi nhớ tập đang mở."
            : "Đã lưu tiến độ xem.",
        );
      });
      writer.current = w;
      if (selection.mode === "embed") {
        w.sample({
          position: null,
          duration: null,
          ended: false,
          reason: "pause",
        });
      }
    });
    const flush = () => {
      void writer.current?.flush();
    };
    window.addEventListener("pagehide", flush);
    return () => {
      active = false;
      window.removeEventListener("pagehide", flush);
      const w = writer.current;
      writer.current = null;
      if (w) void w.flush().finally(() => w.dispose());
    };
  }, [
    sourceKey,
    movie.slug,
    member,
    selection.episode.key,
    selection.server.key,
    selection.mode,
  ]);

  const sample = useCallback(
    (s: PlaybackSample) => {
      writer.current?.sample(s);
      if (s.ended && autoNextRef.current && nextHref) {
        router.push(nextHref);
      }
    },
    [nextHref, router],
  );

  return (
    <>
      <div className="watch-title">
        <div>
          <span className="watch-eyebrow">Đang xem</span>
          <h1>{movie.title}</h1>
          <p>
            {selection.episode.label} / {selection.server.label}
          </p>
        </div>
        <Link className="text-link" href={"/phim/" + movie.slug}>
          <Info size={16} />
          Thông tin phim
        </Link>
      </div>
      <div className="watch-layout">
        <div>
          <VideoPlayer
            key={sourceKey}
            selection={selection}
            posterUrl={movie.thumbUrl || movie.posterUrl}
            initialPosition={initial}
            onSample={sample}
          />
          <WatchActionBar
            slug={movie.slug}
            member={member}
            prevHref={prevHref}
            nextHref={nextHref}
            autoNext={autoNext}
            onToggleAutoNext={(val) => {
              setAutoNext(val);
              setPlayerAutoNext(val);
            }}
          />
          <p className="watch-status" role="status">
            {notice}
            {!member && (
              <>
                {" "}
                <Link
                  className="text-link"
                  href={
                    "/dang-nhap?next=" +
                    encodeURIComponent(href(selection.episode.key))
                  }
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </p>
        </div>
        <aside className="watch-episodes">
          <h2>Danh sách tập</h2>
          <label>
            Nguồn phát
            <select
              value={selection.server.key}
              onChange={(e) => {
                const server = movie.servers.find(
                  (s) => s.key === e.target.value,
                );
                if (server) {
                  const ep =
                    server.episodes.find(
                      (v) => v.key === selection.episode.key,
                    ) || server.episodes[0];
                  if (ep) router.push(href(ep.key, server.key));
                }
              }}
            >
              {movie.servers.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <div className="episode-grid">
            {selection.server.episodes.map((e) => (
              <Link
                className={
                  "episode " + (e.key === selection.episode.key ? "active" : "")
                }
                key={e.key}
                href={href(e.key)}
                aria-current={
                  e.key === selection.episode.key ? "page" : undefined
                }
              >
                {e.label}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
