# iQIYI-inspired VPhim UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the entire VPhim site with an immersive film-first layout while retaining its charcoal/amber palette, and add live header search suggestions that navigate to Khám phá only on submit.

**Architecture:** Keep the existing Next.js App Router pages, server-side KKPhim client, Supabase flows, player, and URLs. Introduce a small JSON route for suggestion previews and a client-only header search form; the rest is component markup and CSS using current movie data. Preserve the existing grid in Khám phá and add rail presentation to homepage movie cards.

**Tech Stack:** Next.js 16.4.5 App Router, React 19, TypeScript, CSS, Vitest/Testing Library, lucide-react.

**Spec:** `docs/superpowers/specs/2026-11-08-iqiyi-inspired-ui-design.md`

## Global Constraints

- Keep the charcoal background and amber accent defined in `src/styles/tokens.css`; keep the current VPhim logo and routes.
- Do not add KKPhim/Supabase requests during initial page render; suggestions fetch only when typing, reuse `listMovies`/cache, and never call Supabase.
- Do not change playback, authentication, library, admin business logic, subscription rights, or API data contracts.
- No new UI dependency, autoplay trailer, ads, VIP upsell, or iQIYI branding.
- Keep search submit usable without JavaScript: a GET form to `/kham-pha` with a `keyword` input.
- Read relevant guides under `node_modules/next/dist/docs/` before editing Next.js code, per `AGENTS.md`.

## Review Focus

- A stale suggestion response after rapid typing must not replace results for the current input; Task 1 component test.
- One-character or whitespace input must not issue a suggestion request; Enter must still navigate using the form; Task 1 component test.
- KKPhim suggestion failure must show a recoverable inline state without breaking header navigation; Task 1 route and component tests.
- Escape/outside click must close the dropdown, while suggestion click must lead to that film's detail; Task 1 component test.
- Long titles, missing images, narrow mobile widths, and reduced-motion users must retain legibility and access; Tasks 2–4 manual responsive/visual checks.

---

### Task 1: Header search suggestions

**Files:**
- Create: `src/app/api/search-suggestions/route.ts` — validate query, call `listMovies`, return at most five summary items.
- Create: `src/components/layout/header-search.tsx` — visible GET search form, debounced suggestion dropdown, empty/loading/error states, cancellation.
- Modify: `src/components/layout/site-header.tsx` — replace search icon link with `HeaderSearch` in desktop/mobile responsive header.
- Modify: `src/app/globals.css` — header and dropdown positioning, responsive search width, focus styles.
- Test: `tests/unit/search-suggestions.test.ts` — route validation/success/upstream failure.
- Test: `tests/components/header-search.test.tsx` — typing, submit, stale responses, dropdown closure and selection.

**Interfaces:**
- `GET(request: Request): Promise<Response>` in route; successful JSON `{ items: Array<{ slug: string; title: string; posterUrl: string | null; year: number | null; quality: string | null }> }`, failure JSON `{ items: [], error: string }` with appropriate status.
- `HeaderSearch(): React.JSX.Element`; form `action="/kham-pha" method="get"`, input `name="keyword"`, button `type="submit"`.
- Delay 300 ms; request only for trimmed input length >= 2; max 120 characters and five previews; abort previous fetch on change/unmount. Enter/icon submit to Khám phá, result link to `/phim/[slug]`.

- [ ] **Step 1: Write route tests** for empty/one-character (zero upstream calls, empty list), valid keyword (max five summaries), and upstream failure (error state).
- [ ] **Step 2: Run** `npx vitest run tests/unit/search-suggestions.test.ts` and confirm the new tests fail.
- [ ] **Step 3: Implement** `GET(request: Request): Promise<Response>` in `src/app/api/search-suggestions/route.ts` using `listMovies({page:1,keyword})` and a safe trimmed query.
- [ ] **Step 4: Run the route tests** and confirm pass.
- [ ] **Step 5: Write component tests** for 300 ms debounce, no request below two characters, stale response ignored, error/empty dropdown, Escape/outside click, suggestion link, form submit and visible input.
- [ ] **Step 6: Run** `npx vitest run tests/components/header-search.test.tsx` and confirm failure before implementation.
- [ ] **Step 7: Implement** `HeaderSearch` and integrate it in `SiteHeader`; style header/dropdown in `globals.css`.
- [ ] **Step 8: Run both search test files, typecheck, and a keyboard/mobile smoke check.**
- [ ] **Step 9: Commit** the search task.

