import { Smartphone, Monitor, Tablet } from "lucide-react";
import type { DeviceBreakdown } from "./analytics.types";

export function AnalyticsDevices({ breakdown }: { breakdown: DeviceBreakdown }) {
  const total = Math.max(1, breakdown.total || breakdown.mobile + breakdown.desktop + breakdown.tablet);
  const mobilePct = Math.round((breakdown.mobile / total) * 100);
  const desktopPct = Math.round((breakdown.desktop / total) * 100);
  const tabletPct = Math.max(0, 100 - mobilePct - desktopPct);

  return (
    <div className="analytics-card devices-card">
      <h3 className="analytics-card-title">Thiết bị truy cập (30 ngày)</h3>

      <div className="device-progress-bar">
        {mobilePct > 0 && (
          <div
            className="device-segment mobile"
            style={{ width: `${mobilePct}%` }}
            title={`Di động: ${mobilePct}% (${breakdown.mobile})`}
          />
        )}
        {desktopPct > 0 && (
          <div
            className="device-segment desktop"
            style={{ width: `${desktopPct}%` }}
            title={`Máy tính: ${desktopPct}% (${breakdown.desktop})`}
          />
        )}
        {tabletPct > 0 && (
          <div
            className="device-segment tablet"
            style={{ width: `${tabletPct}%` }}
            title={`Máy tính bảng: ${tabletPct}% (${breakdown.tablet})`}
          />
        )}
      </div>

      <div className="device-stats-grid">
        <div className="device-stat-item">
          <div className="device-stat-header">
            <Smartphone size={16} className="text-amber" />
            <span>Di động</span>
          </div>
          <span className="device-stat-pct">{mobilePct}%</span>
          <span className="device-stat-count">{breakdown.mobile.toLocaleString("vi-VN")} lượt</span>
        </div>

        <div className="device-stat-item">
          <div className="device-stat-header">
            <Monitor size={16} className="text-blue" />
            <span>Máy tính</span>
          </div>
          <span className="device-stat-pct">{desktopPct}%</span>
          <span className="device-stat-count">{breakdown.desktop.toLocaleString("vi-VN")} lượt</span>
        </div>

        <div className="device-stat-item">
          <div className="device-stat-header">
            <Tablet size={16} className="text-green" />
            <span>Máy tính bảng</span>
          </div>
          <span className="device-stat-pct">{tabletPct}%</span>
          <span className="device-stat-count">{breakdown.tablet.toLocaleString("vi-VN")} lượt</span>
        </div>
      </div>
    </div>
  );
}
