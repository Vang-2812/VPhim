import type { MovieRef } from "./types";
import { MovieGrid } from "@/features/movies/movie-grid";
export function RefGrid({ items }: { items: MovieRef[] }) {
  return (
    <MovieGrid
      items={items.map((r) => ({
        ...r,
        originalTitle: null,
        thumbUrl: null,
        year: null,
        quality: null,
        language: null,
      }))}
    />
  );
}
