import Link from "next/link";
import { getContinueWatching } from "@/features/playback/progress.server";
import { ContinueCard } from "@/features/playback/continue-strip";
import { HistoryRemove } from "@/features/playback/history-remove";
import { Feedback } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
export const metadata = { title: "Xem tiếp" };
export default async function History({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const r = await getContinueWatching(Number((await searchParams).page) || 1);
  return (
    <>
      <h1>Xem tiếp</h1>
      <p className="account-description">
        Câu chuyện vẫn ở đây, chờ bạn quay lại.
      </p>
      {!r.ok ? (
        <Feedback
          title="Chưa tải được lịch sử"
          message={r.message}
          kind="error"
        />
      ) : r.data.items.length ? (
        <>
          <div className="continue-grid">
            {r.data.items.map((i) => (
              <article key={i.movie.id}>
                <ContinueCard item={i} />
                <HistoryRemove id={i.movie.id} />
              </article>
            ))}
          </div>
          <Pagination page={r.data.page} totalPages={r.data.totalPages} />
        </>
      ) : (
        <Feedback
          title="Bắt đầu câu chuyện đầu tiên"
          message="Phim bạn xem khi đăng nhập sẽ xuất hiện ở đây."
        >
          <Link className="button" href="/kham-pha">
            Khám phá phim
          </Link>
        </Feedback>
      )}
    </>
  );
}
