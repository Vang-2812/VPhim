"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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
    restored = useRef(false),
    fallbackTriggered = useRef(false);

  sampleCallback.current = onSample;

  useEffect(() => {
    fallbackTriggered.current = false;
  }, [selection.episode.key, retry]);

  const handleError = useCallback(
    (fallbackMessage: string) => {
      if (selection.episode.embedUrl) {
        if (!fallbackTriggered.current) {
          fallbackTriggered.current = true;
          setEmbed(true);
          sampleCallback.current({
            position: null,
            duration: null,
            ended: false,
            reason: "pause",
          });
        }
      } else {
        setError(fallbackMessage);
      }
    },
    [selection.episode.embedUrl],
  );

  const errorHandlerRef = useRef(handleError);
  errorHandlerRef.current = handleError;

  useEffect(() => {
    if (embed) return;
    const el = video.current;
    if (!el || !selection.episode.hlsUrl) return;
    let cancelled = false,
      hls: Hls | undefined;
    restored.current = false;
    setError("");
    // Chrome can advertise native HLS while struggling with some MPEG-TS
    // streams. Prefer HLS.js/MSE; retain native playback for other platforms.
    void import("hls.js")
      .then(({ default: HlsClass }) => {
        if (cancelled) return;
        if (!HlsClass.isSupported()) {
          if (el.canPlayType("application/vnd.apple.mpegurl"))
            el.src = selection.episode.hlsUrl!;
          else
            errorHandlerRef.current("Trình duyệt chưa hỗ trợ nguồn HLS này.");
          return;
        }
        hls = new HlsClass({
          // Keep a small seek-back window and evict distant buffers after seeks.
          backBufferLength: 30,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          frontBufferFlushThreshold: 60,
        });
        hls.loadSource(selection.episode.hlsUrl!);
        hls.attachMedia(el);
        hls.on(HlsClass.Events.ERROR, (_event, data) => {
          if (data.fatal)
            errorHandlerRef.current(
              "Chưa phát được nguồn này. Thử lại hoặc đổi nguồn phát.",
            );
        });
      })
      .catch(() => {
        if (!cancelled)
          errorHandlerRef.current(
            "Không tải được trình phát. Vui lòng thử lại.",
          );
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
          {selection.episode.hlsUrl ? (
            <>
              Đang phát từ nguồn nhúng dự phòng do nguồn trực tiếp tạm thời
              không khả dụng.{" "}
              <button
                type="button"
                className="text-link"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "inherit",
                }}
                onClick={() => {
                  fallbackTriggered.current = false;
                  setEmbed(false);
                  setError("");
                  setRetry((v) => v + 1);
                }}
              >
                Thử lại nguồn trực tiếp
              </button>
            </>
          ) : (
            "Nguồn nhúng chỉ lưu tập phim; không lưu được vị trí chính xác."
          )}
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
          onError={() => handleError("Nguồn phát tạm thời không khả dụng.")}
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
