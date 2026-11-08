import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  WebSiteJsonLd,
  MovieJsonLd,
  VideoObjectJsonLd,
  BreadcrumbJsonLd,
  FaqJsonLd,
} from "@/lib/seo/schema-org";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import type { MovieDetail } from "@/features/movies/types";

const mockMovie: MovieDetail = {
  id: "m-1",
  slug: "gia-toc-rong-phan-3",
  title: "Gia Tộc Rồng (Phần 3)",
  originalTitle: "House of the Dragon Season 3",
  posterUrl: "https://example.com/poster.jpg",
  thumbUrl: "https://example.com/thumb.jpg",
  year: 2026,
  quality: "FHD",
  language: "Vietsub",
  description: "Trận chiến giữa các nhánh gia tộc Targaryen tiếp tục khốc liệt.",
  genres: ["Hành Động", "Viễn Tưởng", "Phim Bộ"],
  countries: ["Âu Mỹ"],
  servers: [
    {
      key: "vip",
      label: "VIP Vietsub",
      episodes: [
        {
          key: "tap-1",
          label: "Tập 1",
          slug: "tap-1",
          hlsUrl: "https://example.com/stream.m3u8",
          embedUrl: null,
        },
      ],
    },
  ],
  actors: ["Matt Smith", "Emma D'Arcy"],
  director: ["Ryan Condal"],
  duration: "60 phút/tập",
  status: "Đang phát sóng",
};

describe("SEO and Schema.org JSON-LD Components", () => {
  it("renders WebSite JSON-LD schema with SearchAction", () => {
    const { container } = render(<WebSiteJsonLd origin="https://vphim.vn" />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const data = JSON.parse(script!.innerHTML);
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBe("VPhim");
    expect(data.potentialAction["@type"]).toBe("SearchAction");
  });

  it("renders Movie/TVSeries JSON-LD schema with actors and watch action", () => {
    const { container } = render(
      <MovieJsonLd movie={mockMovie} origin="https://vphim.vn" />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const data = JSON.parse(script!.innerHTML);
    expect(["Movie", "TVSeries"]).toContain(data["@type"]);
    expect(data.name).toBe("Gia Tộc Rồng (Phần 3)");
    expect(data.actor).toHaveLength(2);
    expect(data.potentialAction["@type"]).toBe("WatchAction");
  });

  it("renders VideoObject JSON-LD schema for watch pages", () => {
    const { container } = render(
      <VideoObjectJsonLd
        movie={mockMovie}
        episodeLabel="Tập 1"
        origin="https://vphim.vn"
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const data = JSON.parse(script!.innerHTML);
    expect(data["@type"]).toBe("VideoObject");
    expect(data.name).toContain("Tập 1");
    expect(data.thumbnailUrl).toBeDefined();
  });

  it("renders BreadcrumbList JSON-LD schema", () => {
    const items = [
      { name: "Trang chủ", url: "https://vphim.vn" },
      { name: "Khám phá", url: "https://vphim.vn/kham-pha" },
    ];
    const { container } = render(<BreadcrumbJsonLd items={items} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const data = JSON.parse(script!.innerHTML);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[0].position).toBe(1);
  });

  it("renders FAQPage JSON-LD schema for GEO", () => {
    const faqs = [
      {
        question: "Phim có Vietsub không?",
        answer: "Có, VPhim hỗ trợ Vietsub Full HD.",
      },
    ];
    const { container } = render(<FaqJsonLd faqs={faqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const data = JSON.parse(script!.innerHTML);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity[0].name).toBe("Phim có Vietsub không?");
    expect(data.mainEntity[0].acceptedAnswer.text).toContain("Full HD");
  });

  it("configures robots.txt allowing search and AI engines while protecting admin routes", () => {
    const robotRules = robots();
    expect(robotRules.rules).toBeDefined();
    expect(robotRules.sitemap).toContain("/sitemap.xml");

    const rulesArr = Array.isArray(robotRules.rules)
      ? robotRules.rules
      : [robotRules.rules];
    const generalRule = rulesArr.find((r) => r.userAgent === "*");
    expect(generalRule).toBeDefined();
    expect(generalRule?.disallow).toContain("/admin/*");

    const aiRule = rulesArr.find((r) => Array.isArray(r.userAgent));
    expect(aiRule).toBeDefined();
    expect(aiRule?.userAgent).toContain("GPTBot");
    expect(aiRule?.userAgent).toContain("PerplexityBot");
  });

  it("generates sitemap including core pages", async () => {
    const map = await sitemap();
    expect(map.length).toBeGreaterThanOrEqual(3);
    const urls = map.map((item) => item.url);
    expect(urls.some((u) => u.endsWith("/kham-pha"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/dieu-khoan"))).toBe(true);
  });
});
