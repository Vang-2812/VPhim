"use client";
import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import type { PlaybackSelection } from "./selection";
import type { PlaybackSample } from "./types";
import { resumePosition } from "./progress-client";
export function VideoPlayer({
  selection,
  initialPosition,
  onSample,
  posterUrl,
}: {
  posterUrl?: string | null;
  selection: PlaybackSelection;
  initialPosition: { position: number | null; completed: boolean } | null;
  onSample: (s: PlaybackSample) => void;
}) {
  const video = useRef<HTMLVideoElement>(null),
    sampleCallback = useRef(onSample),
    [error, setError] = useState(""),
    [embed, setEmbed] = useState(selection.mode === "embed"),
    [retry, setRetry] = useState(0),
    restored = useRef(false);
  sampleCallback.current = onSample;
  useEffect(() => {
    if (embed) return;
    const el = video.current;
    if (!el || !selection.episode.hlsUrl) return;
    let cancelled = false,
      hls: Hls | undefined;
    restored.current = false;
    setError("");
    if (el.canPlayType("application/vnd.apple.mpegurl"))
      el.src = selection.episode.hlsUrl;
    else
      void import("hls.js").then(({ default: HlsClass }) => {
        if (cancelled) return;
        if (!HlsClass.isSupported()) {
          setError("Trình duyệt chưa hỗ trợ nguồn HLS này.");
          return;
        }
        hls = new HlsClass();
        hls.loadSource(selection.episode.hlsUrl!);
        hls.attachMedia(el);
        hls.on(HlsClass.Events.ERROR, (_event, data) => {
          if (data.fatal)
            setError("Chưa phát được nguồn này. Thử lại hoặc đổi nguồn phát.");
        });
      });
    return () => {
      cancelled = true;
      hls?.destroy();
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, [selection.episode.hlsUrl, embed, retry]);
  useEffect(() => {
    const el = video.current;
    if (el && initialPosition && el.readyState >= 1 && !restored.current) {
      el.currentTime = resumePosition(
        initialPosition.position,
        el.duration,
        initialPosition.completed,
      );
      restored.current = true;
    }
  }, [initialPosition]);
  function emit(reason: PlaybackSample["reason"]) {
    const el = video.current;
    if (el && Number.isFinite(el.duration) && el.duration > 0)
      sampleCallback.current({
        position: Math.min(el.currentTime, el.duration),
        duration: el.duration,
        ended: el.ended,
        reason,
      });
  }
  if (embed)
    return (
      <>
        <div className="video-stage">
          <iframe
            src={selection.episode.embedUrl!}
            title={"Xem " + selection.episode.label}
            allow="fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        </div>
        <p className="watch-status">
          Nguồn nhúng chỉ lưu tập phim; không lưu được vị trí chính xác.
        </p>
      </>
    );
  return (
    <div className="video-stage">
      {error ? (
        <div className="player-error">
          <p role="alert">{error}</p>
          <div className="hero-actions">
            <button
              className="button secondary"
              onClick={() => {
                setError("");
                setRetry((v) => v + 1);
              }}
            >
              Thử lại
            </button>
            {selection.episode.embedUrl && (
              <button
                className="button secondary"
                onClick={() => {
                  setEmbed(true);
                  sampleCallback.current({
                    position: null,
                    duration: null,
                    ended: false,
                    reason: "pause",
                  });
                }}
              >
                Dùng nguồn nhúng
              </button>
            )}
          </div>
        </div>
      ) : (
        <video
          ref={video}
          poster={posterUrl || undefined}
          controls
          playsInline
          preload="metadata"
          onTimeUpdate={() => emit("time")}
          onPause={() => emit("pause")}
          onEnded={() => emit("ended")}
          onError={() => setError("Nguồn phát tạm thời không khả dụng.")}
          onLoadedMetadata={() => {
            if (video.current && initialPosition && !restored.current) {
              video.current.currentTime = resumePosition(
                initialPosition.position,
                video.current.duration,
                initialPosition.completed,
              );
              restored.current = true;
            }
          }}
        />
      )}
    </div>
  );
}
