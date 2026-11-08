"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import type { PlaybackSelection } from "./selection";
import type { PlaybackSample } from "./types";
import { resumePosition } from "./progress-client";
import {
  getPlayerPreferences,
  setPlayerVolume,
  getVideoFilterSettings,
  setVideoFilterSettings,
} from "./storage";
import { type VideoFilterSettings, getVideoFilterCSS } from "./filters";
import { VideoFilterDefs } from "./video-filter-defs";
import { CustomControls } from "./custom-controls";

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
  const containerRef = useRef<HTMLDivElement>(null),
    video = useRef<HTMLVideoElement>(null),
    sampleCallback = useRef(onSample),
    [error, setError] = useState(""),
    [embed, setEmbed] = useState(selection.mode === "embed"),
    [retry, setRetry] = useState(0),
    restored = useRef(false),
    fallbackTriggered = useRef(false);

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persistent volume and mute
  const [volume, setVolume] = useState(() => getPlayerPreferences().volume);
  const [muted, setMuted] = useState(() => getPlayerPreferences().muted);

  // Video filter settings
  const [videoFilter, setVideoFilter] = useState<VideoFilterSettings>(() =>
    getVideoFilterSettings(),
  );

  const handleVideoFilterChange = useCallback(
    (newFilter: VideoFilterSettings) => {
      setVideoFilter(newFilter);
      setVideoFilterSettings(newFilter);
    },
    [],
  );

  const filterCss = getVideoFilterCSS(videoFilter);
  const filterStyle =
    filterCss !== "none" ? { filter: filterCss } : undefined;

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

  // HLS stream management
  useEffect(() => {
    if (embed) return;
    const el = video.current;
    if (!el || !selection.episode.hlsUrl) return;
    let cancelled = false,
      hls: Hls | undefined;
    restored.current = false;
    setError("");

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

  // Initial resume position
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

  // Set the audio volume on the video element using a perceptual curve
  const applyVideoVolume = useCallback((val: number, isMuted: boolean) => {
    if (!video.current) return;
    if (isMuted || val <= 0) {
      video.current.muted = true;
      video.current.volume = 0;
    } else {
      video.current.muted = false;
      // Perceptual audio curve: Math.sqrt(val) prevents silence/dead-zone at lower volume positions (e.g. 1/3)
      const gain = Math.min(1, Math.max(0, Math.sqrt(val)));
      video.current.volume = gain;
    }
  }, []);

  // Apply volume / muted whenever changed
  useEffect(() => {
    applyVideoVolume(volume, muted);
  }, [volume, muted, applyVideoVolume]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Idle timer to auto-hide controls
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (isPlaying) {
      idleTimer.current = setTimeout(() => {
        setIsIdle(true);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setIsIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    } else {
      resetIdleTimer();
    }
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isPlaying, resetIdleTimer]);

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

  // Playback control actions
  const handlePlayPause = useCallback(() => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }, []);

  const handleSeek = useCallback(
    (time: number) => {
      const el = video.current;
      if (!el || !Number.isFinite(el.duration)) return;
      el.currentTime = Math.max(0, Math.min(el.duration, time));
      setCurrentTime(el.currentTime);
    },
    [],
  );

  const handleRewind10 = useCallback(() => {
    const el = video.current;
    if (!el) return;
    handleSeek(el.currentTime - 10);
  }, [handleSeek]);

  const handleForward10 = useCallback(() => {
    const el = video.current;
    if (!el) return;
    handleSeek(el.currentTime + 10);
  }, [handleSeek]);

  const handleVolumeChange = useCallback(
    (newVol: number, newMuted: boolean) => {
      const isMuted = newMuted || newVol <= 0;
      setVolume(newVol);
      setMuted(isMuted);
      setPlayerVolume(newVol, isMuted);
      applyVideoVolume(newVol, isMuted);
    },
    [applyVideoVolume],
  );

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (video.current) {
      video.current.playbackRate = rate;
    }
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    const stage = containerRef.current;
    if (!stage) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (stage.requestFullscreen) {
      void stage.requestFullscreen();
    }
  }, []);

  const handleTogglePip = useCallback(() => {
    const el = video.current;
    if (!el) return;
    if (document.pictureInPictureElement) {
      void document.exitPictureInPicture();
    } else if (el.requestPictureInPicture) {
      void el.requestPictureInPicture();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        activeEl?.getAttribute("contenteditable") === "true";
      if (isInput) return;

      if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === "ArrowLeft" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        handleRewind10();
      } else if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") {
        e.preventDefault();
        handleForward10();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.1), false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.1), false);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        handleVolumeChange(volume, !muted);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    volume,
    muted,
    handlePlayPause,
    handleRewind10,
    handleForward10,
    handleVolumeChange,
    handleToggleFullscreen,
  ]);

  if (embed)
    return (
      <>
        <VideoFilterDefs />
        <div className="video-stage" ref={containerRef}>
          <iframe
            style={filterStyle}
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
    <div
      className="video-stage"
      ref={containerRef}
      onMouseMove={resetIdleTimer}
      onTouchStart={resetIdleTimer}
    >
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
        <>
          <VideoFilterDefs />
          <video
            ref={video}
            style={filterStyle}
            poster={posterUrl || undefined}
            playsInline
            preload="metadata"
            onClick={handlePlayPause}
            onPlay={() => {
              setIsPlaying(true);
              resetIdleTimer();
            }}
            onPause={() => {
              setIsPlaying(false);
              emit("pause");
              setIsIdle(false);
            }}
            onEnded={() => {
              setIsPlaying(false);
              emit("ended");
              setIsIdle(false);
            }}
            onTimeUpdate={() => {
              const el = video.current;
              if (el) {
                setCurrentTime(el.currentTime);
                if (el.buffered.length > 0) {
                  setBufferedEnd(el.buffered.end(el.buffered.length - 1));
                }
              }
              emit("time");
            }}
            onError={() => handleError("Nguồn phát tạm thời không khả dụng.")}
            onLoadedMetadata={() => {
              const el = video.current;
              if (el) {
                setDuration(el.duration);
                applyVideoVolume(volume, muted);
                if (initialPosition && !restored.current) {
                  el.currentTime = resumePosition(
                    initialPosition.position,
                    el.duration,
                    initialPosition.completed,
                  );
                  restored.current = true;
                }
              }
            }}
          />
          <div className={isIdle ? "idle-hidden" : ""}>
            <CustomControls
              currentTime={currentTime}
              duration={duration}
              bufferedEnd={bufferedEnd}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onRewind10={handleRewind10}
              onForward10={handleForward10}
              volume={volume}
              muted={muted}
              onVolumeChange={handleVolumeChange}
              playbackRate={playbackRate}
              onPlaybackRateChange={handlePlaybackRateChange}
              onToggleFullscreen={handleToggleFullscreen}
              isFullscreen={isFullscreen}
              onTogglePip={handleTogglePip}
              isPipSupported={
                typeof document !== "undefined" &&
                "pictureInPictureEnabled" in document
              }
              videoFilter={videoFilter}
              onVideoFilterChange={handleVideoFilterChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
