import Link from "next/link";
import { Play, Film } from "lucide-react";
import type { MovieSummary } from "./types";
export function MovieGrid({ items }: { items: MovieSummary[] }) {
  return (
    <div className="movie-grid">
      {items.map((movie) => (
        <Link
          href={"/phim/" + movie.slug}
          className="movie-card"
          key={movie.id}
        >
          <div className="poster">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt="" loading="lazy" />
            ) : (
              <span className="poster-fallback">
                <Film size={28} />
                {movie.title}
              </span>
            )}
            {movie.quality && <span className="quality">{movie.quality}</span>}
            <span className="poster-play">
              <Play size={24} fill="currentColor" />
            </span>
          </div>
          <h3>{movie.title}</h3>
          <p>{movie.originalTitle || movie.language || "Xem thông tin phim"}</p>
          <span className="movie-year">{movie.year || ""}</span>
        </Link>
      ))}
    </div>
  );
}
