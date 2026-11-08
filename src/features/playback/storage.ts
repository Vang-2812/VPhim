import {
  type VideoFilterSettings,
  FILTER_PRESETS,
  clampFilterSettings,
} from "./filters";

export interface PlayerPreferences {
  volume: number;
  muted: boolean;
  autoNext: boolean;
}

const STORAGE_KEYS = {
  volume: "vphim_player_volume",
  muted: "vphim_player_muted",
  autoNext: "vphim_auto_next",
  videoFilter: "vphim_video_filter",
} as const;

export function getPlayerPreferences(): PlayerPreferences {
  if (typeof window === "undefined" || !window.localStorage) {
    return { volume: 1.0, muted: false, autoNext: true };
  }

  let volume = 1.0;
  const rawVol = window.localStorage.getItem(STORAGE_KEYS.volume);
  if (rawVol !== null) {
    const parsed = parseFloat(rawVol);
    if (!Number.isNaN(parsed)) {
      volume = Math.max(0, Math.min(1, parsed));
    }
  }

  let muted = false;
  const rawMuted = window.localStorage.getItem(STORAGE_KEYS.muted);
  if (rawMuted !== null) {
    muted = rawMuted === "true";
  }

  let autoNext = true;
  const rawAutoNext = window.localStorage.getItem(STORAGE_KEYS.autoNext);
  if (rawAutoNext !== null) {
    autoNext = rawAutoNext !== "false";
  }

  return { volume, muted, autoNext };
}

export function setPlayerVolume(volume: number, muted?: boolean): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const clamped = Math.max(0, Math.min(1, volume));
  window.localStorage.setItem(STORAGE_KEYS.volume, clamped.toString());
  if (muted !== undefined) {
    window.localStorage.setItem(STORAGE_KEYS.muted, muted ? "true" : "false");
  }
}

export function setPlayerAutoNext(autoNext: boolean): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(
    STORAGE_KEYS.autoNext,
    autoNext ? "true" : "false",
  );
}

export function getVideoFilterSettings(): VideoFilterSettings {
  if (typeof window === "undefined" || !window.localStorage) {
    return { ...FILTER_PRESETS.none };
  }
  const raw = window.localStorage.getItem(STORAGE_KEYS.videoFilter);
  if (!raw) {
    return { ...FILTER_PRESETS.none };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { ...FILTER_PRESETS.none };
    }
    const validPresets = [
      "none",
      "vivid",
      "anime",
      "cinema",
      "night",
      "custom",
    ];
    if (!validPresets.includes(parsed.preset)) {
      return { ...FILTER_PRESETS.none };
    }
    return clampFilterSettings(parsed as VideoFilterSettings);
  } catch {
    return { ...FILTER_PRESETS.none };
  }
}

export function setVideoFilterSettings(settings: VideoFilterSettings): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const clamped = clampFilterSettings(settings);
  window.localStorage.setItem(STORAGE_KEYS.videoFilter, JSON.stringify(clamped));
}
