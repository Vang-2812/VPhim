import { it, expect } from "vitest";
import { parseBrowseQuery, changeBrowseQuery } from "@/features/movies/query";
it("normalizes malformed pages and rejects unknown types", () => {
  expect(parseBrowseQuery(new URLSearchParams("page=-1&type=evil")).page).toBe(
    1,
  );
  expect(
    parseBrowseQuery(new URLSearchParams("page=NaN&type=evil")).type,
  ).toBeUndefined();
});
it("filter changes preserve keyword and country while resetting pagination", () =>
  expect(
    changeBrowseQuery(
      "keyword=hello&country=han-quoc&page=5",
      "category",
      "hanh-dong",
    ),
  ).toBe("keyword=hello&country=han-quoc&page=1&category=hanh-dong"));
