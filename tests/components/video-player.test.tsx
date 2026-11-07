import { it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { VideoPlayer } from "@/features/playback/video-player";
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue(
    "probably",
  );
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
});
it("recreates the video element when retrying a failed source", () => {
  const selection = {
    server: { key: "vs", label: "Vietsub", episodes: [] },
    episode: {
      key: "1",
      slug: "1",
      label: "Tập 1",
      hlsUrl: "https://a.kvp726.com/a/index.m3u8",
      embedUrl: null,
    },
    mode: "hls" as const,
  };
  const { container } = render(
    <VideoPlayer
      selection={selection}
      initialPosition={null}
      onSample={() => {}}
    />,
  );
  fireEvent.error(container.querySelector("video")!);
  expect(screen.getByRole("alert")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  expect(container.querySelector("video")).not.toBeNull();
});

it("automatically falls back to embed player when stream source fails", () => {
  const onSample = vi.fn();
  const selection = {
    server: { key: "vs", label: "Vietsub", episodes: [] },
    episode: {
      key: "1",
      slug: "1",
      label: "Tập 1",
      hlsUrl: "https://a.kvp726.com/a/index.m3u8",
      embedUrl:
        "https://player.phimapi.com/player/?url=https://a.kvp726.com/a/index.m3u8",
    },
    mode: "hls" as const,
  };
  const { container } = render(
    <VideoPlayer
      selection={selection}
      initialPosition={null}
      onSample={onSample}
    />,
  );
  expect(container.querySelector("video")).not.toBeNull();
  expect(container.querySelector("iframe")).toBeNull();

  // Simulate source failure on the video tag
  fireEvent.error(container.querySelector("video")!);

  // Should automatically switch to iframe embed without requiring user click or showing error alert
  expect(screen.queryByRole("alert")).toBeNull();
  const iframe = container.querySelector("iframe");
  expect(iframe).not.toBeNull();
  expect(iframe?.getAttribute("src")).toBe(
    "https://player.phimapi.com/player/?url=https://a.kvp726.com/a/index.m3u8",
  );
  expect(onSample).toHaveBeenCalledWith({
    position: null,
    duration: null,
    ended: false,
    reason: "pause",
  });
});

it("allows retrying direct source from embed fallback", () => {
  const onSample = vi.fn();
  const selection = {
    server: { key: "vs", label: "Vietsub", episodes: [] },
    episode: {
      key: "1",
      slug: "1",
      label: "Tập 1",
      hlsUrl: "https://a.kvp726.com/a/index.m3u8",
      embedUrl:
        "https://player.phimapi.com/player/?url=https://a.kvp726.com/a/index.m3u8",
    },
    mode: "hls" as const,
  };
  const { container } = render(
    <VideoPlayer
      selection={selection}
      initialPosition={null}
      onSample={onSample}
    />,
  );
  fireEvent.error(container.querySelector("video")!);
  expect(container.querySelector("iframe")).not.toBeNull();

  // Can click retry direct stream
  const retryBtn = screen.getByRole("button", {
    name: /Thử lại nguồn trực tiếp/i,
  });
  expect(retryBtn).toBeVisible();
  fireEvent.click(retryBtn);

  // Video tag is restored
  expect(container.querySelector("video")).not.toBeNull();
  expect(container.querySelector("iframe")).toBeNull();
});
