export interface MovieSummary {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  posterUrl: string | null;
  thumbUrl: string | null;
  year: number | null;
  quality: string | null;
  language: string | null;
}
export interface Episode {
  key: string;
  label: string;
  slug: string;
  hlsUrl: string | null;
  embedUrl: string | null;
}
export interface MovieServer {
  key: string;
  label: string;
  episodes: Episode[];
}
export interface MovieDetail extends MovieSummary {
  description: string;
  genres: string[];
  countries: string[];
  servers: MovieServer[];
  actors: string[];
  director: string[];
  duration: string | null;
  status: string | null;
}
export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
}
export interface BrowseQuery {
  keyword?: string;
  type?: string;
  category?: string;
  country?: string;
  year?: number;
  sort?: "updated" | "year";
  page: number;
}
export interface CatalogOption {
  slug: string;
  name: string;
}
