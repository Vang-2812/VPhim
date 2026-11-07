import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
const actions = vi.hoisted(() => ({ getLibraryState: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/config/public", () => ({ isAuthConfigured: () => true }));
vi.mock("@/features/library/actions", () => ({
  ...actions,
  setFavorite: vi.fn(),
  setPlaylistMovie: vi.fn(),
}));
import { LibraryControls } from "@/features/library/library-controls";
it("uses an explicit SSR guest result without a redundant server action", () => {
  actions.getLibraryState.mockResolvedValue({
    ok: false,
    code: "UNAUTHENTICATED",
  });
  render(<LibraryControls slug="a" initialMember={false} />);
  expect(screen.getByRole("link", { name: "Yêu thích" })).toHaveAttribute(
    "href",
    "/dang-nhap?next=%2Fphim%2Fa",
  );
  expect(actions.getLibraryState).not.toHaveBeenCalled();
});
