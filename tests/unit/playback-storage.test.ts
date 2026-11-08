import { describe, it, expect, beforeEach } from "vitest";
import {
  getPlayerPreferences,
  setPlayerVolume,
  setPlayerAutoNext,
} from "@/features/playback/storage";

describe("playback preferences storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default values when storage is empty", () => {
    const prefs = getPlayerPreferences();
    expect(prefs.volume).toBe(1.0);
    expect(prefs.muted).toBe(false);
    expect(prefs.autoNext).toBe(true);
  });

  it("persists and restores updated volume and muted state", () => {
    setPlayerVolume(0.65, true);
    const prefs = getPlayerPreferences();
    expect(prefs.volume).toBe(0.65);
    expect(prefs.muted).toBe(true);
  });

  it("clamps volume between 0.0 and 1.0", () => {
    setPlayerVolume(1.8);
    expect(getPlayerPreferences().volume).toBe(1.0);

    setPlayerVolume(-0.5);
    expect(getPlayerPreferences().volume).toBe(0.0);
  });

  it("persists and restores autoNext toggle", () => {
    setPlayerAutoNext(false);
    expect(getPlayerPreferences().autoNext).toBe(false);

    setPlayerAutoNext(true);
    expect(getPlayerPreferences().autoNext).toBe(true);
  });
});
