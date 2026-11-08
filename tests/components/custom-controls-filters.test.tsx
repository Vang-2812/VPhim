import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomControls } from "@/features/playback/custom-controls";
import { FILTER_PRESETS } from "@/features/playback/filters";

describe("CustomControls Settings and Video Filters", () => {
  const baseProps = {
    currentTime: 10,
    duration: 100,
    bufferedEnd: 50,
    isPlaying: true,
    onPlayPause: vi.fn(),
    onSeek: vi.fn(),
    onRewind10: vi.fn(),
    onForward10: vi.fn(),
    volume: 0.8,
    muted: false,
    onVolumeChange: vi.fn(),
    playbackRate: 1.0,
    onPlaybackRateChange: vi.fn(),
    videoFilter: FILTER_PRESETS.none,
    onVideoFilterChange: vi.fn(),
  };

  it("navigates into Speed submenu and back to main menu", () => {
    render(<CustomControls {...baseProps} />);
    const settingsBtn = screen.getByRole("button", { name: /cài đặt/i });
    fireEvent.click(settingsBtn);

    // Main settings menu should list Speed and Filters options
    expect(screen.getByText("Tốc độ phát")).toBeInTheDocument();
    expect(screen.getByText("Bộ lọc hình ảnh")).toBeInTheDocument();

    // Click Speed
    fireEvent.click(screen.getByText("Tốc độ phát"));
    expect(screen.getByRole("button", { name: "1.5x" })).toBeInTheDocument();

    // Click Back
    const backBtn = screen.getByRole("button", { name: /quay lại/i });
    fireEvent.click(backBtn);
    expect(screen.getByText("Bộ lọc hình ảnh")).toBeInTheDocument();
  });

  it("navigates into Video Filters and selects a preset", () => {
    render(<CustomControls {...baseProps} />);
    const settingsBtn = screen.getByRole("button", { name: /cài đặt/i });
    fireEvent.click(settingsBtn);

    // Open Video Filters
    fireEvent.click(screen.getByText("Bộ lọc hình ảnh"));

    // Check presets are visible
    expect(screen.getByRole("button", { name: /sống động/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anime/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /điện ảnh/i })).toBeInTheDocument();

    // Select "Sống động"
    fireEvent.click(screen.getByRole("button", { name: /sống động/i }));
    expect(baseProps.onVideoFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: "vivid",
        contrast: 108,
      }),
    );
  });

  it("renders custom filter sliders when 'Tùy chỉnh' is chosen", () => {
    const onFilterChange = vi.fn();
    render(
      <CustomControls
        {...baseProps}
        videoFilter={{
          preset: "custom",
          brightness: 105,
          contrast: 110,
          saturate: 120,
          sepia: 0,
          sharpen: "low",
        }}
        onVideoFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cài đặt/i }));
    fireEvent.click(screen.getByText("Bộ lọc hình ảnh"));

    expect(screen.getByLabelText(/độ sáng/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/độ tương phản/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/độ bão hòa/i)).toBeInTheDocument();

    const brightnessSlider = screen.getByLabelText(/độ sáng/i);
    fireEvent.change(brightnessSlider, { target: { value: "115" } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: "custom",
        brightness: 115,
      }),
    );
  });
});
