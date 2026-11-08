import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsKpis } from "@/features/admin/analytics-kpis";
import { AnalyticsDevices } from "@/features/admin/analytics-devices";
import { AnalyticsTopContent } from "@/features/admin/analytics-top-content";
import { AnalyticsChart } from "@/features/admin/analytics-chart";
import type { AdminAnalyticsData } from "@/features/admin/analytics.types";

const mockAnalyticsData: AdminAnalyticsData = {
  totalPageviews: 12450,
  todayPageviews: 820,
  todayVisitors: 340,
  totalWatchSessions: 4200,
  todayWatchSessions: 260,
  totalUsers: 1500,
  todayNewUsers: 15,
  dailyTrends: [
    { date: "2026-11-02", pageviews: 500, visitors: 200, watchSessions: 180 },
    { date: "2026-11-03", pageviews: 650, visitors: 240, watchSessions: 210 },
    { date: "2026-11-04", pageviews: 700, visitors: 280, watchSessions: 230 },
    { date: "2026-11-05", pageviews: 750, visitors: 300, watchSessions: 250 },
    { date: "2026-11-06", pageviews: 800, visitors: 320, watchSessions: 270 },
    { date: "2026-11-07", pageviews: 900, visitors: 360, watchSessions: 300 },
    { date: "2026-11-08", pageviews: 820, visitors: 340, watchSessions: 260 },
  ],
  deviceBreakdown: {
    mobile: 650,
    desktop: 300,
    tablet: 50,
    total: 1000,
  },
  topMovies: [
    {
      id: "movie-1",
      title: "Gia Tộc Rồng (Phần 3)",
      slug: "gia-toc-rong-phan-3",
      posterUrl: "https://example.com/poster1.jpg",
      watchCount: 1420,
    },
    {
      id: "movie-2",
      title: "Gia Đình Là Số 1 (Phần 2)",
      slug: "gia-dinh-la-so-1-phan-2",
      posterUrl: null,
      watchCount: 890,
    },
  ],
  topPages: [
    { path: "/", views: 4200 },
    { path: "/kham-pha", views: 2100 },
    { path: "/phim/gia-toc-rong-phan-3", views: 1800 },
  ],
};

describe("Admin Analytics Components", () => {
  it("renders KPI cards with correct metric values", () => {
    render(<AnalyticsKpis data={mockAnalyticsData} />);

    expect(screen.getByText("Lượt xem trang")).toBeInTheDocument();
    expect(screen.getByText("Khách truy cập")).toBeInTheDocument();
    expect(screen.getByText("Lượt phát phim")).toBeInTheDocument();
    expect(screen.getByText("Tổng thành viên")).toBeInTheDocument();

    expect(screen.getByText("820")).toBeInTheDocument();
    expect(screen.getByText("340")).toBeInTheDocument();
    expect(screen.getByText("260")).toBeInTheDocument();
  });

  it("renders 7-day trend chart with legends and day labels", () => {
    render(<AnalyticsChart trends={mockAnalyticsData.dailyTrends} />);

    expect(
      screen.getByText("Xu hướng truy cập 7 ngày qua"),
    ).toBeInTheDocument();
    expect(screen.getByText("Lượt xem trang")).toBeInTheDocument();
    expect(screen.getByText("Khách duy nhất")).toBeInTheDocument();
    expect(screen.getByText("08/11")).toBeInTheDocument();
  });

  it("renders device distribution breakdown percentages", () => {
    render(<AnalyticsDevices breakdown={mockAnalyticsData.deviceBreakdown} />);

    expect(
      screen.getByText("Thiết bị truy cập (30 ngày)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Di động")).toBeInTheDocument();
    expect(screen.getByText("Máy tính")).toBeInTheDocument();
    expect(screen.getByText("Máy tính bảng")).toBeInTheDocument();
    expect(screen.getByText("65%")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  it("renders top movies and top pages lists", () => {
    render(
      <AnalyticsTopContent
        topMovies={mockAnalyticsData.topMovies}
        topPages={mockAnalyticsData.topPages}
      />,
    );

    expect(screen.getByText("Top phim xem nhiều nhất")).toBeInTheDocument();
    expect(screen.getByText("Gia Tộc Rồng (Phần 3)")).toBeInTheDocument();
    expect(screen.getByText("1.420 lượt phát")).toBeInTheDocument();

    expect(screen.getByText("Trang truy cập nhiều nhất")).toBeInTheDocument();
    expect(screen.getByText("/ (Trang chủ)")).toBeInTheDocument();
    expect(screen.getByText("4.200 lượt")).toBeInTheDocument();
  });
});
