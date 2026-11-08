"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  PictureInPicture2,
} from "lucide-react";

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export interface CustomControlsProps {
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onRewind10: () => void;
  onForward10: () => void;
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number, muted: boolean) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onTogglePip?: () => void;
  isPipSupported?: boolean;
}

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export function CustomControls({
  currentTime,
  duration,
  bufferedEnd,
  isPlaying,
  onPlayPause,
  onSeek,
  onRewind10,
  onForward10,
  volume,
  muted,
  onVolumeChange,
  playbackRate,
  onPlaybackRateChange,
  onToggleFullscreen,
  isFullscreen = false,
  onTogglePip,
  isPipSupported = true,
}: CustomControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const scrubBarRef = useRef<HTMLDivElement>(null);

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  const handleScrub = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const bar = scrubBarRef.current;
      if (!bar || duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(pos * duration);
    },
    [duration, onSeek],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handleScrub(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const bar = scrubBarRef.current;
    if (bar && duration > 0) {
      const rect = bar.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverPosition(pos * 100);
      setHoverTime(pos * duration);
    }
    if (isScrubbing) {
      handleScrub(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerLeave = () => {
    if (!isScrubbing) {
      setHoverTime(null);
    }
  };

  // Close settings when clicking outside
  useEffect(() => {
    if (!showSettings) return;
    const close = () => setShowSettings(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showSettings]);

  const effectiveVolume = muted ? 0 : volume;

  return (
    <div className="player-controls-overlay">
      {/* Scrubber / Timeline bar */}
      <div
        className="player-scrubber-container"
        ref={scrubBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        role="slider"
        aria-label="Tiến độ phim"
        aria-valuemin={0}
        aria-valuemax={duration || 0}
        aria-valuenow={currentTime}
      >
        <div className="player-scrubber-track">
          <div
            className="player-scrubber-buffer"
            style={{ width: `${Math.min(100, bufferPercent)}%` }}
          />
          <div
            className="player-scrubber-played"
            style={{ width: `${Math.min(100, playedPercent)}%` }}
          />
          <div
            className="player-scrubber-thumb"
            style={{ left: `${Math.min(100, playedPercent)}%` }}
          />
          {hoverTime !== null && (
            <div
              className="player-scrubber-tooltip"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="player-controls-row">
        {/* Left Side: Play, Rewind 10, Forward 10, Volume, Time */}
        <div className="player-controls-left">
          <button
            type="button"
            className="player-btn"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Tạm dừng video" : "Phát video"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
          </button>

          <button
            type="button"
            className="player-btn"
            onClick={onRewind10}
            aria-label="Tua lại 10 giây"
            title="Tua lại 10s (←)"
          >
            <RotateCcw size={18} />
            <span className="player-btn-badge">10</span>
          </button>

          <button
            type="button"
            className="player-btn"
            onClick={onForward10}
            aria-label="Tua tới 10 giây"
            title="Tua tới 10s (→)"
          >
            <RotateCw size={18} />
            <span className="player-btn-badge">10</span>
          </button>

          <div className="player-volume-group">
            <button
              type="button"
              className="player-btn"
              onClick={() => {
                if (muted || effectiveVolume === 0) {
                  onVolumeChange(volume === 0 ? 0.8 : volume, false);
                } else {
                  onVolumeChange(volume, true);
                }
              }}
              aria-label={muted || effectiveVolume === 0 ? "Bật tiếng" : "Tắt tiếng"}
              title="Tắt/Bật tiếng (M)"
            >
              {muted || effectiveVolume === 0 ? (
                <VolumeX size={20} />
              ) : effectiveVolume < 0.5 ? (
                <Volume1 size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
            <input
              type="range"
              className="player-volume-slider"
              min="0"
              max="1"
              step="0.02"
              value={effectiveVolume}
              aria-label="Âm lượng"
              onInput={(e) => {
                const newVol = parseFloat(e.currentTarget.value);
                onVolumeChange(newVol, false);
              }}
              onChange={(e) => {
                const newVol = parseFloat(e.currentTarget.value);
                onVolumeChange(newVol, false);
              }}
            />
          </div>

          <div className="player-time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Right Side: Brand, Settings, PiP, Fullscreen */}
        <div className="player-controls-right">
          <span className="player-brand">VPhim</span>

          {/* Settings Menu */}
          <div className="player-settings-wrapper" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="player-btn"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Cài đặt tốc độ phát"
              title="Cài đặt tốc độ"
            >
              <Settings size={18} />
            </button>
            {showSettings && (
              <div className="player-settings-menu">
                <div className="player-settings-header">Tốc độ phát</div>
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    className={`player-settings-item ${
                      playbackRate === rate ? "active" : ""
                    }`}
                    onClick={() => {
                      onPlaybackRateChange(rate);
                      setShowSettings(false);
                    }}
                  >
                    {rate === 1.0 ? "Chuẩn (1.0x)" : `${rate}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isPipSupported && onTogglePip && (
            <button
              type="button"
              className="player-btn"
              onClick={onTogglePip}
              aria-label="Hình trong hình (PiP)"
              title="Hình trong hình"
            >
              <PictureInPicture2 size={18} />
            </button>
          )}

          {onToggleFullscreen && (
            <button
              type="button"
              className="player-btn"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              title="Toàn màn hình (F)"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
