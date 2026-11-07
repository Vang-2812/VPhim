create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Người xem' check(char_length(btrim(display_name)) between 1 and 80),
 gender text not null default 'unspecified' check(gender in('male','female','unspecified')),
 avatar_path text check(avatar_path is null or left(avatar_path,37)=id::text||'/'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_access (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'member' check(role in('member','admin')),
 membership text not null default 'normal' check(membership in('normal','vip')),
 status text not null default 'active' check(status in('active','blocked')),
 updated_at timestamptz not null default now()
);
create table public.movie_refs(id uuid primary key default gen_random_uuid(),provider_id text unique not null,slug text not null,title text not null,poster_url text,updated_at timestamptz not null default now());
create table public.favorites(user_id uuid references auth.users(id) on delete cascade,movie_ref_id uuid references public.movie_refs(id) on delete cascade,created_at timestamptz not null default now(),primary key(user_id,movie_ref_id));
create table public.playlists(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,name text not null check(char_length(btrim(name)) between 1 and 80),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.playlist_items(playlist_id uuid references public.playlists(id) on delete cascade,movie_ref_id uuid references public.movie_refs(id) on delete cascade,added_at timestamptz not null default now(),primary key(playlist_id,movie_ref_id));
create table public.watch_sessions(id uuid primary key,user_id uuid not null references auth.users(id) on delete cascade,movie_ref_id uuid not null references public.movie_refs(id) on delete cascade,episode_key text not null,server_key text not null,last_sequence bigint not null default 0,created_at timestamptz not null default now());
create table public.watch_progress(user_id uuid references auth.users(id) on delete cascade,movie_ref_id uuid references public.movie_refs(id) on delete cascade,episode_key text,server_key text not null,position double precision,duration double precision,completed boolean not null default false,session_id uuid references public.watch_sessions(id) on delete cascade,updated_at timestamptz not null default now(),primary key(user_id,movie_ref_id,episode_key),check((position is null and duration is null) or(position>=0 and position<'Infinity'::double precision and duration>0 and duration<'Infinity'::double precision and position<=duration)));
create table public.watch_resume(user_id uuid references auth.users(id) on delete cascade,movie_ref_id uuid references public.movie_refs(id) on delete cascade,episode_key text not null,server_key text not null,session_id uuid references public.watch_sessions(id) on delete cascade,updated_at timestamptz not null default now(),primary key(user_id,movie_ref_id));
create table public.admin_audit_logs(id uuid primary key default gen_random_uuid(),actor_id uuid references auth.users(id),target_id uuid references auth.users(id),action text not null,before_value jsonb not null,after_value jsonb not null,created_at timestamptz not null default now());
create table public.auth_sync_jobs(user_id uuid primary key references auth.users(id) on delete cascade,status text not null check(status in('active','blocked')),revision bigint not null default 1,applied_revision bigint not null default 0,pending boolean generated always as(revision>applied_revision)stored,lease_token uuid,lease_until timestamptz,updated_at timestamptz not null default now());
create index playlists_owner_idx on public.playlists(user_id,created_at desc);
create index favorites_owner_date_idx on public.favorites(user_id,created_at desc);
create index resume_owner_date_idx on public.watch_resume(user_id,updated_at desc);
create index watch_sessions_owner_movie_idx on public.watch_sessions(user_id,movie_ref_id);

create function private.is_active(p_user uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.user_access where user_id=p_user and status='active')$$;
create function private.is_admin(p_user uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.user_access where user_id=p_user and status='active' and role='admin')$$;
revoke all on function private.is_active(uuid),private.is_admin(uuid) from public;
grant execute on function private.is_active(uuid),private.is_admin(uuid) to authenticated;

create function private.bootstrap_user() returns trigger language plpgsql security definer set search_path='' as $$begin
 insert into public.profiles(id,display_name) values(new.id,coalesce(nullif(left(btrim(new.raw_user_meta_data->>'display_name'),80),''),'Người xem'));
 insert into public.user_access(user_id) values(new.id);
 return new;
end$$;
revoke all on function private.bootstrap_user() from public;
create trigger vphim_bootstrap_user after insert on auth.users for each row execute function private.bootstrap_user();

alter table public.profiles enable row level security;
alter table public.user_access enable row level security;
alter table public.movie_refs enable row level security;
alter table public.favorites enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;
alter table public.watch_sessions enable row level security;
alter table public.watch_progress enable row level security;
alter table public.watch_resume enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.auth_sync_jobs enable row level security;

revoke all on public.profiles,public.user_access,public.movie_refs,public.favorites,public.playlists,public.playlist_items,public.watch_sessions,public.watch_progress,public.watch_resume,public.admin_audit_logs,public.auth_sync_jobs from anon,authenticated;
grant select on public.movie_refs to anon,authenticated;
grant select on public.user_access,public.profiles,public.watch_progress,public.watch_resume to authenticated;
grant update(display_name,gender,avatar_path,updated_at) on public.profiles to authenticated;
grant select,insert,delete on public.favorites,public.playlist_items to authenticated;
grant select,insert,delete on public.playlists to authenticated;
grant update(name,updated_at) on public.playlists to authenticated;
grant all on public.profiles,public.user_access,public.movie_refs,public.favorites,public.playlists,public.playlist_items,public.watch_sessions,public.watch_progress,public.watch_resume,public.admin_audit_logs,public.auth_sync_jobs to service_role;

create policy movie_refs_public on public.movie_refs for select to anon,authenticated using(true);
create policy access_self_read on public.user_access for select to authenticated using(user_id=(select auth.uid()));
create policy profile_self_read on public.profiles for select to authenticated using(id=(select auth.uid()) and private.is_active((select auth.uid())));
create policy profile_self_write on public.profiles for update to authenticated using(id=(select auth.uid()) and private.is_active((select auth.uid()))) with check(id=(select auth.uid()) and private.is_active((select auth.uid())));
create policy favorites_owner on public.favorites for all to authenticated using(user_id=(select auth.uid()) and private.is_active((select auth.uid()))) with check(user_id=(select auth.uid()) and private.is_active((select auth.uid())));
create policy playlists_owner on public.playlists for all to authenticated using(user_id=(select auth.uid()) and private.is_active((select auth.uid()))) with check(user_id=(select auth.uid()) and private.is_active((select auth.uid())));
create policy playlist_items_owner on public.playlist_items for all to authenticated using(private.is_active((select auth.uid())) and exists(select 1 from public.playlists p where p.id=playlist_id and p.user_id=(select auth.uid()))) with check(private.is_active((select auth.uid())) and exists(select 1 from public.playlists p where p.id=playlist_id and p.user_id=(select auth.uid())));
create policy progress_owner_read on public.watch_progress for select to authenticated using(user_id=(select auth.uid()) and private.is_active((select auth.uid())));
create policy resume_owner_read on public.watch_resume for select to authenticated using(user_id=(select auth.uid()) and private.is_active((select auth.uid())));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('avatars','avatars',false,2097152,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy avatar_owner_read on storage.objects for select to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text and private.is_active((select auth.uid())));
create policy avatar_owner_insert on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text and private.is_active((select auth.uid())));
create policy avatar_owner_delete on storage.objects for delete to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text and private.is_active((select auth.uid())));
