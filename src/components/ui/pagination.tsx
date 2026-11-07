import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
export function Pagination({
  page,
  totalPages,
  params = {},
}: {
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}) {
  function href(n: number) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
    p.set("page", String(n));
    return "?" + p;
  }
  return totalPages > 1 ? (
    <nav className="pagination" aria-label="Phân trang">
      {page > 1 ? (
        <Link className="button secondary" href={href(page - 1)}>
          <ChevronLeft size={16} />
          Trang trước
        </Link>
      ) : (
        <span />
      )}
      <span>
        Trang {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link className="button secondary" href={href(page + 1)}>
          Trang sau
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  ) : null;
}
