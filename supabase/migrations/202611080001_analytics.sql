create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null check(char_length(path) between 1 and 500),
  visitor_id text not null check(char_length(visitor_id) between 1 and 100),
  user_id uuid references auth.users(id) on delete set null,
  device_type text not null default 'desktop' check(device_type in ('desktop', 'mobile', 'tablet')),
  created_at timestamptz not null default now()
);

create index if not exists page_visits_created_at_idx on public.page_visits(created_at desc);
create index if not exists page_visits_path_idx on public.page_visits(path);
create index if not exists page_visits_visitor_date_idx on public.page_visits(created_at, visitor_id);

alter table public.page_visits enable row level security;
revoke all on public.page_visits from anon, authenticated;
grant insert on public.page_visits to anon, authenticated;
grant all on public.page_visits to service_role;

drop policy if exists page_visits_insert_all on public.page_visits;
create policy page_visits_insert_all on public.page_visits for insert to anon, authenticated with check(true);

create or replace function public.record_page_visit(
  p_path text,
  p_visitor_id text,
  p_device_type text default 'desktop'
) returns void language plpgsql security definer set search_path='' as $$
declare
  u uuid := auth.uid();
  clean_path text := left(coalesce(p_path, '/'), 500);
  clean_visitor text := left(coalesce(p_visitor_id, 'anon'), 100);
  clean_device text := case when p_device_type in ('mobile', 'tablet', 'desktop') then p_device_type else 'desktop' end;
begin
  if clean_path like '/admin%' or clean_path like '/api%' then
    return;
  end if;
  insert into public.page_visits(path, visitor_id, user_id, device_type)
  values(clean_path, clean_visitor, u, clean_device);
end$$;

revoke all on function public.record_page_visit(text, text, text) from public;
grant execute on function public.record_page_visit(text, text, text) to anon, authenticated;

create or replace function public.admin_get_analytics() returns jsonb language plpgsql security definer set search_path='' as $$
declare
  actor uuid := auth.uid();
  v_total_pv bigint;
  v_today_pv bigint;
  v_today_uv bigint;
  v_total_sessions bigint;
  v_today_sessions bigint;
  v_total_users bigint;
  v_today_new_users bigint;
  v_daily_trends jsonb;
  v_device_breakdown jsonb;
  v_top_movies jsonb;
  v_top_pages jsonb;
  v_start_of_today timestamptz := date_trunc('day', timezone('Asia/Ho_Chi_Minh', now()));
begin
  if actor is null or not private.is_admin(actor) then
    raise exception 'Admin required' using errcode='42501';
  end if;

  select count(*) into v_total_pv from public.page_visits;
  select count(*) into v_today_pv from public.page_visits where created_at >= v_start_of_today;
  select count(distinct visitor_id) into v_today_uv from public.page_visits where created_at >= v_start_of_today;

  select count(*) into v_total_sessions from public.watch_sessions;
  select count(*) into v_today_sessions from public.watch_sessions where created_at >= v_start_of_today;

  select count(*) into v_total_users from public.user_access;
  select count(*) into v_today_new_users from auth.users where created_at >= v_start_of_today;

  -- 7-day daily trends
  with days as (
    select (v_start_of_today - (n || ' days')::interval)::timestamptz as day_start,
           (v_start_of_today - ((n - 1) || ' days')::interval)::timestamptz as day_end,
           to_char(v_start_of_today - (n || ' days')::interval, 'YYYY-MM-DD') as day_label
    from generate_series(6, 0, -1) as n
  )
  select coalesce(jsonb_agg(to_jsonb(t) order by t.date), '[]'::jsonb) into v_daily_trends
  from (
    select
      d.day_label as date,
      coalesce((select count(*) from public.page_visits pv where pv.created_at >= d.day_start and pv.created_at < d.day_end), 0) as pageviews,
      coalesce((select count(distinct pv.visitor_id) from public.page_visits pv where pv.created_at >= d.day_start and pv.created_at < d.day_end), 0) as visitors,
      coalesce((select count(*) from public.watch_sessions ws where ws.created_at >= d.day_start and ws.created_at < d.day_end), 0) as "watchSessions"
    from days d
  ) t;

  -- Device breakdown (past 30 days)
  with dev as (
    select
      coalesce(sum(case when device_type = 'mobile' then 1 else 0 end), 0) as mobile,
      coalesce(sum(case when device_type = 'desktop' then 1 else 0 end), 0) as desktop,
      coalesce(sum(case when device_type = 'tablet' then 1 else 0 end), 0) as tablet,
      count(*) as total
    from public.page_visits
    where created_at >= v_start_of_today - interval '30 days'
  )
  select jsonb_build_object(
    'mobile', mobile,
    'desktop', desktop,
    'tablet', tablet,
    'total', total
  ) into v_device_breakdown from dev;

  -- Top 5 watched movies
  select coalesce(jsonb_agg(to_jsonb(m)), '[]'::jsonb) into v_top_movies
  from (
    select
      r.id,
      r.title,
      r.slug,
      r.poster_url as "posterUrl",
      count(s.id) as "watchCount"
    from public.movie_refs r
    join public.watch_sessions s on s.movie_ref_id = r.id
    group by r.id, r.title, r.slug, r.poster_url
    order by "watchCount" desc
    limit 5
  ) m;

  -- Top 5 visited pages (past 7 days)
  select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) into v_top_pages
  from (
    select path, count(*) as views
    from public.page_visits
    where created_at >= v_start_of_today - interval '7 days'
    group by path
    order by views desc
    limit 5
  ) p;

  return jsonb_build_object(
    'totalPageviews', v_total_pv,
    'todayPageviews', v_today_pv,
    'todayVisitors', v_today_uv,
    'totalWatchSessions', v_total_sessions,
    'todayWatchSessions', v_today_sessions,
    'totalUsers', v_total_users,
    'todayNewUsers', v_today_new_users,
    'dailyTrends', v_daily_trends,
    'deviceBreakdown', v_device_breakdown,
    'topMovies', v_top_movies,
    'topPages', v_top_pages
  );
end$$;

revoke all on function public.admin_get_analytics() from public, anon;
grant execute on function public.admin_get_analytics() to authenticated;
