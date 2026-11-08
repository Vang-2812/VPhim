import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HeaderSearch } from "@/components/layout/header-search";

afterEach(() => vi.unstubAllGlobals());

const movie = (slug: string, title: string) => ({
  slug,
  title,
  posterUrl: null,
  year: 2026,
  quality: "HD",
});

it("keeps search in the header and submits to Khám phá only by form action", () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  render(<HeaderSearch />);

  const input = screen.getByRole("searchbox", { name: "Tìm phim" });
  const form = input.closest("form");
  expect(form).toHaveAttribute("action", "/kham-pha");
  expect(form).toHaveAttribute("method", "get");
  expect(input).toHaveAttribute("name", "keyword");
  expect(screen.getByRole("button", { name: "Tìm kiếm" })).toHaveAttribute(
    "type",
    "submit",
  );
  fireEvent.change(input, { target: { value: "Batman" } });
  expect(input).toHaveValue("Batman");
  expect(window.location.pathname).not.toBe("/kham-pha");
});

it("does not request suggestions for whitespace or one character", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  render(<HeaderSearch />);
  const input = screen.getByRole("searchbox", { name: "Tìm phim" });
  fireEvent.change(input, { target: { value: " " } });
  fireEvent.change(input, { target: { value: "b" } });
  await new Promise((resolve) => setTimeout(resolve, 350));
  expect(fetcher).not.toHaveBeenCalled();
});

it("shows up to date suggestions after typing and links directly to a movie", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ items: [movie("batman", "Batman")] })),
  );
  render(<HeaderSearch />);
  fireEvent.change(screen.getByRole("searchbox", { name: "Tìm phim" }), {
    target: { value: "Batman" },
  });
  const suggestion = await screen.findByRole("link", { name: /Batman/ });
  expect(suggestion).toHaveAttribute("href", "/phim/batman");
  fireEvent.keyDown(screen.getByRole("searchbox", { name: "Tìm phim" }), {
    key: "Escape",
  });
  expect(
    screen.queryByRole("link", { name: /Batman/ }),
  ).not.toBeInTheDocument();
});

it("ignores a late response for an older keyword", async () => {
  let resolveOld!: (value: Response) => void;
  const oldResponse = new Promise<Response>(
    (resolve) => (resolveOld = resolve),
  );
  const fetcher = vi
    .fn()
    .mockImplementationOnce(() => oldResponse)
    .mockImplementationOnce(async () =>
      Response.json({ items: [movie("batman", "Batman mới")] }),
    );
  vi.stubGlobal("fetch", fetcher);
  render(<HeaderSearch />);
  const input = screen.getByRole("searchbox", { name: "Tìm phim" });
  fireEvent.change(input, { target: { value: "bat" } });
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  fireEvent.change(input, { target: { value: "batman" } });
  expect(
    await screen.findByRole("link", { name: /Batman mới/ }),
  ).toBeInTheDocument();
  resolveOld(Response.json({ items: [movie("old", "Kết quả cũ")] }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(screen.queryByText("Kết quả cũ")).not.toBeInTheDocument();
});

it("shows a recoverable state on suggestion error and closes outside", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json(
        { items: [], error: "Tạm thời chưa tải được" },
        { status: 503 },
      ),
    ),
  );
  render(<HeaderSearch />);
  fireEvent.change(screen.getByRole("searchbox", { name: "Tìm phim" }), {
    target: { value: "Batman" },
  });
  expect(await screen.findByText("Tạm thời chưa tải được")).toBeInTheDocument();
  fireEvent.pointerDown(document.body);
  expect(screen.queryByText("Tạm thời chưa tải được")).not.toBeInTheDocument();
});

it("keeps settled suggestions when surrounding whitespace changes", async () => {
  const fetcher = vi.fn(async () =>
    Response.json({ items: [movie("batman", "Batman")] }),
  );
  vi.stubGlobal("fetch", fetcher);
  render(<HeaderSearch />);
  const input = screen.getByRole("searchbox", { name: "Tìm phim" });
  fireEvent.change(input, { target: { value: "Batman" } });
  expect(
    await screen.findByRole("link", { name: /Batman/ }),
  ).toBeInTheDocument();

  fireEvent.change(input, { target: { value: " Batman " } });
  expect(screen.getByRole("link", { name: /Batman/ })).toBeInTheDocument();
  expect(screen.queryByText("Đang tìm phim…")).not.toBeInTheDocument();
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it("closes suggestions with Escape from a focused result and returns focus to search", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ items: [movie("batman", "Batman")] })),
  );
  render(<HeaderSearch />);
  const input = screen.getByRole("searchbox", { name: "Tìm phim" });
  fireEvent.change(input, { target: { value: "Batman" } });
  const suggestion = await screen.findByRole("link", { name: /Batman/ });
  suggestion.focus();
  fireEvent.keyDown(suggestion, { key: "Escape" });
  expect(
    screen.queryByRole("link", { name: /Batman/ }),
  ).not.toBeInTheDocument();
  expect(input).toHaveFocus();
});
