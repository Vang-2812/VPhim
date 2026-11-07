# Thiết kế VPhim — phiên bản đầu

Ngày: 2026-11-07 (Asia/Saigon)

Trạng thái: người dùng đã duyệt ngày 2026-11-07 bằng phản hồi “ok roi”. Đây là tài liệu thiết kế đã chốt, chưa phải sản phẩm đã hoạt động.

Builder check: một reviewer độc lập đã đọc tài liệu và trả lời “nothing important left”; không còn câu hỏi quan trọng để lập kế hoạch. Đây là đánh giá độ đầy đủ của thiết kế, không phải kết quả kiểm thử sản phẩm.

## 1. Mục đích và hiện trạng

Xây website xem phim tiếng Việt, tập trung vào trải nghiệm khám phá/xem phim và quản lý người dùng. KKPhim cung cấp danh mục, thông tin, hình ảnh, danh sách tập và URL nguồn phát. VPhim quản lý tài khoản, dữ liệu cá nhân và quyền quản trị; không xây kho lưu video.

Thư mục dự án hiện chưa có mã sản phẩm, package.json hay Git repository. Các file trong `.superpowers/brainstorm/` chỉ là bản minh họa bỏ đi, không được coi là nền tảng sản phẩm. Tài liệu này chưa thể commit vì dự án chưa có Git; khởi tạo Git và commit tài liệu ở bước triển khai sau khi thiết kế được duyệt. Không tạo dự án hoặc cài dependency ở giai đoạn thiết kế.

## 2. Các quyết định người dùng đã chốt

- Dùng Hallmark để thiết kế UI.
- Chọn bảng màu B: Than & hổ phách, tham chiếu Hallmark Darkroom amber.
- Tham chiếu ảnh trang tài khoản: hồ sơ, avatar, giới tính, yêu thích, danh sách và xem tiếp.
- Khách được tìm và xem phim mà không đăng nhập.
- Tài khoản đăng ký và đăng nhập Google; dùng email/mật khẩu cho luồng tài khoản đăng ký.
- Người đăng nhập đồng bộ yêu thích, danh sách cá nhân và tiến độ xem giữa thiết bị.
- User thường và VIP hiện có cùng chức năng.
- Có admin xem người dùng, khóa/mở tài khoản và đổi loại thường/VIP.
- Chọn hướng 1: Next.js + Supabase.

Các chi tiết ở phần sau chưa được hỏi riêng được đánh dấu là **đề xuất của người thiết kế**; duyệt tài liệu sẽ chốt chúng cho bản đầu.

## 3. Mục tiêu, ngoài phạm vi và điều cần tránh

### Mục tiêu

- Luồng chính rõ ràng: khám phá → chi tiết → chọn tập → xem.
- Giao diện tốt trên điện thoại và máy tính, chữ tiếng Việt rõ và thao tác bàn phím được.
- Tài khoản dùng được thật: đăng ký, xác thực email, đăng nhập, Google, khôi phục mật khẩu, đăng xuất và cập nhật hồ sơ.
- Dữ liệu cá nhân đúng chủ sở hữu; thao tác admin được kiểm tra quyền phía server.
- Nguồn phim lỗi phải có thông báo và thử lại, không làm mất điều hướng hoặc dữ liệu cá nhân.

### Ngoài phạm vi bản đầu — đề xuất

- Thanh toán, gói thuê bao, giới hạn phim theo VIP hoặc bán quyền xem.
- Tải phim về máy, lưu/truyền lại video, transcoding hoặc CDN video riêng.
- CMS nhập/sửa phim, quản lý nguồn phim thủ công, thêm nguồn ngoài KKPhim.
- Bình luận, đánh giá tự tạo, chia sẻ danh sách công khai, bạn bè, nhiều hồ sơ trong một tài khoản, AI đề xuất phim.
- Xóa tài khoản qua admin, sửa email qua hồ sơ, cấp quyền admin trên UI, thống kê kinh doanh.

### Điều cần tránh

- Ép đăng nhập trước khi xem phim; quảng cáo hoặc popup tự phát do VPhim chèn thêm.
- Chỉ ẩn nút admin mà không kiểm tra quyền thật; cho user sửa loại tài khoản hoặc trạng thái khóa.
- Dữ liệu mock được trình bày như tài khoản/phim thật; nút báo lưu thành công khi chưa lưu.
- Hứa tiếp tục đúng giây với trình phát iframe không có giao thức trao đổi tiến độ.

