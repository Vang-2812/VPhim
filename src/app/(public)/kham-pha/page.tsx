import { Search, SlidersHorizontal } from "lucide-react";
import { listMovies, getCatalogs } from "@/features/movies/client.server";
import { parseBrowseQuery, movieTypes } from "@/features/movies/query";
import { MovieGrid } from "@/features/movies/movie-grid";
import { Feedback, RetryLink } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
export const metadata = { title: "Khám phá phim" };
export const dynamic = "force-dynamic";
export default async function Browse({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams,
    p = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (typeof v === "string") p.set(k, v);
  const query = parseBrowseQuery(p);
  const [result, catalog] = await Promise.all([
    listMovies(query),
    getCatalogs(),
  ]);
  return (
    <div className="container page-space">
      <div className="page-heading">
        <div>
          <h1>Khám phá phim</h1>
          <p>Một thế giới câu chuyện, theo cách bạn chọn.</p>
        </div>
        <SlidersHorizontal size={24} strokeWidth={1.5} />
      </div>
      <form action="/kham-pha" className="browse-form">
        <label className="search-field">
          <Search size={20} />
          <input
            name="keyword"
            defaultValue={query.keyword}
            placeholder="Tên phim bạn muốn tìm…"
            aria-label="Tên phim"
            maxLength={120}
          />
        </label>
        <div className="filter-row">
          <label>
            Loại phim
            <select name="type" defaultValue={query.type || ""}>
              <option value="">Tất cả loại phim</option>
              {movieTypes.map(([v, t]) => (
                <option value={v} key={v}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Thể loại
            <select name="category" defaultValue={query.category || ""}>
              <option value="">Tất cả thể loại</option>
              {catalog.ok &&
                catalog.data.genres.map((v) => (
                  <option value={v.slug} key={v.slug}>
                    {v.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Quốc gia
            <select name="country" defaultValue={query.country || ""}>
              <option value="">Tất cả quốc gia</option>
              {catalog.ok &&
                catalog.data.countries.map((v) => (
                  <option value={v.slug} key={v.slug}>
                    {v.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Năm
            <input
              name="year"
              type="number"
              min="1900"
              max="2100"
              defaultValue={query.year}
              placeholder="Tất cả năm"
            />
          </label>
          <label>
            Sắp xếp
            <select name="sort" defaultValue={query.sort}>
              <option value="updated">Mới cập nhật</option>
              <option value="year">Năm phát hành</option>
            </select>
          </label>
          <button className="button" type="submit">
            Tìm phim
          </button>
        </div>
      </form>
      <section className="movie-section">
        <div className="section-heading">
          <h2>
            {query.keyword
              ? "Kết quả cho “" + query.keyword + "”"
              : "Dành cho bạn khám phá"}
          </h2>
          <span className="muted">
            {result.ok ? "Trang " + result.data.page : ""}
          </span>
        </div>
        {!result.ok ? (
          <Feedback
            title="Chưa tải được phim"
            message={result.message}
            kind="error"
          >
            <RetryLink />
          </Feedback>
        ) : result.data.items.length ? (
          <>
            <MovieGrid items={result.data.items} />
            <Pagination
              page={result.data.page}
              totalPages={result.data.totalPages}
              params={params}
            />
          </>
        ) : (
          <Feedback
            title="Chưa tìm thấy phim phù hợp"
            message="Thử đổi từ khóa hoặc bớt một bộ lọc."
          />
        )}
      </section>
    </div>
  );
}
