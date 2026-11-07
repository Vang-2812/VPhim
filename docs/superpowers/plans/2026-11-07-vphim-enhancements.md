# Kế hoạch cải tiến VPhim: Auto-Resume, Loading & Hiệu năng, Logo & Favicon

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện 3 tính năng trọng yếu cho VPhim:
1. Tự động chuyển tiếp vào tập và vị trí đang xem dở khi người dùng mở phim từ bất kỳ đâu (không cần qua mục Xem tiếp).
2. Tối ưu tốc độ tải trang bằng `unstable_cache` cho danh sách phim và bổ sung thanh loading bar + skeletons cho trải nghiệm mượt mà.
3. Thiết kế logo vector và favicon nhận diện thương hiệu VPhim chuẩn Darkroom Amber.

**Architecture:** 
- Tầng Playback: Bổ sung `getMovieResume` tại `progress.server.ts` để đọc nhanh pointer tập/server từ Supabase `watch_resume`. Server Component `/xem/[slug]` và `/phim/[slug]` tự động khôi phục ngữ cảnh tập đang xem nếu client không truyền query parameters.
- Tầng Caching & UI Loading: Bọc `listMovies` bằng `unstable_cache` với thời gian revalidate 120s để loại bỏ nghẽn mạng từ upstream `phimapi.com`. Tích hợp `NavigationProgress` màu hổ phách phía client và bổ sung các route `loading.tsx` chuyên biệt.
- Tầng Branding: Thiết kế biểu tượng vector SVG chữ V cuộn phim hổ phách và đăng ký `src/app/icon.svg` để làm favicon chuẩn của Next.js 16.

**Tech Stack:** Next.js 16 (App Router, Turbopack, SSR), React 19, TypeScript 5.9, Supabase SSR, Lucide React, Vitest.

---

### Task 1: Tự động khôi phục tập đang xem (Auto-Resume)

**Files:**
- Modify: `src/features/playback/progress.server.ts`
- Modify: `src/app/(public)/xem/[slug]/page.tsx`
- Modify: `src/app/(public)/phim/[slug]/page.tsx`
- Test: `tests/unit/playback-resume.test.ts`

**Interfaces:**
- Produces: `getMovieResume(slug: string): Promise<Result<{ episodeKey: string; serverKey: string } | null>>`
- Consumes: `watch_resume` table in Supabase via `createServerSupabase()`

- [ ] **Step 1: Viết test cho `getMovieResume` và fallback auto-resume**

Viết file `tests/unit/playback-resume.test.ts` kiểm tra:
1. Khi có bản ghi `watch_resume`, hàm trả về đúng `{ episodeKey, serverKey }`.
2. Khi không có bản ghi hoặc user chưa đăng nhập, trả về `null`.
3. Khi `selectPlayback` nhận tập resume, chọn đúng tập đó thay vì tập 0.

- [ ] **Step 2: Chạy test để xác nhận test thất bại**

Run: `npx vitest run tests/unit/playback-resume.test.ts`
Expected: FAIL (hàm chưa tồn tại)

- [ ] **Step 3: Cài đặt `getMovieResume` trong `src/features/playback/progress.server.ts`**

Truy vấn bảng `watch_resume` theo `user_id` và `movie_ref_id` (lấy qua `movie_refs.slug = slug`). Trả về `{ episodeKey, serverKey }` nếu tồn tại.

- [ ] **Step 4: Cập nhật trang `/xem/[slug]` và `/phim/[slug]`**

- Tại `src/app/(public)/xem/[slug]/page.tsx`: Nếu `!p.episode`, gọi `getMovieResume(slug)`. Nếu có resume, truyền `serverKey` và `episodeKey` từ resume vào `selectPlayback`.
- Tại `src/app/(public)/phim/[slug]/page.tsx`: Kiểm tra resume của phim. Nếu đang xem dở tập nào, hiển thị nút "Tiếp tục xem" kèm link trực tiếp vào tập đó.

- [ ] **Step 5: Chạy test xác minh pass**

Run: `npx vitest run tests/unit/playback-resume.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/playback/progress.server.ts src/app/\(public\)/xem/\[slug\]/page.tsx src/app/\(public\)/phim/\[slug\]/page.tsx tests/unit/playback-resume.test.ts
git commit -m "feat: auto-resume playback from previous session"
```

---

### Task 2: Tối ưu hiệu năng tải trang & Hiệu ứng Loading

