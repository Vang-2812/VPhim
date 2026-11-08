# Admin Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive traffic and activity analytics dashboard in the VPhim Admin portal (`/admin`), tracking pageviews, unique visitors, devices, watch sessions, and top-performing movies with zero external dependencies.

---

## File Structure Map

- **New files:**
  - `supabase/migrations/202611080001_analytics.sql`: SQL migration creating `public.page_visits`, indexing, RLS, `record_page_visit` RPC, and `admin_get_analytics` RPC.
  - `src/features/analytics/route-tracker.tsx`: Client-side route change observer sending anonymous beacon events to `/api/track`.
  - `src/app/api/track/route.ts`: Lightweight API route validating and persisting visit events into Supabase.
  - `src/features/admin/analytics.types.ts`: TypeScript interfaces for analytics metrics, trends, devices, and top content.
  - `src/features/admin/analytics.server.ts`: Server-side service to fetch aggregated metrics for the admin dashboard.
  - `src/features/admin/analytics-kpis.tsx`: KPI cards (Pageviews, Unique Visitors, Watch Sessions, New Users).
  - `src/features/admin/analytics-chart.tsx`: 7-day trend chart component with interactive bars/tooltips.
  - `src/features/admin/analytics-devices.tsx`: Device breakdown visualizer (Mobile, Desktop, Tablet).
  - `src/features/admin/analytics-top-content.tsx`: Top watched movies list and top visited paths.
  - `src/app/admin/page.tsx`: Main Admin Dashboard Overview page at `/admin`.
  - `tests/unit/admin-analytics.test.ts`: Unit tests for tracker payload parsing, analytics service handling, and data normalization.
  - `tests/components/admin-analytics.test.tsx`: Component tests for the admin overview page, KPI cards, and charts.
- **Modified files:**
  - `src/app/layout.tsx`: Mount `<RouteTracker />` so visits are tracked across public pages.
  - `src/components/layout/account-nav.tsx`: Add "Tổng quan" (`/admin`) and "Người dùng" (`/admin/nguoi-dung`) navigation items for admins.
  - `src/app/globals.css`: Styles for admin analytics cards, trend charts, progress bars, and responsive layout.

---

## Tasks

### Task 1: Supabase Database Migration for Analytics
- [ ] Create `supabase/migrations/202611080001_analytics.sql`:
  - `public.page_visits` table: `id uuid`, `path text`, `visitor_id text`, `user_id uuid`, `device_type text`, `created_at timestamptz`.
  - Indexes on `created_at desc` and `path`.
  - Enable RLS on `page_visits` and grant insert to `anon, authenticated`.
  - `public.record_page_visit(p_path text, p_visitor_id text, p_device_type text)`: validates lengths, inserts visit.
  - `public.admin_get_analytics()`: computes total and today's pageviews, unique visitors, watch sessions, new users, 7-day daily trends, device breakdown, top 5 watched movies, and top 5 pages.
- [ ] Apply migration to active Supabase project (`clwgfwegvuaszlzjcftm`) using MCP tool `execute_sql`.
- [ ] Verify database functions work properly by executing test call to `public.admin_get_analytics()`.

### Task 2: Analytics Tracking Mechanism (API Route & Client Tracker)
- [ ] Create `src/app/api/track/route.ts`:
  - Validates `path`, `visitorId`, `deviceType`.
  - Skips tracking for `/admin/*` or static assets.
  - Calls `record_page_visit` via Supabase client.
  - Returns JSON `{ ok: true }` with status 200.
- [ ] Create `src/features/analytics/route-tracker.tsx`:
  - Client component using `usePathname()`.
  - Retrieves or generates persistent anonymous `visitor_id` in `localStorage` (`vphim_visitor_id`).
  - Detects device type (`mobile`, `tablet`, `desktop`).
  - Sends beacon event using `navigator.sendBeacon` or fallback `fetch(..., { keepalive: true })`.
- [ ] Mount `<RouteTracker />` in `src/app/layout.tsx`.
- [ ] Write unit tests in `tests/unit/admin-analytics.test.ts` to verify device detection and API request validation.

### Task 3: Admin Analytics Service and Types
- [ ] Create `src/features/admin/analytics.types.ts`:
  - `AdminAnalyticsData`, `DailyTrendItem`, `DeviceBreakdown`, `TopMovieItem`, `TopPageItem`.
- [ ] Create `src/features/admin/analytics.server.ts`:
  - `getAdminAnalytics()` with `requireAdmin()` check.
  - Queries `c.rpc("admin_get_analytics")` and returns structured `Result<AdminAnalyticsData>`.
  - Handles fallback gracefully if empty or unexpected error occurs.
- [ ] Add unit test in `tests/unit/admin-analytics.test.ts` verifying service returns valid mock data structure.

### Task 4: Admin Analytics UI Components
- [ ] Create `src/features/admin/analytics-kpis.tsx`:
  - 4 KPI cards: Pageviews (Hôm nay / Tổng), Unique Visitors (Hôm nay), Watch Sessions (Lượt phát), Thành viên mới.
- [ ] Create `src/features/admin/analytics-chart.tsx`:
  - 7-day interactive bar/trend chart rendered with CSS/SVG.
  - Displays dates, visitor counts, and pageview counts with tooltips on hover.
- [ ] Create `src/features/admin/analytics-devices.tsx`:
  - Horizontal stacked percentage bar with legends for Mobile, Desktop, and Tablet.
- [ ] Create `src/features/admin/analytics-top-content.tsx`:
  - List of top 5 movies with titles, watch counts, and links.
  - List of top 5 visited pages.
- [ ] Add styling in `src/app/globals.css` for analytics grids, cards, charts, and mobile responsiveness.

### Task 5: Admin Navigation & Overview Page (`/admin`)
- [ ] Create `src/app/admin/page.tsx`:
  - Calls `getAdminAnalytics()`.
  - Renders dashboard header, quick date range indicator, KPI grid, Trends + Devices section, and Top Content section.
  - Shows friendly empty/loading state if no visits have been logged yet.
- [ ] Update `src/components/layout/account-nav.tsx`:
  - When `admin` is true, display:
    - `["/admin", "Tổng quan", LayoutDashboard]`
    - `["/admin/nguoi-dung", "Người dùng", Users]`
- [ ] Create `tests/components/admin-analytics.test.tsx` to verify component rendering and admin navigation.
- [ ] Run `npm test` to verify all test suites pass.

### Task 6: End-to-End Verification & Git Sync
- [ ] Run `npm run typecheck` (`tsc --noEmit`).
- [ ] Run `npm run build` (`next build`) to ensure all static and dynamic pages compile cleanly.
- [ ] Commit changes with message `feat(admin): add traffic and activity analytics dashboard`.
- [ ] Push to `origin main`.
