import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovie } from "@/features/movies/client.server";
import { selectPlayback } from "@/features/playback/selection";
import { WatchScreen } from "@/features/playback/watch-screen";
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
  const p = await searchParams,
    s = selectPlayback(r.data, { serverKey: p.server, episodeKey: p.episode });
  return (
    <div className="container page-space">
      {s.ok ? (
        <WatchScreen
          key={s.data.server.key + "/" + s.data.episode.key}
          movie={r.data}
          selection={s.data}
          member={Boolean(await getOptionalMember())}
        />
      ) : (
        <Feedback title="Chọn lại tập phim" message={s.message}>
          <Link className="button" href={"/phim/" + slug}>
            Xem danh sách tập
          </Link>
        </Feedback>
      )}
    </div>
  );
}
