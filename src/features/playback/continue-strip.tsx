import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getOptionalMember } from "@/features/auth/context.server";
import { getContinueWatching, type ContinueItem } from "./progress.server";
export function ContinueCard({ item }: { item: ContinueItem }) {
  const href =
    "/xem/" +
    item.movie.slug +
    "?" +
    new URLSearchParams({ server: item.serverKey, episode: item.episodeKey });
  return (
    <Link className="continue-item" href={href}>
      {item.movie.posterUrl && (
        <img src={item.movie.posterUrl} alt="" loading="lazy" />
      )}
      <div>
        <h3>{item.movie.title}</h3>
        <p>
          {item.completed
            ? "Đã xem tập này"
            : item.position !== null
              ? "Đã xem " + Math.floor(item.position / 60) + " phút"
              : "Tiếp tục tập đang xem"}
        </p>
        {item.duration && item.position !== null ? (
          <progress
            value={item.position}
            max={item.duration}
            aria-label="Tiến độ xem"
          />
        ) : null}
      </div>
    </Link>
  );
}
export async function ContinueStrip() {
  if (!(await getOptionalMember())) return null;
  const r = await getContinueWatching(1);
  if (!r.ok || !r.data.items.length) return null;
  return (
    <section className="movie-section">
      <div className="section-heading">
        <h2>Xem tiếp câu chuyện</h2>
        <Link href="/tai-khoan/xem-tiep" className="text-link">
          Tất cả
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="continue-grid">
        {r.data.items.slice(0, 3).map((i) => (
          <ContinueCard key={i.movie.id} item={i} />
        ))}
      </div>
    </section>
  );
}