## 4. Approaches — các hướng đã cân nhắc

| Hướng | Lợi ích | Đánh đổi | Kết quả |
| --- | --- | --- | --- |
| Next.js + Supabase | Tập trung vào UI; có Auth, PostgreSQL và Storage; ít hệ thống riêng để vận hành | Phụ thuộc cấu hình Supabase, Google OAuth và dịch vụ email | Người dùng chọn hướng này |
| Next.js + backend riêng + PostgreSQL | Chủ động sâu về backend, đăng nhập và vận hành | Nhiều mã và công việc triển khai/bảo trì hơn | Không chọn vì vượt mức cần thiết của bản đầu |

Lý do đề xuất hướng được chọn: phần khác biệt của VPhim nằm ở giao diện và dữ liệu người dùng, trong khi nội dung phim đã có nguồn ngoài.

## 5. Thiết kế giao diện

### Hệ thống hình ảnh — đề xuất từ lựa chọn B

- Nền than ấm, bề mặt nâng nhẹ bằng độ sáng, chữ trắng ngà; hổ phách dành cho nút chính, mục đang chọn và focus. Không dùng nền vàng cho cả khu vực lớn.
- Dùng token theo vai trò cho mọi màu, font, khoảng cách và trạng thái. Khởi đầu từ token Hallmark Darkroom amber; màu chữ phụ phải đủ tương phản, không giữ nguyên token nếu kiểm tra cho thấy khó đọc.
- Trang tài khoản và admin dùng nhánh Hallmark app screens: font sans hỗ trợ tiếng Việt, nhãn dễ đọc, mật độ phù hợp form/bảng; không ép font tiêu đề trang trí của theme vào dữ liệu.
- Chọn Be Vietnam Pro hoặc một font sans tương đương có đủ tiếng Việt; tối đa hai họ font. Đây là đề xuất, builder được chọn chính xác theo kiểm tra tải font và độ đọc.
- Header có VPhim, khám phá, phim lẻ, phim bộ, tìm kiếm và tài khoản. Điện thoại gộp điều hướng vào menu, không giấu tìm kiếm hay chọn tập.
- Theo bố cục tài khoản tham chiếu, các mục Yêu thích / Danh sách / Xem tiếp / Tài khoản nằm trong cùng khu vực; màn hình hẹp chuyển thành tab/menu.
- Motion chỉ hỗ trợ thay đổi trạng thái; có focus rõ, reduced motion, không carousel tự chạy hay tự phát video.
- Bố cục giới hạn chiều rộng khoảng 1280px; grid poster thay đổi theo không gian thực, không làm tràn ngang ở 360px.

### Các trang và hành vi

| Trang | Nội dung và thao tác |
| --- | --- |
| `/` | Phim mới cập nhật, lối vào phim lẻ/phim bộ, tìm kiếm; người đăng nhập có mục Xem tiếp nếu có dữ liệu. Nội dung nổi bật lấy từ dữ liệu thật, không tự gán nhãn top lượt xem. |
| `/kham-pha` | Grid phim, bộ lọc loại/thể loại/quốc gia/năm, sắp xếp và phân trang. Từ khóa và bộ lọc nằm trong URL, điều hướng Back giữ ngữ cảnh. |
| `/phim/[slug]` | Poster, tên, mô tả, metadata có thật, nút xem, yêu thích và thêm vào danh sách; tập và server từ API. |
| `/xem/[slug]` | Player 16:9, server/ngôn ngữ, tập đang chọn, danh sách tập, nút tập trước/sau; tập và server có trong query URL. Không tự chuyển tập ở bản đầu. |
| `/dang-nhap`, `/dang-ky` | Email/mật khẩu, Google, thông báo lỗi, trạng thái đang gửi; tiếp tục về trang nội bộ ban đầu sau đăng nhập. |
| `/quen-mat-khau`, `/dat-lai-mat-khau` | Yêu cầu email và đặt mật khẩu mới sau callback hợp lệ. Không cho biết email có tồn tại hay không. |
| `/tai-khoan` | Email chỉ đọc, tên hiển thị, giới tính không bắt buộc, avatar; đổi mật khẩu qua luồng khôi phục/xác thực lại. |
| `/tai-khoan/yeu-thich` | Bật/tắt yêu thích, mở phim, trạng thái trống. |
| `/tai-khoan/danh-sach` | Tạo, đổi tên, xóa danh sách riêng tư; thêm/xóa phim; xác nhận trước khi xóa danh sách. |
| `/tai-khoan/xem-tiep` | Các phim xem gần đây, tập và tiến độ nếu có; tiếp tục xem hoặc xóa lịch sử của phim đó. |
| `/admin/nguoi-dung` | Danh sách phân trang: tên, email, ngày tham gia, loại tài khoản, trạng thái; tìm theo tên/email, lọc loại/trạng thái, khóa/mở và đổi thường/VIP. Không có dashboard số liệu giả. |

