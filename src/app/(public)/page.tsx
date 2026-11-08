import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Play, ChevronRight } from "lucide-react";
import { listMovies, getMovie } from "@/features/movies/client.server";
import { MovieGrid } from "@/features/movies/movie-grid";
import { Feedback, RetryLink } from "@/components/ui/feedback";
import { ContinueStrip } from "@/features/playback/continue-strip";
export const dynamic = "force-dynamic";
export default async function Home() {
  const result = await listMovies({ page: 1 });
  if (!result.ok)
    return (
      <div className="container">
        <Feedback
          title="Một chút gián đoạn"
          message={result.message}
          kind="error"
        >
          <RetryLink />
          <Link className="button" href="/kham-pha">
            Khám phá phim
          </Link>
        </Feedback>
      </div>
    );
  const movies = result.data.items,
    first = movies[0],
    detail = first ? await getMovie(first.slug) : null,
    featured = detail?.ok ? detail.data : first;
  return (
    <>
      <div className="container">
        {featured && (
          <section className="hero">
            <div className="hero-backdrop" aria-hidden="true">
              {(featured.thumbUrl || featured.posterUrl) && (
                <img
                  src={(featured.thumbUrl || featured.posterUrl)!}
                  alt=""
                  fetchPriority="high"
                />
              )}
            </div>
            <div className="hero-copy">
              <p className="hero-eyebrow">Phim mới cập nhật</p>
              <h1>{featured.title}</h1>
              <div className="hero-meta">
                {featured.year && <span>{featured.year}</span>}
                {featured.quality && <span>{featured.quality}</span>}
              </div>
              {featured.originalTitle && (
                <p className="original-title">{featured.originalTitle}</p>
              )}
              <p className="hero-description">
                {detail?.ok
                  ? detail.data.description
                  : "Một câu chuyện mới đang chờ bạn khám phá."}
              </p>
              <div className="hero-actions">
                <Link className="button" href={"/xem/" + featured.slug}>
                  <Play size={17} fill="currentColor" />
                  Xem ngay
                </Link>
                <Link className="button secondary" href={"/phim/" + featured.slug}>
                  Thông tin phim
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </div>
          </section>
        )}
        <div className="genre-links">
          {[
            ["hanh-dong", "Hành động"],
            ["tinh-cam", "Tình cảm"],
            ["hai-huoc", "Hài hước"],
            ["khoa-hoc", "Khoa học"],
            ["kinh-di", "Kinh dị"],
          ].map(([slug, name]) => (
            <Link key={slug} href={"/kham-pha?category=" + slug}>
              {name}
              <ChevronRight size={14} />
            </Link>
          ))}
        </div>
        <Suspense fallback={null}>
          <ContinueStrip />
        </Suspense>
        <section className="movie-section">
          <div className="section-heading">
            <div>
              <h2>Mới lên sóng</h2>
              <p>Những câu chuyện vừa có mặt trên VPhim.</p>
            </div>
            <Link className="text-link" href="/kham-pha">
              Tất cả phim
              <ChevronRight size={16} />
            </Link>
          </div>
          {movies.length ? (
            <MovieGrid items={movies.slice(0, 18)} variant="rail" />
          ) : (
            <Feedback
              title="Chưa có phim mới"
              message="Hãy quay lại sau một chút."
            />
          )}
        </section>
        <section className="discovery-band">
          <div>
            <h2>Hôm nay, bạn muốn xem gì?</h2>
            <p>Từ một bộ phim ngắn cho đến một câu chuyện dài tập.</p>
          </div>
          <Link className="button secondary" href="/kham-pha">
            Tìm phim của bạn
            <ArrowUpRight size={17} />
          </Link>
        </section>
      </div>
    </>
  );
}
