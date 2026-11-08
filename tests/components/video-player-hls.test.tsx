import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import Hls from "hls.js";
import { VideoPlayer } from "@/features/playback/video-player";
import type { PlaybackSelection } from "@/features/playback/selection";

// Use the real HLS constructor/config merger; jsdom only lacks media/network IO.
const instances = vi.hoisted(() => [] as import("hls.js").default[]);
vi.mock("hls.js", async (importOriginal) => {
  const { default: RealHls } = await importOriginal<typeof import("hls.js")>();
  return {
    default: class extends RealHls {
      constructor(config?: Partial<import("hls.js").HlsConfig>) {
        super(config);
        instances.push(this);
      }
    },
  };
});

const selection: PlaybackSelection = {
  mode: "hls",
  server: { key: "vs", label: "Vietsub", episodes: [] },
  episode: {
    key: "full",
    slug: "full",
    label: "Full",
    hlsUrl: "https://a.kvp726.com/film/index.m3u8",
    embedUrl: null,
  },
};

beforeEach(() => {
  instances.length = 0;
  vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("");
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(Hls, "isSupported").mockReturnValue(true);
  vi.spyOn(Hls.prototype, "loadSource").mockImplementation(() => {});
  vi.spyOn(Hls.prototype, "attachMedia").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("bounds retained HLS media on both sides of a long-film playhead", async () => {
  render(
    <VideoPlayer
      selection={selection}
      initialPosition={null}
      onSample={() => {}}
    />,
  );
  await waitFor(() => expect(instances).toHaveLength(1));
  const { config } = instances[0];
  // Removing the player policy must not silently restore Infinity/10-minute defaults.
  expect(config.backBufferLength).toBeGreaterThan(0);
  expect(config.backBufferLength).toBeLessThanOrEqual(60);
  expect(config.maxMaxBufferLength).toBeLessThanOrEqual(60);
  expect(config.maxBufferLength).toBeLessThanOrEqual(config.maxMaxBufferLength);
  // After a backward seek, previously loaded distant future segments must be eligible for eviction.
  expect(config.frontBufferFlushThreshold).toBeGreaterThanOrEqual(
    config.maxMaxBufferLength,
  );
  expect(config.frontBufferFlushThreshold).toBeLessThanOrEqual(120);
});

it("uses HLS.js even when a browser advertises native HLS support", async () => {
  vi.mocked(HTMLMediaElement.prototype.canPlayType).mockReturnValue("maybe");
  const { container } = render(
    <VideoPlayer
      selection={selection}
      initialPosition={null}
      onSample={() => {}}
    />,
  );
  await waitFor(() => expect(instances).toHaveLength(1));
  expect(container.querySelector("video")!.getAttribute("src")).toBeNull();
});

it("uses native HLS when MediaSource is unavailable", async () => {
  vi.mocked(Hls.isSupported).mockReturnValue(false);
  vi.mocked(HTMLMediaElement.prototype.canPlayType).mockReturnValue("probably");
  const { container } = render(
    <VideoPlayer
      selection={selection}
      initialPosition={null}
      onSample={() => {}}
    />,
  );
  await waitFor(() =>
    expect(container.querySelector("video")!.getAttribute("src")).toBe(
      selection.episode.hlsUrl,
    ),
  );
  expect(instances).toHaveLength(0);
});

it("keeps the HLS instance during progress updates and releases it on unmount", async () => {
  const { rerender, unmount } = render(
    <VideoPlayer
      selection={selection}
      initialPosition={null}
      onSample={() => {}}
    />,
  );
  await waitFor(() => expect(instances).toHaveLength(1));
  const destroyed = vi.fn();
  instances[0].on(Hls.Events.DESTROYING, destroyed);
  rerender(
    <VideoPlayer
      selection={selection}
      initialPosition={{ position: 5400, completed: false }}
      onSample={() => {}}
    />,
  );
  expect(instances).toHaveLength(1);
  expect(destroyed).not.toHaveBeenCalled();
  unmount();
  expect(destroyed).toHaveBeenCalledOnce();
});
