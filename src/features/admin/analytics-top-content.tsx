import Link from "next/link";
import Image from "next/image";
import { Film, Globe } from "lucide-react";
import type { TopMovieItem, TopPageItem } from "./analytics.types";

export function AnalyticsTopContent({
  topMovies,
  topPages,
}: {
  topMovies: TopMovieItem[];
  topPages: TopPageItem[];
}) {
  return (
    <div className="analytics-content-grid">
      {/* Top Movies */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <Film size={18} className="text-amber" />
          <h3 className="analytics-card-title">Top phim xem nhiều nhất</h3>
        </div>

        {topMovies.length === 0 ? (
          <p className="analytics-empty-hint">Chưa có lượt xem phim nào.</p>
        ) : (
          <div className="top-movies-list">
            {topMovies.map((movie, index) => (
              <div key={movie.id} className="top-movie-item">
                <span className="top-rank">#{index + 1}</span>
                {movie.posterUrl ? (
                  <div className="top-movie-thumb">
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      width={36}
                      height={48}
                      className="thumb-img"
                    />
                  </div>
                ) : (
                  <div className="top-movie-thumb placeholder">
                    <Film size={16} />
                  </div>
                )}
                <div className="top-movie-info">
                  <Link href={`/phim/${movie.slug}`} className="top-movie-title">
                    {movie.title}
                  </Link>
                  <span className="top-movie-views">
                    {movie.watchCount.toLocaleString("vi-VN")} lượt phát
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Visited Pages */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <Globe size={18} className="text-blue" />
          <h3 className="analytics-card-title">Trang truy cập nhiều nhất</h3>
        </div>

        {topPages.length === 0 ? (
          <p className="analytics-empty-hint">Chưa có dữ liệu lượt truy cập trang.</p>
        ) : (
          <div className="top-pages-list">
            {topPages.map((page, index) => (
              <div key={page.path} className="top-page-item">
                <span className="top-rank">#{index + 1}</span>
                <span className="top-page-path" title={page.path}>
                  {page.path === "/" ? "/ (Trang chủ)" : page.path}
                </span>
                <span className="top-page-count">
                  {page.views.toLocaleString("vi-VN")} lượt
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
