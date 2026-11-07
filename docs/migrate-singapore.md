# Chuyển VPhim sang Singapore

## Trạng thái chuẩn bị

Theo lựa chọn đã duyệt của người dùng:

| Thành phần      | Hiện tại                       | Đích                              |
| --------------- | ------------------------------ | --------------------------------- |
| Website         | `https://vphim-one.vercel.app` | Giữ domain                        |
| Vercel Function | `iad1` (API đã xác nhận)       | `sin1` (`vercel.json`)            |
| Supabase        | `clwgfwegvuaszlzjcftm`, Sydney | `rusuztvsgccxgqicslzp`, Singapore |
| Organization    | Vang-2812's Org, free          | Cùng organization                 |

Project **VPhim Singapore** đã tạo, `ACTIVE_HEALTHY`, region `ap-southeast-1`, chi phí tạo project được Supabase báo 0 USD/tháng tại thời điểm thực hiện. Core/operations migrations đã áp dụng vào project đích trống, chưa có bản sao dữ liệu Auth/ứng dụng. Chưa thay kết nối production. Project cũ vẫn giữ nguyên. Người dùng đã yêu cầu **tạm dừng chuyển dữ liệu và hoàn tất code trước**; các bước còn lại bên dưới là runbook cho lần tiếp tục.

File `.env.singapore.local` (Git-ignored) chứa URL/publishable key đích; người dùng đã điền server key. `.env.local` vẫn trỏ project cũ. Đừng commit các file env, backup hoặc chuyển secret vào chat. Thao tác đổi setting Vercel qua connector còn bị 403 dù người dùng đã duyệt quyền team; region `sin1` hiện được chuẩn bị qua cấu hình source, không nhận là deployment đang chạy ở đó.

## Chuyển dữ liệu có giữ tài khoản

Khi tiếp tục, ưu tiên [quy trình backup/restore chính thức](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) với hai project đã nêu. Cần connection string Session pooler/DB password của cả hai project trong môi trường local, Supabase CLI/Docker và psql. Đích hiện đã có schema rỗng: phải lập kế hoạch đối chiếu/restore phù hợp hoặc dùng đích trống mới, không nhập schema dump trùng một cách mù quáng. Không dùng REST JSON export riêng bảng public để thay backup có Auth. Lần này automatic approval review từ chối export payload Auth/cá nhân qua connector; không có dữ liệu được xuất/chuyển thành công.

Trước khi restore, lưu snapshot mã/cấu hình và backup có thể phục hồi. Dữ liệu Auth cần giữ UUID, mật khẩu đã băm và identities; dữ liệu ứng dụng cần giữ toàn bộ quan hệ profile/access, phim tham chiếu, thư viện, phiên xem, tiến độ và audit. Không tạo lại user qua signup rồi gán lịch sử sang UUID khác. Giữ snapshot riêng tư ngoài Git. Đến lúc cutover cần tạm dừng ghi vào nguồn, lấy bản cuối và đối chiếu trước khi mở ghi ở đích; bản sao thử khi web còn hoạt động chưa phải dữ liệu cutover cuối.

VPhim có tùy chỉnh trên schema được Supabase quản lý: trigger `auth.users` gọi `private.bootstrap_user`, bucket private và policies trên `storage.objects`. Kiểm tra các tùy chỉnh đó theo tài liệu restore; không chỉ chuyển bảng public. Không chạy lại core migrations một cách mù quáng sau khi schema/data đã restore vì sẽ trùng đối tượng. Hai migrations trong repo là tham chiếu cấu trúc cần đối chiếu, không phải công cụ nhập toàn bộ user đang có.

Database backup không thay thế việc chuyển bytes avatar trong Storage. Tại lần kiểm tra chuẩn bị, bucket avatars có 0 object; cần kiểm tra lại lúc cutover và chuyển file nếu có phát sinh. Giữ bucket private, folder UUID và signed URL đúng.

## Cấu hình dịch vụ đích

- Điền server-only key mới vào `.env.singapore.local`; DB credentials chỉ cần cho migration, không đưa lên client.
- Cấu hình Email/Confirm email/SMTP và Google provider trên project mới. Khóa/provider settings không mặc định được chuyển theo database. Trong Google Cloud bổ sung callback `https://rusuztvsgccxgqicslzp.supabase.co/auth/v1/callback`; giữ callback cũ trong giai đoạn quay lại.
- Supabase Site URL = `https://vphim-one.vercel.app`; redirect allowlist gồm callback đăng nhập/reset của domain này và origin preview/local thực sự dùng. Xem [setup](setup-supabase.md).
- Thay cả URL, publishable key và server key cùng bộ trên môi trường preview trước. Người dùng có thể cần đăng nhập lại; không hứa cookie, link recovery hoặc OAuth cũ còn hiệu lực trên project khác.

## Kiểm tra và cutover

1. Đối chiếu số lượng và quan hệ Auth/application, RLS, triggers, RPC, bucket/policies; kiểm tra admin cũ vẫn đúng role. Chạy SQL/RLS tests trên project TEST riêng, không chạy fixture tests lên database có dữ liệu thật vừa chuyển.
2. Trên preview với Supabase đích: email login/reset/Google, tài khoản A/B, avatar, yêu thích/danh sách, resume đúng tập, blocked token và admin. Không tạo/xóa tài khoản test tùy tiện trên production.
3. Khi bước chuyển cuối được thống nhất, đổi env Production cùng bộ, triển khai commit đã kiểm tra. `NEXT_PUBLIC_*` được đóng gói khi build nên phải build/deploy lại. Không chỉ đổi URL ở runtime.
4. Xác nhận API deployment ghi region `sin1`; đo authenticated flow theo [performance](performance.md). Dữ liệu mới phải được ghi ở đích và không còn ghi ở nguồn.
5. Giữ backup/project Úc trong thời gian kiểm tra. Nếu rollback trước khi có ghi mới, phục hồi nguyên bộ env và deployment cũ. Nếu đích đã nhận ghi, dừng ghi và đối soát/chuyển dữ liệu phát sinh trước; quay lại env cũ đơn thuần sẽ làm mất những thay đổi đó.

Không xóa project Úc hoặc coi việc có `vercel.json` là đã chuyển xong hạ tầng. Trạng thái hoàn tất phải dựa trên migration, Auth/Storage smoke tests và deployment thực.
