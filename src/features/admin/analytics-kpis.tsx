import { Eye, Users, Play, UserPlus } from "lucide-react";
import type { AdminAnalyticsData } from "./analytics.types";

export function AnalyticsKpis({ data }: { data: AdminAnalyticsData }) {
  const kpis = [
    {
      title: "Lượt xem trang",
      today: data.todayPageviews,
      total: data.totalPageviews,
      todayLabel: "hôm nay",
      totalLabel: "tổng lượt xem",
      icon: Eye,
      color: "var(--color-accent, #f59e0b)",
    },
    {
      title: "Khách truy cập",
      today: data.todayVisitors,
      total: null,
      todayLabel: "hôm nay (duy nhất)",
      totalLabel: null,
      icon: Users,
      color: "#3b82f6",
    },
    {
      title: "Lượt phát phim",
      today: data.todayWatchSessions,
      total: data.totalWatchSessions,
      todayLabel: "phiên xem hôm nay",
      totalLabel: "tổng phiên xem",
      icon: Play,
      color: "#10b981",
    },
    {
      title: "Tổng thành viên",
      today: data.todayNewUsers,
      total: data.totalUsers,
      todayLabel: "đăng ký mới hôm nay",
      totalLabel: "tổng tài khoản",
      icon: UserPlus,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="analytics-kpi-grid">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="analytics-kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">{kpi.title}</span>
              <div
                className="kpi-icon-wrap"
                style={{ color: kpi.color, background: `${kpi.color}15` }}
              >
                <Icon size={18} />
              </div>
            </div>
            <div className="kpi-main-val">
              {kpi.today.toLocaleString("vi-VN")}
              <span className="kpi-period">{kpi.todayLabel}</span>
            </div>
            {kpi.total !== null && (
              <div className="kpi-sub-val">
                <span>{kpi.totalLabel}:</span>
                <strong>{kpi.total.toLocaleString("vi-VN")}</strong>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