Khách bấm yêu thích/thêm danh sách được mời đăng nhập và quay lại trang phim; không tự tạo dữ liệu trước khi người dùng xác nhận thao tác sau đăng nhập. Nút Xem vẫn dùng được.

Mọi vùng tải dữ liệu có bốn trạng thái: loading, empty, error, full. Form có validation, pending, success và lỗi lưu; chỉ báo thành công khi backend xác nhận. Khi chưa cấu hình Supabase, browsing phim vẫn hoạt động nếu nguồn truy cập được, nhưng thao tác cần tài khoản báo chưa sẵn sàng, không giả lập đăng nhập.

## 6. Kiến trúc và tích hợp KKPhim

### Thành phần — đề xuất

- Next.js App Router + TypeScript. Server Components cho nội dung ban đầu; Client Components cho player, form, tìm kiếm và thao tác trạng thái.
- Route handlers/server actions xử lý thao tác ghi và admin. Supabase SSR quản lý session; kiểm tra session đáng tin ở server, không dựa riêng cookie do client tự khai.
- Supabase Auth cho email/mật khẩu và Google; PostgreSQL cho dữ liệu ứng dụng; Storage cho avatar.
- CSS/token Hallmark dùng chung. Chi tiết thư viện component, form và validation để builder quyết định; không áp đặt một bộ UI làm mất màu B.

### Adapter nguồn phim

Base URL cố định `https://phimapi.com`. Dùng adapter phía server để chuẩn hóa JSON khác dạng giữa endpoint cũ/v1; không tạo endpoint proxy nhận URL tùy ý.

| Mục đích | Endpoint tài liệu KKPhim |
| --- | --- |
| Phim mới | `/danh-sach/phim-moi-cap-nhat?page=...` |
| Theo loại | `/v1/api/danh-sach/{type}` |
| Tìm kiếm | `/v1/api/tim-kiem?keyword=...` |
| Chi tiết và tập | `/phim/{slug}` |
| Danh mục | `/the-loai`, `/quoc-gia` |

Các endpoint/bộ lọc phải được kiểm tra response thật trong giai đoạn triển khai; nếu tài liệu khác response, sửa adapter trong cùng phạm vi thay vì đổi nhà cung cấp. Hiện đọc được tài liệu chính thức; chưa xác minh response trực tiếp do công cụ web không mở được JSON và sandbox chặn socket. Điều này là giới hạn kiểm chứng của phiên thiết kế, không phải kết luận KKPhim đang ngừng hoạt động.

Đề xuất timeout khoảng 10 giây, một lần thử lại cho GET lỗi tạm thời, cache danh sách/chi tiết khoảng 5 phút và danh mục khoảng 24 giờ. Cache chỉ chứa dữ liệu công khai; không cache nội dung tài khoản chung giữa user. Có fallback ảnh lỗi và trạng thái nguồn chưa sẵn sàng, không đổi thành phim giả. Phân trang và giới hạn kết quả theo response thực, không giả định mọi endpoint hỗ trợ `limit`.

Mô tả phim từ API được coi là nội dung không đáng tin; render text hoặc sanitize HTML bằng allowlist. URL ảnh/player phải là HTTPS từ nguồn đã kiểm tra; chặn javascript/data URL và không chèn HTML từ provider trực tiếp. Builder xác minh host ảnh và host phát thực tế rồi cấu hình allowlist phù hợp.

Không đồng bộ toàn bộ catalog vào database. Lưu định danh phim cùng snapshot tên/ảnh tối thiểu khi người dùng thêm phim hoặc bắt đầu xem; snapshot giúp giữ danh sách nếu phim tạm mất khỏi nguồn. Nguồn phát luôn được lấy lại từ API khi mở player, không lưu URL stream dài hạn.

### Player và tiến độ — đề xuất quan trọng

