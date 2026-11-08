import { getAdminAnalytics } from "@/features/admin/analytics.server";
import { AnalyticsKpis } from "@/features/admin/analytics-kpis";
import { AnalyticsChart } from "@/features/admin/analytics-chart";
import { AnalyticsDevices } from "@/features/admin/analytics-devices";
import { AnalyticsTopContent } from "@/features/admin/analytics-top-content";
import { Feedback } from "@/components/ui/feedback";

export const metadata = { title: "Tổng quan & Thống kê | Quản trị" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const result = await getAdminAnalytics();
  if (!result.ok) {
    return (
      <Feedback
        title="Không tải được thống kê"
        message={result.message}
        kind="error"
      />
    );
  }

  const { data } = result;

  return (
    <div className="admin-analytics-view">
      <div className="admin-page-header">
        <div>
          <h1>Tổng quan & Thống kê</h1>
          <p className="account-description">
            Theo dõi lưu lượng truy cập, khách ghé thăm và xu hướng xem phim thực tế.
          </p>
        </div>
      </div>

      <AnalyticsKpis data={data} />

      <div className="analytics-middle-grid">
        <AnalyticsChart trends={data.dailyTrends} />
        <AnalyticsDevices breakdown={data.deviceBreakdown} />
      </div>

      <AnalyticsTopContent
        topMovies={data.topMovies}
        topPages={data.topPages}
      />
    </div>
  );
}
