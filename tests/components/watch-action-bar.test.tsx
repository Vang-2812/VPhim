import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WatchActionBar } from "@/features/playback/watch-action-bar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/features/library/actions", () => ({
  setFavorite: vi.fn().mockResolvedValue({ ok: true, data: { selected: true } }),
  getLibraryState: vi.fn().mockResolvedValue({
    ok: true,
    data: { selected: false, playlists: [{ id: "p1", name: "Xem sau" }] },
  }),
  setPlaylistMovie: vi.fn().mockResolvedValue({ ok: true }),
}));

describe("WatchActionBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  const defaultProps = {
    slug: "gia-dinh-la-so-1",
    member: true,
    prevHref: "/xem/gia-dinh-la-so-1?episode=tap-52",
    nextHref: "/xem/gia-dinh-la-so-1?episode=tap-54",
    autoNext: true,
    onToggleAutoNext: vi.fn(),
  };

  it("renders all action buttons and badges", () => {
    render(<WatchActionBar {...defaultProps} />);
    expect(screen.getByRole("button", { name: /yêu thích/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /thêm vào/i })).toBeInTheDocument();
    expect(screen.getByText("Chuyển tập")).toBeInTheDocument();
    expect(screen.getByText("ON")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tập trước/i })).toHaveAttribute(
      "href",
      "/xem/gia-dinh-la-so-1?episode=tap-52",
    );
    expect(screen.getByRole("link", { name: /tập tiếp theo/i })).toHaveAttribute(
      "href",
      "/xem/gia-dinh-la-so-1?episode=tap-54",
    );
    expect(screen.getByRole("button", { name: /chia sẻ/i })).toBeInTheDocument();
  });

  it("toggles auto-next option", () => {
    render(<WatchActionBar {...defaultProps} />);
    const autoNextBtn = screen.getByRole("button", { name: /chuyển tập/i });
    fireEvent.click(autoNextBtn);
    expect(defaultProps.onToggleAutoNext).toHaveBeenCalledWith(false);
  });

  it("copies link to clipboard when share is clicked", async () => {
    render(<WatchActionBar {...defaultProps} />);
    const shareBtn = screen.getByRole("button", { name: /chia sẻ/i });
    fireEvent.click(shareBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(
      await screen.findByText(/đã sao chép liên kết/i),
    ).toBeInTheDocument();
  });

  it("disables prev button when prevHref is null", () => {
    render(<WatchActionBar {...defaultProps} prevHref={null} />);
    expect(screen.queryByRole("link", { name: /tập trước/i })).toBeNull();
    expect(screen.getByLabelText("Tập trước")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
