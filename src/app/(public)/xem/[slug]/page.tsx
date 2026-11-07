import Link from "next/link";
import { Suspense } from "react";
import type { MovieDetail } from "@/features/movies/types";
import { notFound } from "next/navigation";
import { getMovie } from "@/features/movies/client.server";
import { selectPlayback } from "@/features/playback/selection";
import { WatchScreen } from "@/features/playback/watch-screen";
import { getMovieResume } from "@/features/playback/progress.server";
import { getOptionalMember } from "@/features/auth/context.server";
import { Feedback, RetryLink } from "@/components/ui/feedback";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const r = await getMovie((await params).slug);
  return { title: r.ok ? "Xem " + r.data.title : "Xem phim" };
}
export default async function Watch({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ server?: string; episode?: string }>;
}) {
  const slug = (await params).slug,
    r = await getMovie(slug);
  if (!r.ok) {
    if (r.code === "NOT_FOUND") notFound();
    return (
      <div className="container">
        <Feedback title="Chưa tải được phim" message={r.message} kind="error">
          <RetryLink />
        </Feedback>
      </div>
    );
  }
  const p = await searchParams;
  return (
    <div className="container page-space">
      <Suspense
        fallback={
          <div role="status">
            <h1>{r.data.title}</h1>
            <p className="muted">Đang chọn tập và khôi phục vị trí xem…</p>
            <div
              className="skeleton"
              style={{ aspectRatio: "16 / 9", marginTop: "var(--space-lg)" }}
            />
          </div>
        }
      >
        <WatchContent movie={r.data} requested={p} />
      </Suspense>
    </div>
  );
}
async function WatchContent({
  movie,
  requested: p,
}: {
  movie: MovieDetail;
  requested: { server?: string; episode?: string };
}) {
  let serverKey = p.server;
  let episodeKey = p.episode;
  if (!episodeKey) {
    const resume = await getMovieResume(movie.slug);
    if (!resume.ok)
      return (
        <Feedback
          title="Chưa khôi phục được tập đang xem"
          message={resume.message}
          kind="error"
        >
          <RetryLink
            href={
              "/xem/" +
              movie.slug +
              (p.server ? "?" + new URLSearchParams({ server: p.server }) : "")
            }
          />
          <Link className="button" href={"/phim/" + movie.slug}>
            Tự chọn tập
          </Link>
        </Feedback>
      );
    if (resume.ok && resume.data) {
      episodeKey = resume.data.episodeKey;
      serverKey = serverKey || resume.data.serverKey;
    }
  }
  const s = selectPlayback(movie, { serverKey, episodeKey });
  return (
    <>
      {s.ok ? (
        <WatchScreen
          key={s.data.server.key + "/" + s.data.episode.key}
          movie={movie}
          selection={s.data}
          member={Boolean(await getOptionalMember())}
        />
      ) : (
        <Feedback title="Chọn lại tập phim" message={s.message}>
          <Link className="button" href={"/phim/" + movie.slug}>
            Xem danh sách tập
          </Link>
        </Feedback>
      )}
    </>
  );
}
