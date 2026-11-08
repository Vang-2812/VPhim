import type { DailyTrendItem } from "./analytics.types";

export function AnalyticsChart({ trends }: { trends: DailyTrendItem[] }) {
  if (!trends || trends.length === 0) {
    return (
      <div className="analytics-card chart-card">
        <h3 className="analytics-card-title">Xu hướng truy cập 7 ngày qua</h3>
        <p className="analytics-empty-hint">Chưa có dữ liệu xu hướng.</p>
      </div>
    );
  }

  const maxVal = Math.max(
    ...trends.map((t) => Math.max(t.pageviews, t.watchSessions, t.visitors)),
    10,
  );

  return (
    <div className="analytics-card chart-card">
      <div className="chart-header">
        <h3 className="analytics-card-title">Xu hướng truy cập 7 ngày qua</h3>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color pv" /> Lượt xem trang
          </span>
          <span className="legend-item">
            <span className="legend-color uv" /> Khách duy nhất
          </span>
          <span className="legend-item">
            <span className="legend-color ws" /> Lượt xem phim
          </span>
        </div>
      </div>

      <div className="chart-bars-container">
        {trends.map((item) => {
          const [, month, day] = item.date.split("-");
          const dateLabel = month && day ? `${day}/${month}` : item.date;

          const pvHeight = Math.max(4, Math.round((item.pageviews / maxVal) * 100));
          const uvHeight = Math.max(4, Math.round((item.visitors / maxVal) * 100));
          const wsHeight = Math.max(4, Math.round((item.watchSessions / maxVal) * 100));

          return (
            <div key={item.date} className="chart-column">
              <div className="chart-bars-track">
                <div
                  className="chart-bar pv"
                  style={{ height: `${pvHeight}%` }}
                  title={`${dateLabel}: ${item.pageviews} lượt xem trang`}
                />
                <div
                  className="chart-bar uv"
                  style={{ height: `${uvHeight}%` }}
                  title={`${dateLabel}: ${item.visitors} khách duy nhất`}
                />
                <div
                  className="chart-bar ws"
                  style={{ height: `${wsHeight}%` }}
                  title={`${dateLabel}: ${item.watchSessions} lượt phát phim`}
                />
              </div>
              <span className="chart-day-label">{dateLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