- Ưu tiên `link_m3u8` với HTML video/HLS, native khi trình duyệt hỗ trợ, thư viện HLS ở các trình duyệt còn lại. Không proxy hay lưu video trên server VPhim.
- HLS cần xác minh CORS, seek và phát thật trên trình duyệt khi triển khai. Chọn nguồn khác hoặc báo lỗi nếu nguồn hỏng.
- Nếu HLS không dùng được nhưng `link_embed` hợp lệ thì có fallback iframe với thông báo ngắn rằng không lưu được vị trí chính xác; không đọc nội dung cross-origin, không hứa resume đúng giây. Vẫn ghi nhận phim/tập/server vừa mở.
- Khi có thời gian video, lưu tiến độ khoảng mỗi 15 giây và khi pause/ended/đổi tập; ghi lúc rời trang là best effort, không phải cơ chế duy nhất.
- Đăng nhập mới đồng bộ tiến độ. Khách không có lịch sử đồng bộ; lưu cục bộ cho khách không thuộc bản đầu.
- Mỗi phim có một resume pointer đến tập xem gần nhất; tiến độ lưu riêng theo tập. Khi tiếp tục, xác minh tập còn tồn tại ở API, ưu tiên server cũ nếu còn, nếu mất thì mời chọn lại.
- Resume sau metadata với vị trí trong khoảng hợp lệ. Đánh dấu tập hoàn tất từ 95% hoặc sự kiện ended; tiếp tục tập hoàn tất sẽ mở lại từ đầu. Không tự nhảy sang tập sau.
- Hai thiết bị cùng ghi: dùng thứ tự bản ghi đã được server chấp nhận, không tin thời gian thiết bị; bỏ request đến muộn của cùng phiên phát, mỗi phiên chỉ có một request ghi đang chạy. Một phiên xem cũ không được tự giành lại resume pointer sau khi thiết bị khác mở tập mới; có thể cập nhật tiến độ tập cũ nhưng pointer chỉ đổi khi bắt đầu/tiếp tục một lượt xem chủ động.

## 7. Tài khoản và dữ liệu cá nhân

### Auth — đề xuất

- Đăng ký email/mật khẩu có xác nhận email; Google dùng OAuth chính thức qua Supabase. Callback chỉ cho phép redirect nội bộ đã kiểm tra.
- Giữ chính sách link identity email đã xác thực của Supabase; không tự ghép hai user bằng email do client gửi. Các identity cùng Supabase user ID chia sẻ dữ liệu; xử lý lỗi liên kết bằng thông báo và luồng chuẩn của provider.
- Mật khẩu do Supabase Auth quản lý; bảng ứng dụng không lưu mật khẩu. Đăng xuất thiết bị hiện tại, không thêm quản lý thiết bị/phien vào UI bản đầu.
- Chỉ cập nhật tên và giới tính ở hồ sơ. Tên 1–80 ký tự sau trim; giới tính `male`, `female`, `unspecified`, mặc định `unspecified`.
- Avatar JPEG/PNG/WebP, tối đa 2 MB, kiểm tra nội dung thực, không SVG; tên file ngẫu nhiên trong thư mục riêng user. Bucket riêng tư, URL ký ngắn hạn để hiển thị; ảnh mới được lưu thành công trước khi thay/xóa ảnh cũ. Google avatar chỉ dùng làm nguồn tạo avatar ban đầu khi hợp lệ, có fallback chữ cái.
- Danh sách riêng tư, tên 1–80 ký tự; một phim xuất hiện tối đa một lần trong cùng danh sách. Xóa danh sách không xóa yêu thích hoặc lịch sử.

### Dữ liệu dự kiến

| Bảng | Trường chính và ràng buộc |
| --- | --- |
| `profiles` | `id` trùng Auth user ID; `display_name`, `gender`, `avatar_path`, timestamps. Không chứa role/membership/status. |
| `user_access` | `user_id`, `role` (`member`/`admin`), `membership` (`normal`/`vip`), `status` (`active`/`blocked`), timestamps. User không có quyền sửa trực tiếp. |
| `movie_refs` | ID/slug KKPhim và snapshot tên, ảnh; adapter chuẩn hóa định danh, giữ cả ID lẫn slug khi có. Chỉ server cập nhật snapshot; không được coi là catalog riêng. |
| `favorites` | `user_id`, `movie_ref_id`, `created_at`; unique cặp user/phim. |
| `playlists` | `id`, `user_id`, `name`, timestamps. |
| `playlist_items` | `playlist_id`, `movie_ref_id`, `added_at`; unique playlist/phim; quyền phụ thuộc chủ playlist. |
| `watch_progress` | `user_id`, `movie_ref_id`, `episode_key`, `server_key`, position/duration (nullable với iframe), `completed`, playback session/sequence, timestamps; unique user/phim/tập. |
| `watch_resume` | Unique user/phim; trỏ tập/server và phiên xem chủ động gần nhất, thời điểm xem do server ghi. |
| `admin_audit_logs` | Actor, target, action, giá trị trước/sau, thời điểm; append-only từ server. Không lưu token hoặc mật khẩu. |

