import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import {
  FILTER_PRESETS,
  getVideoFilterCSS,
  clampFilterSettings,
  type VideoFilterSettings,
} from "@/features/playback/filters";
import {
  getVideoFilterSettings,
  setVideoFilterSettings,
} from "@/features/playback/storage";
import { VideoFilterDefs } from "@/features/playback/video-filter-defs";
import { render } from "@testing-library/react";

describe("playback video filters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides standard pre-calibrated presets", () => {
    expect(FILTER_PRESETS.none).toBeDefined();
    expect(FILTER_PRESETS.vivid).toBeDefined();
    expect(FILTER_PRESETS.anime).toBeDefined();
    expect(FILTER_PRESETS.cinema).toBeDefined();
    expect(FILTER_PRESETS.night).toBeDefined();

    expect(FILTER_PRESETS.none.brightness).toBe(100);
    expect(FILTER_PRESETS.none.contrast).toBe(100);
    expect(FILTER_PRESETS.none.saturate).toBe(100);
    expect(FILTER_PRESETS.none.sharpen).toBe("off");

    expect(FILTER_PRESETS.vivid.contrast).toBeGreaterThan(100);
    expect(FILTER_PRESETS.anime.saturate).toBeGreaterThan(120);
    expect(FILTER_PRESETS.night.brightness).toBeLessThan(100);
  });

  it("generates 'none' CSS filter when using the none preset with neutral values", () => {
    const css = getVideoFilterCSS(FILTER_PRESETS.none);
    expect(css).toBe("none");
  });

  it("generates correct CSS filter string for presets", () => {
    const vividCss = getVideoFilterCSS(FILTER_PRESETS.vivid);
    expect(vividCss).toContain("contrast(");
    expect(vividCss).toContain("saturate(");
    expect(vividCss).toContain("url(#vphim-sharpen-low)");

    const nightCss = getVideoFilterCSS(FILTER_PRESETS.night);
    expect(nightCss).toContain("brightness(");
    expect(nightCss).toContain("sepia(");
  });

  it("clamps custom settings within safe boundaries to avoid visual clipping", () => {
    const extreme: VideoFilterSettings = {
      preset: "custom",
      brightness: 500,
      contrast: -10,
      saturate: 999,
      sepia: 150,
      sharpen: "high",
    };
    const clamped = clampFilterSettings(extreme);
    expect(clamped.brightness).toBeLessThanOrEqual(150);
    expect(clamped.contrast).toBeGreaterThanOrEqual(60);
    expect(clamped.saturate).toBeLessThanOrEqual(200);
    expect(clamped.sepia).toBeLessThanOrEqual(50);
    expect(clamped.sharpen).toBe("high");
  });

  it("persists and restores filter settings in localStorage", () => {
    expect(getVideoFilterSettings().preset).toBe("none");

    const customSetting: VideoFilterSettings = {
      preset: "anime",
      brightness: 102,
      contrast: 110,
      saturate: 130,
      sepia: 0,
      sharpen: "low",
    };
    setVideoFilterSettings(customSetting);

    const saved = getVideoFilterSettings();
    expect(saved.preset).toBe("anime");
    expect(saved.saturate).toBe(130);
    expect(saved.sharpen).toBe("low");
  });

  it("recovers gracefully if localStorage contains invalid json or unknown preset", () => {
    localStorage.setItem("vphim_video_filter", "{invalid_json");
    expect(getVideoFilterSettings().preset).toBe("none");

    localStorage.setItem(
      "vphim_video_filter",
      JSON.stringify({ preset: "unknown_xyz" }),
    );
    expect(getVideoFilterSettings().preset).toBe("none");
  });

  it("renders SVG filter definitions for sharpening", () => {
    const { container } = render(React.createElement(VideoFilterDefs));
    const lowFilter = container.querySelector("#vphim-sharpen-low");
    const highFilter = container.querySelector("#vphim-sharpen-high");
    expect(lowFilter).not.toBeNull();
    expect(highFilter).not.toBeNull();
  });
});