### Task 2: Shared visual system and film cards

**Files:**
- Modify: `src/styles/tokens.css` — only if a new named surface/text token is needed; preserve current palette values.
- Modify: `src/app/globals.css` — shared typography, spacing, controls, header/footer, responsive rules.
- Modify: `src/features/movies/movie-grid.tsx` — optional `variant?: "grid" | "rail"` prop; movie metadata presentation common to both layouts.
- Modify: `src/features/playback/continue-strip.tsx` — use film-card-like rail spacing and progress visibility without changing data calls.

**Interfaces:**
- `MovieGrid({ items, variant = "grid" }: { items: MovieSummary[]; variant?: "grid" | "rail" })`.
- Grid remains the default for every existing caller; rail is opt-in for homepage.

- [ ] **Step 1: Add the `variant` prop and CSS class** to `MovieGrid`, keeping the `grid` default and current links/alt/fallback behavior.
- [ ] **Step 2: Update global component CSS** for consistent charcoal surfaces, amber focus/active states, readable typography and footer/header at 390px/768px/desktop.
- [ ] **Step 3: Run** `npm run typecheck` and existing movie/component tests; inspect cards with missing image and long title in browser.
- [ ] **Step 4: Commit** the shared visual task.

### Task 3: Homepage, Khám phá, and detail page

**Files:**
- Modify: `src/app/(public)/page.tsx` — backdrop hero and `MovieGrid variant="rail"`, keeping the same `listMovies`/`getMovie` calls.
- Modify: `src/app/(public)/kham-pha/page.tsx` — compact filter presentation and heading; keep fields/query/pagination unchanged.
- Modify: `src/app/(public)/phim/[slug]/page.tsx` — backdrop hero, action/synopsis/facts/episodes layout; keep `DetailActions` and data calls.
- Modify: `src/app/globals.css` — responsive hero, chips, rail, browse and detail CSS.

**Interfaces:**
- Home hero uses `featured.thumbUrl || featured.posterUrl` with solid-color fallback.
- Detail page retains `DetailActions(movie: MovieDetail)`, episode URLs and all current fields.

- [ ] **Step 1: Update home markup** to overlay film information on the wide backdrop; preserve actions and chips; display existing 18 items as a horizontal rail.
- [ ] **Step 2: Update browse markup/CSS** to make search/filter controls compact while retaining native GET form and result grid.
- [ ] **Step 3: Update detail markup/CSS** to put the film backdrop behind high-contrast metadata/actions and show synopsis/facts/episodes below.
- [ ] **Step 4: Run** `npm run typecheck`, movie/query tests, and browser review at desktop and 390px for home, browse, detail, missing image and long title.
- [ ] **Step 5: Commit** the public-page task.

### Task 4: Watch, account, auth, admin, terms, and final verification

**Files:**
- Modify: `src/app/globals.css` — watch panels, form surfaces, account sidebar/content, admin tables, terms typography and responsive rules.
- Modify as needed: `src/features/auth/auth-page.tsx`, `src/components/layout/account-nav.tsx`, `src/features/playback/watch-screen.tsx` — presentation-only markup/class hooks; no behavior changes.
- Modify as needed: `src/app/(public)/dieu-khoan/page.tsx`, `src/app/admin/nguoi-dung/page.tsx` — presentation-only hooks.

**Interfaces:**
- Playback/auth/admin actions, server calls, fields, and routes remain unchanged.

- [ ] **Step 1: Align watch/player surroundings** with new visual system while keeping video dominant and episode controls accessible.
- [ ] **Step 2: Align auth, account, admin, terms and footer**; preserve form and data semantics.
- [ ] **Step 3: Run** `npm run typecheck`, `npm test`, `npm run build` and fix only regressions introduced by this work.
- [ ] **Step 4: Browser-smoke** homepage, live header search, browse, detail, watch, login, account entry, terms, mobile; verify no horizontal page overflow and reduced motion.
- [ ] **Step 5: Commit** final UI adjustments and record any unverified production-only constraints.
