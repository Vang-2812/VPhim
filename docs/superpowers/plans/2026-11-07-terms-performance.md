# VPhim terms and Supabase performance implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish accurate Vietnamese terms and reduce avoidable Supabase latency while preparing the approved Singapore relocation.

**Architecture:** Keep Next.js/Supabase and all existing user enhancements. SDK-verified claims and render-request memoization replace repeated Auth lookups; bounded PostgREST queries and Suspense remove waterfalls. Singapore cutover preserves data and requires a verified destination before switching production.

**Tech Stack:** Existing Next.js 16, React 19, Supabase SSR/JS, Vitest and PGlite; Node 24+, no new runtime dependency.

**Spec:** `docs/superpowers/specs/2026-11-07-terms-performance-design.md` (user approved).

## Global Constraints

- Preserve auto-resume, cached movie lists, branding, loading and automatic embed fallback.
- Never use unverified cookie user/decoded JWT for authorization; current DB access/RLS remains authoritative.
- No global/TTL caching of private identity, roles or library data.
- Public email: `contact.vphim@gmail.com`; terms do not grant copyright licenses or absolute immunity.
- Target Supabase `ap-southeast-1` and Vercel `sin1`; preserve existing data/project rollback path.
- Never log/export tokens, credentials or personal records in diagnostic output; no automatic production cutover.

## Review Focus

1. User A/B, expired/forged tokens and blocked users: request cache must not leak or bypass live access.
2. Cookie refresh and callback flows: Proxy preserves request/response cookies and SDK behavior.
3. Many resume episodes, punctuation and missing data: correct exact movie/episode matching with bounded queries and honest errors.
4. Slow optional member data: film shell streams while player waits for the correct resume selection.
5. Region migration: Auth identities/passwords, private avatar objects and OAuth callbacks must survive data transfer or have explicit operator steps; never claim migration finished from config alone.

### Task 1: Terms and contact entry points

**Files:** Create `src/app/(public)/dieu-khoan/page.tsx`; modify `src/app/globals.css`, `src/app/layout.tsx`, `src/features/auth/auth-form.tsx`.

**Interfaces:** Public route `/dieu-khoan`, anchored copyright/data sections, public mailto contact. Existing SSR layout/auth APIs unchanged.

- [ ] Write original copy matching actual HLS/iframe/Auth/data behavior; preserve theme and add footer/auth links.
- [ ] Browser-check desktop/mobile, anchor navigation, contact and auth links. Human prose/CSS earns no implementation-mirroring tests.
- [ ] Commit task output after relevant app checks.

### Task 2: Auth round trips and optional streaming

**Files:** Modify `src/proxy.ts`, `src/lib/supabase/server.ts`, `src/features/auth/context.server.ts`, `src/components/layout/site-header.tsx`, home/detail/watch routes; create timing helper `src/lib/supabase/timed-fetch.ts` and regression tests.

**Interfaces:** Existing `getOptionalMember/requireMember/requireAdmin` contracts stay unchanged. SDK `getClaims()` verifies identity; live `user_access` defines permissions. One shared React cache per render; no cache guarantees assumed in actions/handlers. Opt-in `SUPABASE_TIMING=1` logs only sanitized endpoint class/method/status/duration.

- [ ] Add tests reproducing unnecessary Auth lookup, blocked/admin denial, cookie refresh and diagnostic redaction; watch failures.
- [ ] Use official SDK claims, request memoization and current access checks. Cache server client only within React request. Preserve fresh action checks and use shared internal results to avoid action nesting where needed.
- [ ] Stream account slot, ContinueStrip and optional detail/watch content; retain SSR library state and await resume before player mount.
- [ ] Run auth/proxy/timing regression tests and full suite; commit.

### Task 3: Bounded library and resume queries

**Files:** Modify `src/features/playback/progress.server.ts`, `src/features/library/actions.ts`; add `tests/unit/supabase-queries.test.ts`.

**Interfaces:** Keep existing Result payloads. Resume uses `movie_refs!inner` slug join; library reads favorite+playlist id/name concurrently, without full playlist contents. ContinueWatching reads ≤12 pointers plus one bounded progress batch, maps by exact movie/episode pair.

- [ ] Add SDK/fetch-boundary tests for query budgets, punctuation, missing progress, guest/no-data, duplicate slug and upstream errors; watch RED.
- [ ] Implement two-query bounded history, one-query movie resume and two parallel library reads. Do not silently mask query errors.
- [ ] Run regression/full tests and local SQL/RLS; commit.

### Task 4: Singapore deployment and handoff

**Files:** Create `vercel.json`, `docs/migrate-singapore.md`, `docs/performance.md`; update deployment/setup/validation docs and `.env.example`.

**Interfaces:** Vercel `regions: ["sin1"]`; current `.env.local` remains unchanged until destination is ready. New project in user-approved organization `Vang-2812's Org`; tool-enforced cost confirmation if nonzero.

- [ ] Prepare migration/backup/Auth/Storage/provider/callback validation and rollback procedure from official Supabase docs. Create the approved destination only when cost workflow permits; no production writes/cutover without concrete verification.
- [ ] Record baseline public timings, aggregate Auth log counts, advisors and request budgets; distinguish local proof from hosted performance.
- [ ] Run full tests, local SQL/RLS, typecheck/build and browser QA. One independent whole-branch review, then one tested fix pass for Important/Critical findings.
- [ ] Commit verified changes; report what remains for hosted cutover and do not push or redeploy automatically.
