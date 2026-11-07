# Kiểm chứng VPhim

Ngày 2026-11-07. Code và hướng dẫn cấu hình là phạm vi bàn giao hiện tại; người dùng xác nhận chưa có project Supabase.

## Đã kiểm tra

- Bộ unit/component tests: config public/server, JSON legacy/v1, URL media, HTML nguồn phim, định danh tập, query filters, timeout/retry, safe redirect, active/admin guard, avatar validation/rollback/keyboard, player retry, writer 15 giây/không ghi song song, auth-sync revision.
- PostgreSQL cục bộ (PGlite) chạy migrations và bốn SQL suites: ownership (gồm playlist/avatar), blocked token, admin/audit và progress concurrency. Đây là kiểm tra SQL/RLS thực trong engine local với mô phỏng schema Auth/Storage, không phải kết quả hosted Supabase.
- Next.js production build và TypeScript đã chạy thành công; cần xem kết quả kiểm tra cuối nếu mã được thay đổi sau đó.
- API KKPhim live: feed, phim bộ, search `batman`, category/country, chi tiết `xom-nho`; HLS manifest mẫu phản hồi HEAD 200. Bộ lọc danh mục hiện dùng response wrapper `data.items`, đã bổ sung regression test.
- Browser: trang chủ có ảnh và tên phim thật; tìm kiếm Batman trả kết quả và pagination. Layout home tại 360/768/1280/1920px không tràn ngang (DOM scrollWidth không vượt viewport).
- Player nhận tập/nguồn từ API, hiển thị lỗi khi nguồn browser không tải được và chuyển sang iframe có thông báo giới hạn tiến độ.
- Hallmark static scan: không còn Floor failures sau chỉnh token/spacing/eyebrow; một số cảnh báo được xem xét theo ngữ cảnh trong phần dưới.

## Giới hạn đã biết

- Chưa có project Supabase: chưa kiểm tra live email, Google, reset, upload/sign URL, hai thiết bị thật hoặc admin/Auth API thật. Hosted test scripts không báo pass khi thiếu cấu hình.
- Nguồn HLS Xóm Nhỏ phản hồi HEAD 200 qua terminal nhưng trình duyệt trong phiên này không tải được media; không nhận là đã phát/seek thành công. Video phụ thuộc khả dụng/CORS của nhà cung cấp; không proxy video để vượt hạn chế. Fallback nhúng đã render nhưng không coi iframe có mặt là bằng chứng video phát được.
- Hallmark render runner cần Puppeteer/Chrome integration riêng, không được cài/chạy; browser QA được thực hiện qua CUA ở các viewport nêu trên. Không báo render-lint pass.
- Cảnh báo Hallmark về measure ngắn áp vào caption/đoạn giới thiệu một câu, không phải nội dung dài. Lazy poster ở thư viện/grid thường nằm dưới heading/hero; cần đánh giá LCP trên hosting thật khi có dữ liệu người dùng.
- Chưa triển khai public hoặc mua dịch vụ. Có hướng dẫn Next.js Node deployment và cấu hình callback trong `setup-supabase.md`.

## Cách tự kiểm chứng lại

```powershell
npm test
npm run test:db:local
npm run typecheck
npm run build
```

Sau khi có project TEST riêng: `npm run test:db`, `npm run test:integration`. Không dùng credentials production cho tests. Xem README và `setup-supabase.md`.
