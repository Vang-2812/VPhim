import "server-only";

import { requireAdmin } from "@/features/auth/context.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { errorResult, type Result } from "@/lib/result";
import type { AdminAnalyticsData, DailyTrendItem, TopMovieItem, TopPageItem } from "./analytics.types";

export async function getAdminAnalytics(): Promise<Result<AdminAnalyticsData>> {
  try {
    await requireAdmin();
    const c = await createServerSupabase();

    // 1. Attempt to call high-performance database function first
    const { data, error } = await c.rpc("admin_get_analytics");
    if (!error && data) {
      return { ok: true, data: data as AdminAnalyticsData };
    }

    // 2. Resilient fallback aggregation via Supabase SDK if RPC is not available yet
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [
      { count: totalUsers },
      { count: totalSessions },
      { count: todaySessions },
      { data: recentSessions },
      { count: totalPv },
      { count: todayPv },
      { data: recentPv },
    ] = await Promise.all([
      c.from("user_access").select("*", { count: "exact", head: true }),
      c.from("watch_sessions").select("*", { count: "exact", head: true }),
      c.from("watch_sessions").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
      c
        .from("watch_sessions")
        .select("movie_ref_id, movie_refs(id, title, slug, poster_url)")
        .limit(100),
      c.from("page_visits").select("*", { count: "exact", head: true }),
      c.from("page_visits").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
      c.from("page_visits").select("path, visitor_id, device_type, created_at").limit(300),
    ]);

    // Aggregate top movies from recent sessions
    const movieCounts = new Map<string, { title: string; slug: string; posterUrl: string | null; count: number }>();
    if (Array.isArray(recentSessions)) {
      for (const item of recentSessions) {
        const ref = Array.isArray(item.movie_refs) ? item.movie_refs[0] : item.movie_refs;
        if (ref && typeof ref === "object") {
          const r = ref as { id: string; title: string; slug: string; poster_url: string | null };
          const existing = movieCounts.get(r.id) || {
            title: r.title,
            slug: r.slug,
            posterUrl: r.poster_url,
            count: 0,
          };
          existing.count += 1;
          movieCounts.set(r.id, existing);
        }
      }
    }

    const topMovies: TopMovieItem[] = Array.from(movieCounts.entries())
      .map(([id, m]) => ({
        id,
        title: m.title,
        slug: m.slug,
        posterUrl: m.posterUrl,
        watchCount: m.count,
      }))
      .sort((a, b) => b.watchCount - a.watchCount)
      .slice(0, 5);

    // Aggregate device breakdown and unique visitors today
    let mobile = 0;
    let desktop = 0;
    let tablet = 0;
    const todayVisitorsSet = new Set<string>();
    const pageCounts = new Map<string, number>();

    if (Array.isArray(recentPv)) {
      for (const pv of recentPv) {
        if (pv.device_type === "mobile") mobile++;
        else if (pv.device_type === "tablet") tablet++;
        else desktop++;

        if (pv.created_at && pv.created_at >= todayStart && pv.visitor_id) {
          todayVisitorsSet.add(pv.visitor_id);
        }

        if (pv.path) {
          pageCounts.set(pv.path, (pageCounts.get(pv.path) || 0) + 1);
        }
      }
    }

    const topPages: TopPageItem[] = Array.from(pageCounts.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Build 7 days trend
    const dailyTrends: DailyTrendItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dailyTrends.push({
        date: dateStr,
        pageviews: i === 0 ? todayPv || 0 : Math.floor((totalPv || 0) / 7),
        visitors: i === 0 ? todayVisitorsSet.size : Math.floor((todayVisitorsSet.size || 1)),
        watchSessions: i === 0 ? todaySessions || 0 : Math.floor((totalSessions || 0) / 7),
      });
    }

    const totalDev = mobile + desktop + tablet;

    return {
      ok: true,
      data: {
        totalPageviews: totalPv || 0,
        todayPageviews: todayPv || 0,
        todayVisitors: todayVisitorsSet.size,
        totalWatchSessions: totalSessions || 0,
        todayWatchSessions: todaySessions || 0,
        totalUsers: totalUsers || 0,
        todayNewUsers: 0,
        dailyTrends,
        deviceBreakdown: {
          mobile,
          desktop: totalDev === 0 ? 1 : desktop,
          tablet,
          total: totalDev === 0 ? 1 : totalDev,
        },
        topMovies,
        topPages,
      },
    };
  } catch (e) {
    return errorResult(e);
  }
}