**Files:**
- Modify: `src/features/movies/client.server.ts`
- Create: `src/components/ui/navigation-progress.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/(public)/phim/[slug]/loading.tsx`
- Create: `src/app/(public)/kham-pha/loading.tsx`
- Test: `tests/unit/cache-movies.test.ts`

**Interfaces:**
- Produces: `NavigationProgress` component (client navigation feedback)
- Modifies: `listMovies` wrapped with Next.js `unstable_cache` (TTL 120s)

- [ ] **Step 1: Viết test cho `listMovies` cache**

Tạo `tests/unit/cache-movies.test.ts` kiểm thử việc chuẩn hóa tham số cache key và đảm bảo các request cùng query sử dụng cache.

- [ ] **Step 2: Chạy test xác nhận**

Run: `npx vitest run tests/unit/cache-movies.test.ts`

- [ ] **Step 3: Bọc `listMovies` bằng `unstable_cache` trong `src/features/movies/client.server.ts`**

Áp dụng `unstable_cache` cho hàm gọi danh sách phim với revalidation thời gian 120 giây (tag: `kkphim-list`).

- [ ] **Step 4: Tạo component `NavigationProgress` và thêm vào `RootLayout`**

- Tạo `src/components/ui/navigation-progress.tsx`: Bắt sự kiện click vào các thẻ liên kết nội bộ `<a>` để kích hoạt thanh tiến trình màu hổ phách chạy ngang mép trên cùng màn hình. Tự động hoàn thành khi đường dẫn URL thay đổi (`usePathname`, `useSearchParams`).
- Nhúng `<NavigationProgress />` vào đầu `src/app/layout.tsx`.

- [ ] **Step 5: Thêm giao diện Skeleton Loading cho các trang chính**

- Tạo `src/app/(public)/phim/[slug]/loading.tsx`: Skeleton gồm poster, tiêu đề, tóm tắt và lưới tập phim.
- Tạo `src/app/(public)/kham-pha/loading.tsx`: Skeleton thanh lọc và lưới 18 poster phim.

- [ ] **Step 6: Chạy toàn bộ test xác minh pass**

Run: `npm test`
Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/movies/client.server.ts src/components/ui/navigation-progress.tsx src/app/layout.tsx src/app/\(public\)/phim/\[slug\]/loading.tsx src/app/\(public\)/kham-pha/loading.tsx tests/unit/cache-movies.test.ts
git commit -m "perf: cache movie lists and add navigation loading indicators"
```

---

### Task 3: Thiết kế Logo vector & Favicon VPhim

**Files:**
- Create: `src/components/ui/logo.tsx`
- Create: `src/app/icon.svg`
- Modify: `src/components/layout/site-header.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/components/logo.test.tsx`

**Interfaces:**
- Produces: `<VPhimLogo size={number} showText?: boolean />`
- Produces: `src/app/icon.svg` (Next.js automatically generates browser favicon and apple touch icon)

- [ ] **Step 1: Viết test cho `VPhimLogo` component**

Tạo `tests/components/logo.test.tsx` kiểm thử component render đúng SVG với thuộc tính accessibility `aria-label="VPhim"` và tùy chọn ẩn/hiện chữ.

- [ ] **Step 2: Chạy test xác nhận**

Run: `npx vitest run tests/components/logo.test.tsx`
Expected: FAIL (chưa có logo)

- [ ] **Step 3: Tạo `src/components/ui/logo.tsx`**

Thiết kế logo SVG đồng bộ với phong cách Hallmark Amber:
- Biểu tượng: Chữ **V** tạo hình từ dải phim uốn lượn đa lớp với gradient hổ phách phát sáng (`#f59e0b` đến `#d97706`).
- Typography: Chữ "VPhim" sắc nét, hiện đại.

- [ ] **Step 4: Tạo `src/app/icon.svg`**

Tạo file SVG 32x32 biểu tượng VPhim làm favicon chính thức cho toàn bộ website.

- [ ] **Step 5: Cập nhật Header và Footer**

- Trong `src/components/layout/site-header.tsx`: Thay thế `Clapperboard` bằng `<VPhimLogo size={28} />`.
- Trong `src/app/layout.tsx`: Cập nhật footer sử dụng `<VPhimLogo size={24} />`.

- [ ] **Step 6: Chạy kiểm thử toàn bộ dự án**

Run: `npm test`, `npm run typecheck`, `npm run build`
Expected: Exit 0 cho tất cả.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/logo.tsx src/app/icon.svg src/components/layout/site-header.tsx src/app/layout.tsx tests/components/logo.test.tsx
git commit -m "feat: brand identity with custom vector logo and favicon"
```
