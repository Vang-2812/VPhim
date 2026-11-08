export interface DailyTrendItem {
  date: string; // "YYYY-MM-DD"
  pageviews: number;
  visitors: number;
  watchSessions: number;
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
  total: number;
}

export interface TopMovieItem {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  watchCount: number;
}

export interface TopPageItem {
  path: string;
  views: number;
}

export interface AdminAnalyticsData {
  totalPageviews: number;
  todayPageviews: number;
  todayVisitors: number;
  totalWatchSessions: number;
  todayWatchSessions: number;
  totalUsers: number;
  todayNewUsers: number;
  dailyTrends: DailyTrendItem[];
  deviceBreakdown: DeviceBreakdown;
  topMovies: TopMovieItem[];
  topPages: TopPageItem[];
}
