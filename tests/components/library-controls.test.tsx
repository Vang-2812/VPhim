import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LibraryControls } from "@/features/library/library-controls";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

it("renders login links when user is not logged in", () => {
  render(
    <LibraryControls
      slug="test-movie"
      initialMember={false}
      initialSelected={false}
      initialPlaylists={[]}
    />,
  );
  const favLink = screen.getByRole("link", { name: "Yêu thích" });
  expect(favLink).toHaveAttribute("href", "/dang-nhap?next=%2Fphim%2Ftest-movie");
  const listLink = screen.getByRole("link", { name: "Danh sách" });
  expect(listLink).toHaveAttribute("href", "/dang-nhap?next=%2Fphim%2Ftest-movie");
});

it("renders interactive button and playlist link when user is logged in with no playlists", () => {
  render(
    <LibraryControls
      slug="test-movie"
      initialMember={true}
      initialSelected={false}
      initialPlaylists={[]}
    />,
  );
  const favBtn = screen.getByRole("button", { name: "Yêu thích" });
  expect(favBtn).toBeInTheDocument();
  expect(favBtn).not.toHaveAttribute("href");

  const createListLink = screen.getByRole("link", { name: /Tạo danh sách/i });
  expect(createListLink).toHaveAttribute("href", "/tai-khoan/danh-sach");
});

it("renders select dropdown when user is logged in with playlists", () => {
  render(
    <LibraryControls
      slug="test-movie"
      initialMember={true}
      initialSelected={true}
      initialPlaylists={[{ id: "p1", name: "Phim Anime hay" }]}
    />,
  );
  const favBtn = screen.getByRole("button", { name: "Đã yêu thích" });
  expect(favBtn).toBeInTheDocument();

  const select = screen.getByRole("combobox", { name: "Thêm vào danh sách" });
  expect(select).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Phim Anime hay" })).toBeInTheDocument();
});
