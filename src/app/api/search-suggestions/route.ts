import { listMovies } from "@/features/movies/client.server";

export async function GET(request: Request): Promise<Response> {
  const keyword = new URL(request.url).searchParams.get("keyword")?.trim().slice(0, 120) || "";
  if (keyword.length < 2) return Response.json({ items: [] });

  const result = await listMovies({ page: 1, keyword });
  if (!result.ok) {
    return Response.json(
      { items: [], error: result.message },
      { status: 503 },
    );
  }

  return Response.json(
    {
      items: result.data.items.slice(0, 5).map((movie) => ({
        slug: movie.slug,
        title: movie.title,
        posterUrl: movie.posterUrl,
        year: movie.year,
        quality: movie.quality,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } },
  );
}
