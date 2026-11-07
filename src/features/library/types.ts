export interface MovieRef {
  id: string;
  providerId: string;
  slug: string;
  title: string;
  posterUrl: string | null;
}
export interface Playlist {
  id: string;
  name: string;
  items: MovieRef[];
}
