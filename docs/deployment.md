# Triển khai VPhim

VPhim là ứng dụng Next.js có SSR, Server Actions, Proxy và Supabase; **không phải static export**.

## Môi trường hỗ trợ

Chọn dịch vụ chạy Next.js Node runtime, ví dụ Vercel, hoặc máy chủ Node 24+ (đã kiểm tra với Node 24 LTS). Worker Auth chạy TypeScript trực tiếp bằng Node; phiên bản tối thiểu của dự án là 24, cao hơn minimum của Next.js và Supabase SDK. Cài bằng `npm ci`, build `npm run build`, chạy `npm start` (mặc định loopback 127.0.0.1:3000; reverse proxy của máy chủ chuyển tiếp vào port này).

Website hiện đã được người dùng deploy tại `https://vphim-one.vercel.app`. Thay đổi lần này cấu hình `vercel.json` về `sin1` theo lựa chọn Singapore; không tự thay framework. Project Supabase Singapore đã tạo, nhưng kết nối production chưa đổi. Xem [quy trình chuyển và rollback](migrate-singapore.md) trước khi cập nhật env.

## Checklist cấu hình trước khi đưa lên mạng

- Hoàn thành `setup-supabase.md`, migrations, RLS và smoke tests trên môi trường riêng.
- Đặt `APP_ORIGIN` là HTTPS origin thực, không có path; chỉ public URL/publishable key dùng prefix NEXT_PUBLIC.
- Giữ service-role/Google secret trong secret manager/server environment. Public Supabase key không thay thế server key và ngược lại.
- Build lại sau khi đổi public environment vì Next đóng gói chúng vào client bundle.
- Cập nhật Supabase Site URL/redirect allowlist và Google callback cho staging/production. Không dùng wildcard rộng cho domain lạ.
- Database production không dùng biến `VPHIM_TEST_*` hoặc `TEST_DATABASE_URL` trong tác vụ test.
- Dùng HTTPS, cùng origin nhất quán. Test signup/confirm/Google/reset, ownership A/B, khóa user token cũ, avatar và phát HLS thực.
- Footer và form Auth liên kết `/dieu-khoan`; email liên hệ là `contact.vphim@gmail.com`. Nội dung điều khoản không thay cho việc có quyền phát hành và thực hiện các nghĩa vụ pháp lý áp dụng.
- Đo số request và region theo [performance](performance.md). `SUPABASE_TIMING=1` bật log timing đã loại dữ liệu nhạy cảm; mặc định tắt.

## Nguồn phim

Server gọi phimapi.com qua adapter cố định. Ảnh từ host đã cho phép; video được trình duyệt tải trực tiếp từ host nguồn. Nguồn HLS có thể đổi domain, lỗi CORS hoặc hết khả dụng; kiểm tra API thật trước khi bổ sung host cụ thể vào `media-policy.ts`. Không cho phép mọi URL và không tạo proxy video tùy ý.

## Bảo trì

Chạy `npm run auth:sync` khi dashboard báo job Auth đang chờ; DB status vẫn bảo vệ dữ liệu riêng. Migration mới phải có test RLS, backup và rollback strategy phù hợp dữ liệu thật. Không chạy lại toàn bộ core migration trên database đã tồn tại.