Builder quyết định chính xác migrations, indexes và các tên nội bộ. `episode_key` phải được tạo từ định danh tập ổn định có trong response; không dùng số thứ tự mảng, không gộp các mùa hay tập khác nhau chỉ vì cùng tên. Có thể đổi server mà không làm mất tiến độ của cùng tập.

### Quyền truy cập và admin

- Trigger khi tạo Auth user sinh `profiles` và `user_access` với `member`/`normal`/`active`; không lấy role hoặc VIP từ metadata người dùng tự đặt.
- RLS cho mọi bảng riêng tư và storage: chỉ chủ sở hữu đang active được đọc/ghi dữ liệu của mình; `playlist_items` kiểm tra chủ playlist, không tin ID playlist truyền vào. Các trường hồ sơ được phép sửa phải được giới hạn bằng quyền cột/RPC, không chỉ điều kiện hàng.
- Hàm kiểm tra active/admin dùng quyền tối thiểu, search path cố định và tránh RLS đệ quy. Admin không mặc định được đọc yêu thích/lịch sử riêng của user khác.
- Role admin tách hoàn toàn khỏi membership; VIP không cấp quyền admin và không đổi quyền xem phim.
- Mọi admin request xác minh identity, `active` và `admin` ở server; Supabase service-role key chỉ nằm server và chỉ được gọi sau kiểm tra này, không nằm trong bundle hay biến `NEXT_PUBLIC_*`.
- Cấp admin đầu tiên bằng thủ tục vận hành sau khi tài khoản thực đã được tạo; không hardcode email trong mã hay tự nâng quyền từ client. UI không cấp thêm admin trong bản đầu.
- Đề xuất chỉ cho thao tác khóa/mở/đổi loại đối với tài khoản member; admin không tự khóa mình hoặc tác động admin khác qua UI/API của bản đầu. Thay đổi admin ngoài UI cần vận hành riêng.
- Khóa tài khoản cập nhật `user_access.status` làm nguồn kiểm tra chung, thu hồi/chặn session Auth theo khả năng provider. Access token cũ cũng bị RLS và server guard từ chối; không chỉ chờ token hết hạn. Mở lại không tự đổi membership.
- User bị khóa vẫn có quyền truy cập phim công khai như khách, nhưng không được vào hồ sơ/admin hoặc ghi dữ liệu cá nhân. UI kết thúc session và giải thích ngắn gọn.
- Ghi audit cùng thao tác thay đổi trạng thái/loại trong transaction database; việc thu hồi session provider nếu thất bại phải được ghi nhận để thử lại, không bỏ chặn RLS đã có.
- Truy vấn tên/email và lọc user được thực hiện server, có phân trang và giới hạn. Không tải toàn bộ Auth directory xuống trình duyệt.

## 8. Cấu hình, vận hành và triển khai

- Cần Supabase project URL/public publishable key, server secret/service-role key, Google OAuth client cấu hình trong Supabase, callback URLs và dịch vụ gửi email Auth. Người vận hành cung cấp qua environment/dashboard; không đưa secret vào chat, source hay log.
- Có migrations, `.env.example` không chứa secret và hướng dẫn cấu hình; môi trường chưa đủ cấu hình phải được mô tả trung thực. Không dùng tài khoản hoặc session mock như phương án thay thế tính năng thật.
- Đề xuất kiểm chứng bản local trước, sau đó môi trường thử nghiệm hỗ trợ Next.js. Tên miền, tài khoản hosting, thông tin đăng nhập và cấu hình live chưa được cung cấp, chưa có dịch vụ cloud nào được tạo.
- Không coi URL preview tĩnh hay iframe chụp ảnh là bản triển khai đủ auth/backend. Nếu dùng Sites để hosting, phải chứng minh build/runtime Next.js được hỗ trợ và auth callback tương thích; nếu không, giữ project Next.js chuẩn và chọn hosting Node tương thích, không tự chuyển framework đã chốt.
- Bản đầu dùng tiếng Việt, tên VPhim là wordmark chữ. Không tạo logo khác hoặc favicon bằng tài sản thương hiệu bên ngoài. Poster/hình phim lấy từ dữ liệu thực của nguồn, không dùng ảnh stock thay cho poster.
- Chưa đặt cam kết lưu lượng, uptime hay chi phí; chọn cấu hình không phát sinh gói trả phí mà chưa có yêu cầu cụ thể.

