# Triển khai VPhim

VPhim là ứng dụng Next.js có SSR, Server Actions, Proxy và Supabase; **không phải static export**.

## Môi trường hỗ trợ

Chọn dịch vụ chạy Next.js Node runtime, ví dụ Vercel, hoặc máy chủ Node 20.9+ tương thích. Cài bằng `npm ci`, build `npm run build`, chạy `npm start` (mặc định loopback 127.0.0.1:3000; reverse proxy của máy chủ chuyển tiếp vào port này).

Chưa tạo deployment, tài khoản cloud hay tên miền vì người dùng hiện yêu cầu chuẩn bị code và hướng dẫn, chưa có Supabase. Không tự chuyển framework sang Vinext hoặc SPA để khớp một hosting khác.

## Checklist cấu hình trước khi đưa lên mạng

- Hoàn thành `setup-supabase.md`, migrations, RLS và smoke tests trên môi trường riêng.
- Đặt `APP_ORIGIN` là HTTPS origin thực, không có path; chỉ public URL/publishable key dùng prefix NEXT_PUBLIC.
- Giữ service-role/Google secret trong secret manager/server environment. Public Supabase key không thay thế server key và ngược lại.
- Build lại sau khi đổi public environment vì Next đóng gói chúng vào client bundle.
- Cập nhật Supabase Site URL/redirect allowlist và Google callback cho staging/production. Không dùng wildcard rộng cho domain lạ.
- Database production không dùng biến `VPHIM_TEST_*` hoặc `TEST_DATABASE_URL` trong tác vụ test.
- Dùng HTTPS, cùng origin nhất quán. Test signup/confirm/Google/reset, ownership A/B, khóa user token cũ, avatar và phát HLS thực.

## Nguồn phim

Server gọi phimapi.com qua adapter cố định. Ảnh từ host đã cho phép; video được trình duyệt tải trực tiếp từ host nguồn. Nguồn HLS có thể đổi domain, lỗi CORS hoặc hết khả dụng; kiểm tra API thật trước khi bổ sung host cụ thể vào `media-policy.ts`. Không cho phép mọi URL và không tạo proxy video tùy ý.

## Bảo trì

Chạy `npm run auth:sync` khi dashboard báo job Auth đang chờ; DB status vẫn bảo vệ dữ liệu riêng. Migration mới phải có test RLS, backup và rollback strategy phù hợp dữ liệu thật. Không chạy lại toàn bộ core migration trên database đã tồn tại.
