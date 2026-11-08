export type VideoFilterPreset =
  | "none"
  | "vivid"
  | "anime"
  | "cinema"
  | "night"
  | "custom";

export type SharpenLevel = "off" | "low" | "high";

export interface VideoFilterSettings {
  preset: VideoFilterPreset;
  brightness: number; // Percentage: 60 - 150, default 100
  contrast: number; // Percentage: 60 - 150, default 100
  saturate: number; // Percentage: 0 - 200, default 100
  sepia: number; // Percentage: 0 - 50, default 0
  sharpen: SharpenLevel;
}

export const FILTER_PRESETS: Record<
  Exclude<VideoFilterPreset, "custom">,
  Readonly<VideoFilterSettings>
> = {
  none: {
    preset: "none",
    brightness: 100,
    contrast: 100,
    saturate: 100,
    sepia: 0,
    sharpen: "off",
  },
  vivid: {
    preset: "vivid",
    brightness: 102,
    contrast: 108,
    saturate: 115,
    sepia: 0,
    sharpen: "low",
  },
  anime: {
    preset: "anime",
    brightness: 103,
    contrast: 112,
    saturate: 130,
    sepia: 0,
    sharpen: "low",
  },
  cinema: {
    preset: "cinema",
    brightness: 98,
    contrast: 106,
    saturate: 105,
    sepia: 10,
    sharpen: "off",
  },
  night: {
    preset: "night",
    brightness: 90,
    contrast: 96,
    saturate: 90,
    sepia: 15,
    sharpen: "off",
  },
};

export const PRESET_LABELS: Record<VideoFilterPreset, string> = {
  none: "Mặc định",
  vivid: "Sống động",
  anime: "Anime",
  cinema: "Điện ảnh",
  night: "Dịu mắt",
  custom: "Tùy chỉnh",
};

export function clampFilterSettings(
  settings: VideoFilterSettings,
): VideoFilterSettings {
  const brightness = Math.max(
    60,
    Math.min(150, Number.isFinite(settings.brightness) ? settings.brightness : 100),
  );
  const contrast = Math.max(
    60,
    Math.min(150, Number.isFinite(settings.contrast) ? settings.contrast : 100),
  );
  const saturate = Math.max(
    0,
    Math.min(200, Number.isFinite(settings.saturate) ? settings.saturate : 100),
  );
  const sepia = Math.max(
    0,
    Math.min(50, Number.isFinite(settings.sepia) ? settings.sepia : 0),
  );
  const sharpen: SharpenLevel =
    settings.sharpen === "high"
      ? "high"
      : settings.sharpen === "low"
        ? "low"
        : "off";

  return {
    preset: settings.preset,
    brightness: Math.round(brightness),
    contrast: Math.round(contrast),
    saturate: Math.round(saturate),
    sepia: Math.round(sepia),
    sharpen,
  };
}

export function getVideoFilterCSS(settings: VideoFilterSettings): string {
  const clamped = clampFilterSettings(settings);
  const parts: string[] = [];

  if (clamped.sharpen === "low") {
    parts.push("url(#vphim-sharpen-low)");
  } else if (clamped.sharpen === "high") {
    parts.push("url(#vphim-sharpen-high)");
  }

  if (clamped.brightness !== 100) {
    parts.push(`brightness(${clamped.brightness}%)`);
  }
  if (clamped.contrast !== 100) {
    parts.push(`contrast(${clamped.contrast}%)`);
  }
  if (clamped.saturate !== 100) {
    parts.push(`saturate(${clamped.saturate}%)`);
  }
  if (clamped.sepia > 0) {
    parts.push(`sepia(${clamped.sepia}%)`);
  }

  return parts.length > 0 ? parts.join(" ") : "none";
}
