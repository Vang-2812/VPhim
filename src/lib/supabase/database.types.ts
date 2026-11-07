export interface ProfileRow {
  id: string;
  display_name: string;
  gender: "male" | "female" | "unspecified";
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
}
export interface AccessRow {
  user_id: string;
  role: "member" | "admin";
  membership: "normal" | "vip";
  status: "active" | "blocked";
}
export interface MovieRefRow {
  id: string;
  provider_id: string;
  slug: string;
  title: string;
  poster_url: string | null;
}
export interface PlaylistRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}
export interface ResumeRow {
  user_id: string;
  movie_ref_id: string;
  episode_key: string;
  server_key: string;
  session_id: string;
  updated_at: string;
}
// Row contracts mirror the SQL migrations. Generate full Supabase types after connecting a project.
