import { it, expect, vi } from "vitest";
import { selectPlayback } from "@/features/playback/selection";
import {
  createProgressWriter,
  resumePosition,
} from "@/features/playback/progress-client";
const movie = {
  servers: [
    {
      key: "vs",
      label: "Vietsub",
      episodes: [
        {
          key: "tap-1",
          slug: "tap-1",
          label: "Tập 1",
          hlsUrl: "https://s6.cdn-player.com/a/index.m3u8",
          embedUrl: "https://player.phimapi.com/player/x",
        },
      ],
    },
  ],
} as Parameters<typeof selectPlayback>[0];
it("prefers HLS and refuses missing selected episodes", () => {
  expect(selectPlayback(movie, {})).toMatchObject({
    ok: true,
    data: { mode: "hls" },
  });
  expect(selectPlayback(movie, { episodeKey: "missing" }).ok).toBe(false);
  expect(selectPlayback({ ...movie, servers: [] }, {}).ok).toBe(false);
});
it("does not invent an exact resume position for iframe or completed playback", () => {
  expect(resumePosition(null, 100, false)).toBe(0);
  expect(resumePosition(99, 100, true)).toBe(0);
  expect(resumePosition(150, 100, false)).toBe(99);
});
it("flushes latest samples after 15 seconds without concurrent writes", async () => {
  vi.useFakeTimers();
  const saved: number[] = [];
  let release: () => void = () => {};
  const writer = createProgressWriter(async (sample) => {
    saved.push(sample.position!);
    if (saved.length === 1) await new Promise<void>((r) => (release = r));
  });
  writer.sample({ position: 10, duration: 100, ended: false, reason: "time" });
  await vi.advanceTimersByTimeAsync(15000);
  expect(saved).toEqual([10]);
  writer.sample({ position: 20, duration: 100, ended: false, reason: "pause" });
  writer.sample({ position: 21, duration: 100, ended: false, reason: "pause" });
  expect(saved).toEqual([10]);
  release();
  await Promise.resolve();
  await writer.flush();
  expect(saved).toEqual([10, 21]);
  writer.dispose();
  vi.useRealTimers();
});
