# VPhim

Website xem phim tiếng Việt dùng **Next.js 16 + Supabase**, giao diện **Hallmark / Than & hổ phách**, phim và nguồn phát từ KKPhim.

## Chạy tại máy

Yêu cầu Node.js 24+ (đã kiểm tra với Node 24 LTS), npm. Worker Auth dùng khả năng chạy TypeScript của Node 24.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Mở [VPhim local](http://127.0.0.1:3000). Khi chưa cấu hình Supabase, bạn vẫn duyệt, tìm và xem phim từ API thật. Các nút đăng nhập báo chưa sẵn sàng; không có tài khoản giả.

## Kết nối tài khoản

Làm theo [hướng dẫn Supabase và Google](docs/setup-supabase.md), điền `.env.local`, chạy hai migrations theo thứ tự rồi khởi động lại ứng dụng. Không gửi secret key trong chat hay commit lên Git.

- Email/mật khẩu, xác nhận email, Google và khôi phục mật khẩu.
- Hồ sơ, avatar riêng tư, yêu thích và danh sách riêng.
- Tiến độ HLS và Xem tiếp giữa thiết bị; iframe chỉ nhớ tập.
- Admin xem/lọc user, khóa/mở, đổi thường/VIP; VIP có cùng chức năng với user thường.

## Kiểm tra

```powershell
npm test
npm run typecheck
npm run build
npm run test:db:local
```

`test:db:local` chạy SQL/RLS thật trên PostgreSQL WASM (PGlite) với schema mô phỏng biên Supabase Auth/Storage, không thay thế test dịch vụ Supabase thật. [Kết quả và giới hạn kiểm chứng](docs/validation.md).

Test hosted cần **project TEST riêng**, thông tin trong hướng dẫn Supabase. `npm run test:db` và `npm run test:integration` cố ý không báo pass khi thiếu cấu hình.

## Triển khai

[Hướng dẫn triển khai Next.js](docs/deployment.md). Chưa có dịch vụ cloud hoặc Supabase nào được tạo tự động. Poster/metadata và trạng thái nguồn phát phụ thuộc KKPhim. Không lưu hoặc proxy video.

Tài liệu: [thiết kế đã duyệt](docs/superpowers/specs/2026-11-07-vphim-design.md), [kế hoạch](docs/superpowers/plans/2026-11-07-vphim.md).
