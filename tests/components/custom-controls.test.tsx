import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomControls } from "@/features/playback/custom-controls";

describe("CustomControls", () => {
  const defaultProps = {
    currentTime: 144, // 02:24
    duration: 1460, // 24:20
    bufferedEnd: 300,
    isPlaying: false,
    onPlayPause: vi.fn(),
    onSeek: vi.fn(),
    onRewind10: vi.fn(),
    onForward10: vi.fn(),
    volume: 0.8,
    muted: false,
    onVolumeChange: vi.fn(),
    playbackRate: 1.0,
    onPlaybackRateChange: vi.fn(),
    onToggleFullscreen: vi.fn(),
    isFullscreen: false,
    onTogglePip: vi.fn(),
    isPipSupported: true,
  };

  it("renders time display and controls properly", () => {
    render(<CustomControls {...defaultProps} />);
    expect(screen.getByText("02:24 / 24:20")).toBeInTheDocument();
    expect(screen.getByText("VPhim")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /phát video/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tua lại 10/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tua tới 10/i }),
    ).toBeInTheDocument();
  });

  it("handles play/pause, rewind, and forward clicks", () => {
    render(<CustomControls {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /phát video/i }));
    expect(defaultProps.onPlayPause).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /tua lại 10/i }));
    expect(defaultProps.onRewind10).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /tua tới 10/i }));
    expect(defaultProps.onForward10).toHaveBeenCalledTimes(1);
  });

  it("handles volume change and mute toggle", () => {
    render(<CustomControls {...defaultProps} />);
    const volumeSlider = screen.getByRole("slider", { name: /âm lượng/i });
    fireEvent.change(volumeSlider, { target: { value: "0.5" } });
    expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(0.5, false);

    const muteBtn = screen.getByRole("button", { name: /tắt tiếng/i });
    fireEvent.click(muteBtn);
    expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(0.8, true);
  });

  it("handles playback rate change", () => {
    render(<CustomControls {...defaultProps} />);
    const settingsBtn = screen.getByRole("button", { name: /cài đặt/i });
    fireEvent.click(settingsBtn);

    const speedNavBtn = screen.getByText("Tốc độ phát");
    fireEvent.click(speedNavBtn);

    const rate15Btn = screen.getByRole("button", { name: "1.5x" });
    fireEvent.click(rate15Btn);
    expect(defaultProps.onPlaybackRateChange).toHaveBeenCalledWith(1.5);
  });

  it("applies idle-hidden class when isIdle is true and settings are closed", () => {
    const { container } = render(
      <CustomControls {...defaultProps} isIdle={true} />,
    );
    const overlay = container.querySelector(".player-controls-overlay");
    expect(overlay).toHaveClass("idle-hidden");

    // When settings is opened, idle-hidden should be removed
    const settingsBtn = screen.getByRole("button", { name: /cài đặt/i });
    fireEvent.click(settingsBtn);
    expect(overlay).not.toHaveClass("idle-hidden");
  });
});
