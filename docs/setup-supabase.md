# Kết nối Supabase và Google cho VPhim

Người dùng đã cấu hình project Supabase Úc và deploy website. Hướng dẫn này vẫn dùng cho project mới; project Singapore đã được tạo theo yêu cầu. Nếu giữ dữ liệu hiện có, làm theo [quy trình migration](migrate-singapore.md), không tạo schema trùng bằng cách chạy lại hướng dẫn từ đầu trên bản restore.

## 1. Tạo project và cấu hình cục bộ

1. Tự đăng nhập [Supabase](https://supabase.com/dashboard), tạo project cho VPhim; giữ mật khẩu DB trong trình quản lý mật khẩu.
2. Trong dashboard lấy Project URL và publishable key. Lấy server secret/service-role key ở mục API keys dành cho server, tuyệt đối không dùng nó làm public key.
3. Sao chép `.env.example` thành `.env.local`, điền:

```dotenv
APP_ORIGIN=http://127.0.0.1:3000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=PUBLIC_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=SERVER_ONLY_KEY
```

Nếu mở site qua localhost thay vì 127.0.0.1, dùng cùng origin đó nhất quán. Đừng đưa `.env.local` vào Git hoặc gửi secret trong chat. Khởi động lại `npm run dev` sau khi đổi biến môi trường.

## 2. Tạo database và storage

Trong SQL Editor của project mới, chạy **đúng thứ tự**, mỗi file một lần:

1. `supabase/migrations/202611070001_core.sql`
2. `supabase/migrations/202611070002_operations.sql`

Migrations tạo bảng ứng dụng, trigger bootstrap user, RLS, private bucket `avatars`, RPC tiến độ/admin và audit. Không chạy lặp hoặc dùng database có bảng trùng tên. Với project đã có dữ liệu, dùng Supabase CLI migration workflow và backup trước.

Role member/normal/active được DB gán cố định lúc tạo user, không lấy role/VIP từ metadata. Không tắt RLS hoặc biến avatars thành bucket public để xử lý lỗi.

## 3. Email/mật khẩu và email xác nhận

- Auth → Providers → Email: bật email và **Confirm email**. Đặt minimum password length 8 hoặc cao hơn; nếu cao hơn 8 cần điều chỉnh form cùng chính sách.
- Auth → URL Configuration: Site URL = origin site. Cho phép redirect URLs `<origin>/auth/callback` và `<origin>/auth/callback?next=/dat-lai-mat-khau` (có thể dùng pattern `<origin>/auth/callback**` chỉ trong origin tin cậy).
- Thiết lập SMTP riêng cho môi trường thật. Email mặc định của Supabase có giới hạn gửi; không xem lỗi rate limit là lỗi UI.
- Email templates cho confirm signup và reset có thể dùng `{{ .ConfirmationURL }}` với callback PKCE tiêu chuẩn (mở cùng trình duyệt đã yêu cầu).
- Nếu muốn xác nhận trực tiếp bằng token_hash, template xác nhận trỏ đến `<origin>/auth/confirm?token_hash={{ .TokenHash }}&type=signup`; template khôi phục trỏ đến `<origin>/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/dat-lai-mat-khau`.

Kiểm tra đăng ký bằng email thật của bạn, mở email, đăng nhập; kiểm tra quên mật khẩu và liên kết hết hạn. Tài khoản bị khóa vẫn không được ghi dữ liệu ứng dụng dù reset mật khẩu thành công.

## 4. Google OAuth

1. Tạo hoặc chọn project trong [Google Cloud Console](https://console.cloud.google.com/), cấu hình OAuth consent screen và test users nếu ứng dụng đang ở chế độ Testing.
2. Tạo OAuth Client ID loại Web application. Authorized redirect URI là **URL callback của Supabase**, ví dụ `https://PROJECT.supabase.co/auth/v1/callback`, lấy nguyên giá trị trong Supabase Google provider.
3. Dán Client ID/secret vào Supabase Auth → Google; bật provider. Secret Google không cần đặt trong source VPhim.
4. VPhim gọi `/auth/google` → Supabase → Google → Supabase callback → `<origin>/auth/callback`.
5. Kiểm tra đăng nhập thành công, Google từ chối cấp quyền, email trùng tài khoản đăng ký và callback hết hạn. Giữ cơ chế verified identity linking của Supabase, không tự gộp người dùng bằng email do client gửi.

## 5. Cấp admin đầu tiên

Đăng ký tài khoản admin bằng luồng thông thường, xác nhận email. Trong SQL Editor, lấy đúng UUID user trong Auth → Users, thay placeholder rồi chạy:

```sql
update public.user_access
set role = 'admin'
where user_id = 'UUID_TAI_KHOAN_BAN_SO_HUU';
```

Đăng nhập lại và mở `/admin/nguoi-dung`. Không hardcode email trong mã; không cấp admin cho tài khoản không thuộc quyền kiểm soát của bạn. UI không có chức năng cấp quyền admin hoặc tác động admin khác.

Khóa user có hiệu lực ngay ở DB guard/RLS, kể cả access token cũ. Đồng bộ ban/unban Supabase Auth có thể cần thử lại; UI báo riêng trạng thái này. Dùng nút thử lại hoặc `npm run auth:sync` (Node 24+) để xử lý hàng đợi, không thay trực tiếp trạng thái ở Auth dashboard mà bỏ qua user_access. Worker dùng lease riêng cho mỗi user, giữ revision sau khi hoàn tất và đồng bộ lại nếu trạng thái đổi trong lúc gọi Auth. Nếu timeout, đợi ít nhất 2 phút cho lease hết hạn rồi thử lại; tác vụ pending không bị xóa. Với production, lên lịch chạy lệnh này định kỳ bằng scheduler của máy chủ để các lỗi tạm thời được xử lý lại.

## 6. Kiểm tra dữ liệu và bảo mật trên project TEST

`npm run test:db:local` không cần secret/cloud. Để test Supabase thật, tạo project riêng và áp migrations như trên.

SQL tests cần biến môi trường `TEST_DATABASE_URL` (connection string project TEST), `VPHIM_ALLOW_DB_TESTS=1`, rồi `npm run test:db`. Test fixtures dùng UUID cố định trong transaction rollback; không chạy trên project thật.

Hosted integration test tạo và xóa hai tài khoản test do script sở hữu, cần:

```dotenv
VPHIM_TEST_SUPABASE_URL=https://TEST_PROJECT.supabase.co
VPHIM_TEST_SUPABASE_PUBLISHABLE_KEY=TEST_PUBLIC_KEY
VPHIM_TEST_SUPABASE_SERVICE_ROLE_KEY=TEST_SERVER_KEY
VPHIM_ALLOW_INTEGRATION_TESTS=1
```

Đặt các giá trị qua environment của terminal (không in secret). `npm run test:integration` kiểm tra Auth thật, isolation A/B, user bị khóa với token cũ và RPC admin bị từ chối. Các biến TEST không mặc định lấy từ production `.env.local` để tránh chạy nhầm.

Storage upload/signed URL, Google consent/email deliverability và seek HLS giữa hai thiết bị vẫn cần smoke test thủ công với project đã cấu hình.
