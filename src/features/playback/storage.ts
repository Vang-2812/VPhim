export interface PlayerPreferences {
  volume: number;
  muted: boolean;
  autoNext: boolean;
}

const STORAGE_KEYS = {
  volume: "vphim_player_volume",
  muted: "vphim_player_muted",
  autoNext: "vphim_auto_next",
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
