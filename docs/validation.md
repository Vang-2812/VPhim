# Kiểm chứng VPhim

Ngày 2026-11-07. Các mục của lần bàn giao đầu bên dưới là lịch sử. Người dùng sau đó đã deploy website, cấu hình Supabase Úc và bổ sung auto-resume/cache/loading/logo/fallback nhúng.

## Cập nhật: điều khoản và hiệu năng

- Baseline đọc lại: `6b739d1`, 42 tests qua trước thay đổi. Hiện **58/58 tests trong 22 files** và **5/5 SQL/RLS suites** qua; TypeScript qua. Build production đã exit 0; kết quả cuối sau review cần dựa trên lần build mới nhất.
- Trang `/dieu-khoan` có nội dung VPhim riêng, contact đã xác nhận, liên kết footer/Auth và mục lục. Browser đã kiểm tra desktop và mobile 390px: không tràn ngang, anchor bản quyền và mailto đúng. Không coi nội dung điều khoản là bảo đảm miễn trách nhiệm hay đã có quyền khai thác phim.
- Claims + DB access guard, cookie refresh, diagnostic redaction, request budgets, duplicate slug và batch progress có tests. Supabase JS thật chạy với fake transport để kiểm tra query, không phải phép đo cloud. React cache chỉ có tác dụng trong render request.
- Đã xác nhận hạ tầng bằng connector: Vercel production `iad1`, Supabase Úc `ap-southeast-2`. Project **VPhim Singapore** đã tạo trong organization đã chọn, region `ap-southeast-1`, `ACTIVE_HEALTHY`; project nguồn và kết nối production không đổi. File env đích riêng chờ server key và quy trình migration; chưa nhận là chuyển hạ tầng xong.
- Xem [bằng chứng và cách đo hiệu năng](performance.md), [migration/cutover/rollback](migrate-singapore.md). Chưa đo authenticated production sau sửa; không hứa mốc RTT cố định.
- Hallmark: hai lỗi mới ở eyebrow/tracking của trang điều khoản đã bỏ. Các lỗi màu literal của logo/navigation-progress đã có ở baseline do thay đổi branding/loading của người dùng, được giữ nguyên để không thay thiết kế của họ; không báo static scan toàn repo sạch. Render runner chưa chạy.

## Đã kiểm tra

- Bộ unit/component tests: **31/31 qua trong 13 files**. Bao gồm config public/server, JSON legacy/v1, URL media, HTML nguồn phim, định danh tập, query filters, timeout/retry, safe redirect, active/admin guard, avatar validation/rollback/keyboard, player retry, writer 15 giây/không ghi song song và auth-sync lease.
- PostgreSQL cục bộ (PGlite) chạy migrations và **5/5 SQL suites**: ownership (gồm playlist/avatar), blocked token, admin/audit, progress concurrency và auth-sync lease/late worker. Đây là kiểm tra SQL/RLS thực trong engine local với mô phỏng schema Auth/Storage, không phải kết quả hosted Supabase.
- `npm run typecheck` và `npm run build` cuối đều exit 0 trên Node 24.15.0, Next.js 16.4.5.
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
- Khi tìm theo tên, nguồn không hỗ trợ kết hợp loại phim (phim lẻ/bộ/hoạt hình/TV). UI yêu cầu chọn “Tất cả loại phim”, thay vì âm thầm bỏ bộ lọc. Thể loại, quốc gia và năm vẫn kết hợp được.
- Review còn một lỗi nhỏ được hoãn: nút “Thử lại” trên màn hình lỗi khám phá dùng `href="?"`, nên xóa query/bộ lọc hiện tại; người dùng cần chọn lại. Không ảnh hưởng dữ liệu tài khoản.

## Kết quả review và quyết định thực hiện

Một lượt review độc lập toàn nhánh, sau đó một lượt sửa các lỗi Important. Các regression tests được xác nhận thất bại trước khi sửa và qua sau khi sửa. Không còn Critical/Important đã báo mà chưa xử lý:

- Auth-sync dùng lease theo user, giữ revision sau khi hoàn tất, xử lý trạng thái mới trong cùng worker và requeue khi worker cũ hoàn tất muộn. Admin action và CLI dùng chung worker. Timeout giữ lease 2 phút, sau đó cần retry; DB guard/RLS khóa ngay, Auth provider vẫn cần kiểm tra trên project thật.
- Định danh tập dựa vào ID hoặc slug/filename ổn định khi đổi thứ tự, xóa tập hay trùng slug giữa mùa; bỏ dữ liệu không phân biệt được an toàn. Nguồn đổi chính ID/filename có thể khiến lịch sử tập cũ không còn khớp.
- Tìm kiếm không âm thầm bỏ loại phim; lỗi gửi email reset không còn báo thành công giả, vẫn không tiết lộ tài khoản có tồn tại.
- Runtime dự án thống nhất Node 24+ trong package engines và hướng dẫn.

Các quyết định trong quá trình thực hiện:

1. Dùng nhánh mới `feat/vphim` ngay trong thư mục dự án trống, vì chưa có code hay nhánh main để bảo vệ; đổi lại ít cách ly checkout hơn worktree riêng.
2. Theo yêu cầu người dùng chưa có Supabase: bàn giao code và hướng dẫn, chưa tạo cloud/deployment; đổi lại cần smoke test hosted sau cấu hình.
3. Thêm PGlite để kiểm tra SQL/RLS ngay mà không cần cloud/Docker; đổi lại không chứng minh hành vi dịch vụ Auth/Storage hosted.
4. Gộp bản triển khai tích hợp ban đầu trong một commit để các route/context chạy được cùng nhau; đổi lại phạm vi commit review đầu lớn hơn.

## Cách tự kiểm chứng lại

```powershell
npm test
npm run test:db:local
npm run typecheck
npm run build
```

Sau khi có project TEST riêng: `npm run test:db`, `npm run test:integration`. Không dùng credentials production cho tests. Xem README và `setup-supabase.md`.