## 9. Tiêu chí nghiệm thu

1. Khách duyệt danh sách, tìm/lọc, mở chi tiết và phát ít nhất một nguồn thực khi môi trường cho phép; không bị chặn bởi đăng nhập.
2. Email đăng ký/xác nhận, đăng nhập, reset mật khẩu, Google callback và đăng xuất chạy với Supabase đã cấu hình; redirect không dẫn ra domain tùy ý.
3. Sửa hồ sơ/avatar được lưu thật; lỗi upload/backend không báo thành công giả.
4. Yêu thích và danh sách bền vững sau reload và đồng bộ ở hai session; user A không đọc/ghi được dữ liệu riêng của B kể cả gọi API trực tiếp.
5. Với nguồn HLS seek được, lưu/khôi phục đúng tập và gần đúng thời điểm trên thiết bị thứ hai; với iframe hiển thị giới hạn và không hiện tiến độ giả.
6. Admin lọc/xem user, khóa/mở và đổi thường/VIP; user thường gọi API admin bị từ chối. Token có trước khi khóa cũng không được ghi hồ sơ/yêu thích/lịch sử; trang phim công khai còn dùng được.
7. VIP và thường có cùng tập tính năng. Admin role không bị suy ra từ badge hay metadata client.
8. Hiển thị được loading/empty/error, retry khi API lỗi; phim/ảnh/tập mất khỏi nguồn có trạng thái hợp lý.
9. Kiểm tra giao diện ở khoảng 360px, 768px, 1280px và 1920px: không tràn ngang, đọc được, keyboard focus, tương phản và reduced motion.
10. Build/typecheck thành công; test có ý nghĩa cho adapter, ownership/admin guard và tiến độ. Hallmark review trên UI thật; chỉ báo kiểm tra nào đã thực sự chạy. Smoke tests live phụ thuộc cấu hình phải được báo riêng nếu chưa thực hiện được.

## 10. Những quyết định để builder tự xử lý

- Phiên bản package tương thích tại thời điểm triển khai, cấu trúc folder, thư viện HLS/validation, test runner và component primitives.
- Index/cache cụ thể, ảnh tối ưu theo host thực tế, thông báo lỗi chi tiết và giới hạn tải hợp lý.
- Chi tiết spacing/radius/type theo palette đã chọn, miễn tuân thủ Hallmark và bố cục tham chiếu.
- Provider và biến môi trường hosting khi xác minh runtime; không tự đổi Next.js + Supabase hay thêm tính năng ngoài phạm vi.

Các lựa chọn cần người dùng xem khi duyệt: email cần xác nhận; danh sách riêng tư; không có bình luận/thanh toán; fallback iframe chỉ nhớ tập; không có CMS phim; user bị khóa vẫn xem như khách; chưa có quản lý quyền admin qua UI.

## 11. Tài liệu tham chiếu và kiểm chứng

- [KKPhim API](https://kkphim.com/api-document): endpoints, cấu trúc movie/episodes, `link_embed`, `link_m3u8`. Đã đọc tài liệu, chưa test playback trực tiếp.
- [Hallmark](https://www.usehallmark.com/), [Darkroom theme](https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/references/themes/darkroom.md), [App screens](https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/references/flow.md): palette và nguyên tắc UI; mockup màu đã được người dùng chọn B, chưa chạy lint sản phẩm.
- [Supabase Auth](https://supabase.com/docs/guides/auth), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): nền tảng tài khoản và ownership.
- [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components): phân chia render và tương tác.
- Ảnh tài khoản do người dùng cung cấp chỉ là tham chiếu chức năng/bố cục; không sao chép email, tên hoặc avatar cá nhân vào seed/mockup công khai.
