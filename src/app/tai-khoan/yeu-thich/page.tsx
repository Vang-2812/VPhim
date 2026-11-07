import Link from "next/link";
import { getFavorites } from "@/features/library/service.server";
import { RemoveFavorite } from "@/features/library/playlist-editor";
import { Feedback } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
export const dynamic = "force-dynamic";
export const metadata = { title: "Phim yêu thích" };
export default async function Favorites({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const r = await getFavorites(Number((await searchParams).page) || 1);
  return (
    <>
      <h1>Phim yêu thích</h1>
      <p className="account-description">Những câu chuyện bạn muốn giữ lại.</p>
      {!r.ok ? (
        <Feedback
          title="Chưa tải được yêu thích"
          message={r.message}
          kind="error"
        />
      ) : r.data.items.length ? (
        <>
          <div className="movie-grid compact-grid">
            {r.data.items.map((m) => (
              <article key={m.id}>
                <Link className="movie-card" href={"/phim/" + m.slug}>
                  <div className="poster">
                    {m.posterUrl && (
                      <img src={m.posterUrl} alt="" loading="lazy" />
                    )}
                  </div>
                  <h3>{m.title}</h3>
                </Link>
                <RemoveFavorite slug={m.slug} />
              </article>
            ))}
          </div>
          <Pagination page={r.data.page} totalPages={r.data.totalPages} />
        </>
      ) : (
        <Feedback
          title="Một chỗ dành cho phim bạn thích"
          message="Bấm Yêu thích ở trang phim để lưu lại tại đây."
        >
          <Link className="button" href="/kham-pha">
            Tìm phim yêu thích
          </Link>
        </Feedback>
      )}
    </>
  );
}
