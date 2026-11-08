import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteNav } from "@/components/layout/site-nav";

const locationState = vi.hoisted(() => ({ path: "/", query: "" }));

vi.mock("next/navigation", () => ({
  usePathname: () => locationState.path,
  useSearchParams: () => new URLSearchParams(locationState.query),
}));

it.each([
  ["/kham-pha", "", "Khám phá"],
  ["/kham-pha", "keyword=batman", "Khám phá"],
  ["/kham-pha", "type=phim-le", "Phim lẻ"],
  ["/kham-pha", "type=phim-bo", "Phim bộ"],
  ["/kham-pha", "type=hoat-hinh", "Hoạt hình"],
])("marks the current nav item for %s?%s", (path, query, label) => {
  locationState.path = path;
  locationState.query = query;
  render(<SiteNav mobile={false} />);
  expect(screen.getByRole("link", { name: label })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(
    screen
      .getAllByRole("link")
      .filter((link) => link.hasAttribute("aria-current")),
  ).toHaveLength(1);
});

it("shows no active catalog link outside Khám phá", () => {
  locationState.path = "/phim/batman";
  locationState.query = "";
  render(<SiteNav mobile />);
  expect(
    screen
      .getAllByRole("link")
      .some((link) => link.hasAttribute("aria-current")),
  ).toBe(false);
});
