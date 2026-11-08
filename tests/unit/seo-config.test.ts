import { describe, it, expect } from "vitest";
import {
  getSiteOrigin,
  cleanDescription,
  buildMovieTitle,
} from "@/lib/seo/config";

describe("SEO Config and Helpers", () => {
  it("resolves valid site origin without trailing slash", () => {
    const origin = getSiteOrigin();
    expect(origin).toMatch(/^https?:\/\//);
    expect(origin.endsWith("/")).toBe(false);
  });

  it("cleans HTML tags and entities from descriptions", () => {
    const raw = "<p>Phim hành động <b>Gia Tộc Rồng</b> &amp; kịch tính &quot;đỉnh cao&quot;.</p>";
    const cleaned = cleanDescription(raw);
    expect(cleaned).toBe("Phim hành động Gia Tộc Rồng & kịch tính \"đỉnh cao\".");
    expect(cleaned).not.toContain("<p>");
    expect(cleaned).not.toContain("&amp;");
  });

  it("truncates long descriptions cleanly at word boundary", () => {
    const long =
      "Đây là một bộ phim vô cùng hấp dẫn với sự tham gia của nhiều diễn viên nổi tiếng trên toàn cầu cùng cốt truyện lôi cuốn và kỹ xảo điện ảnh đỉnh cao của năm 2026.";
    const truncated = cleanDescription(long, 50);
    expect(truncated.length).toBeLessThanOrEqual(53);
    expect(truncated.endsWith("...")).toBe(true);
  });

  it("provides fallback description for null/empty input", () => {
    const fallback = cleanDescription(null);
    expect(fallback).toContain("VPhim");
  });

  it("builds consistent movie titles for SEO", () => {
    const title = buildMovieTitle({
      title: "Gia Tộc Rồng",
      year: 2026,
    });
    expect(title).toBe("Gia Tộc Rồng (2026) - Vietsub / Thuyết minh Full HD | VPhim");

    const noYear = buildMovieTitle({
      title: "One Piece",
    });
    expect(noYear).toBe("One Piece - Vietsub / Thuyết minh Full HD | VPhim");
  });
});
