# VPhim: điều khoản và hiệu năng Supabase

## Mục tiêu và hiện trạng

Người dùng yêu cầu đọc source mới nhất, thêm điều khoản tham khảo LyngFlix và khắc phục request Supabase mất khoảng 1–2 giây. Baseline `6b739d1`, cây Git sạch, 42 tests qua. Giữ các thay đổi auto-resume, cache phim, logo, loading và fallback nguồn nhúng.

Production: `https://vphim-one.vercel.app/`. Header đo ngày 2026-11-07 có `hkg1::iad1`, cho thấy hop xử lý tại Mỹ. Người dùng xác nhận Supabase hiện ở Úc và chọn chuyển **cả Supabase lẫn Vercel sang Singapore**. Email công khai đã xác nhận: `contact.vphim@gmail.com`.

## Các hướng đã xem xét

- Giữ Supabase Úc, Vercel Sydney: ít thao tác vận hành nhất, giữ URL/key hiện có. Đã đề xuất nhưng người dùng chọn Singapore.
- Supabase Singapore + Vercel `sin1`: đặt ứng dụng và database cùng vùng gần người dùng Việt Nam; cần project đích, chuyển dữ liệu và cấu hình lại Auth/OAuth. Đây là hướng người dùng chọn.

## Trang điều khoản

Thêm `/dieu-khoan` theo UI hiện có, bố cục dễ đọc trên mobile, mục lục liên kết theo section; thêm liên kết ở footer và đăng nhập/đăng ký cạnh các luồng email/Google. Không đổi logo, bảng màu hay thiết kế các trang phim.

Viết nội dung riêng cho VPhim về cơ chế KKPhim/nguồn thứ ba, quyền tác giả, yêu cầu gỡ bỏ hợp lệ, quy tắc dùng/tài khoản, dữ liệu cá nhân/cookie đăng nhập, độ tuổi, khả dụng, giới hạn trách nhiệm trong phạm vi pháp luật và cập nhật điều khoản. Email nhận phản ánh là `contact.vphim@gmail.com`. Nêu dữ liệu thực tế đang lưu và mục đích đồng bộ; không nói miễn trách nhiệm tuyệt đối, tự nhận đã có giấy phép, đăng ký DMCA, hoặc hứa thời hạn xử lý không được xác nhận. Không tự nhận phi thương mại/không quảng cáo vĩnh viễn hay quyền tự động đóng toàn web từ một email chưa xác minh. Nội dung không thay thế việc xin phép và thực hiện nghĩa vụ pháp luật.

## Tối ưu code

- Proxy dùng `getClaims()` theo SDK chính thức để refresh/kiểm tra token; public JWKS hiện có khóa ES256. Giữ cookie refresh truyền vào request/response. Không dùng `getSession().user` hay tự decode JWT để cấp quyền.
- Xác minh identity bằng SDK `getClaims()` và đọc `user_access` dùng chung một React `cache()` trong một render request; kiểm tra member/admin bên ngoài wrapper này. Không dùng cache chung/TTL cho user hoặc quyền; thao tác ghi và admin vẫn kiểm tra quyền, RLS vẫn bảo vệ token cũ bị khóa. React cache không đảm bảo dedup Server Actions/Route Handlers; tránh lặp bằng luồng gọi và truyền kết quả trong các service nội bộ nếu cần.
- Gộp resume + movie ref bằng PostgREST `movie_refs!inner`, đọc favorites theo slug qua join và chỉ lấy id/name playlist. Slug không unique: multiple-match phải trả lỗi thay vì chọn tùy tiện. Gộp đọc progress cho danh sách Xem tiếp thành hai query có giới hạn: tối đa 12 movie IDs và 12 episode keys (giao cắt tối đa 144 hàng), rồi ghép lại bằng cặp ID/tập chính xác; dùng SDK filter, không nội suy raw `.or`. Lỗi query không được giả thành chưa xem. Không thêm schema/migration chỉ để giảm request.
- Tách dữ liệu tài khoản tùy chọn bằng Suspense trong header, Xem tiếp, detail-actions và watch-content để shell/thông tin phim công khai không chờ user DB. Player chỉ mount sau khi chọn đúng tập resume; không phát tập đầu rồi nhảy sang tập cũ. SSR trạng thái yêu thích/resume vẫn đúng, không bật cache CDN cho nội dung cá nhân.
- Thêm đo thời gian opt-in, chỉ log loại endpoint, method, status và duration; không log query, slug riêng, token, email, body hoặc key. Dùng để so sánh số request trước/sau và region sau deploy.

## Singapore và dữ liệu production

Đặt `vercel.json` region `sin1`. Chuẩn bị hướng dẫn chuyển Supabase theo tài liệu chính thức: giữ UUID/Auth identity, database ứng dụng, avatar/storage và thiết lập email/Google/callback. Mặc định giữ toàn bộ dữ liệu; người dùng có thể cần đăng nhập lại, link recovery/OAuth cũ không mặc định còn hiệu lực. Không export user data, tạo project tính phí, thay secret production, đẩy Git hay redeploy trước khi có dự án đích/quyền truy cập và bước cutover cụ thể được xem xét. Không xóa project Úc; có đường rollback về cấu hình cũ. Kết nối Supabase hiện đã xác nhận; chỉ có project VPhim Úc trong organization `Vang-2812's Org` (free).

## Kiểm chứng và giới hạn

Test hành vi xác thực, user bị khóa/admin bị từ chối, refresh cookie và request/query budgets bằng SDK/fetch boundary phù hợp. Chạy toàn bộ unit/component tests, SQL/RLS local, TypeScript, build. Browser kiểm tra điều khoản, liên kết/footer/auth, responsive và phim/auto-resume không bị hỏng. Không viết tests chỉ đối chiếu nội dung văn bản hay file cấu hình.

Đo hiện tại: Auth health cold 1564ms, warm 497/237ms; JWKS 258/50/66ms từ máy kiểm tra. Public production chưa đăng nhập khoảng 350–546ms tới headers, không đại diện request user đăng nhập. Chưa có phép đo authenticated production. Không hứa tất cả request sẽ dưới một ngưỡng cố định; đo lại sau cutover Singapore.

## Ngoài phạm vi

Không thay nhà cung cấp Auth, mở rộng VIP/payment/CMS, tắt RLS, cache dữ liệu riêng giữa user, bypass bản quyền/CORS hoặc tạo tài khoản giả trên production. Chuyển hạ tầng chỉ được coi là hoàn tất khi region và smoke tests được kiểm tra trên deployment mới.
