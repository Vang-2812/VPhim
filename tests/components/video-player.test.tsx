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
