# VPhim: nâng cấp giao diện toàn web theo cảm hứng iQIYI

## Ý định

Người dùng muốn VPhim có trải nghiệm khám phá phim giàu hình ảnh và gọn hơn, tham khảo bố cục iQIYI, nhưng vẫn nhận ra VPhim qua nền than, chữ sáng và điểm nhấn vàng cam hiện tại. Phạm vi là toàn bộ web. Thay đổi này chỉ tác động đến cách trình bày và điều hướng; xem phim, tài khoản và dữ liệu phim tiếp tục hoạt động như hiện nay.

Mockup bố cục trang chủ và thông tin phim được lưu trong `.superpowers/brainstorm/ui-redesign-20261108/content/layout.html` (bản phác thảo, không phải sản phẩm). Ảnh, tên phim trong mockup chỉ minh họa với dữ liệu hiện có; giao diện triển khai sẽ hiển thị dữ liệu thực từ KKPhim.

## Mục tiêu và giới hạn

- Áp dụng một hệ giao diện xuyên suốt: header, trang chủ, khám phá, chi tiết phim, trang xem, đăng nhập/đăng ký/khôi phục mật khẩu, trang tài khoản và thư viện, trang điều khoản, và khu vực quản trị.
- Trang chủ ưu tiên ảnh phim dạng backdrop tràn rộng, chữ đặt trên lớp phủ tương phản, nút xem rõ ràng; poster trình bày thành dải cuộn ngang để duyệt nhanh.
- Giữ màu từ `src/styles/tokens.css`, wordmark hiện tại và cấu trúc URL. Dùng màu vàng cam cho hành động chính, trạng thái chọn và điểm nhấn; không lấy màu xanh hay thương hiệu iQIYI.
- Dùng nguồn dữ liệu và các request hiện có. Không thêm lượt gọi KKPhim/Supabase để dựng thêm dải phim, không bật trailer tự phát, không thay playback/auth/business logic.
- Ngoại lệ do người dùng bổ sung khi duyệt: ô tìm kiếm hiện trực tiếp trên header; khi gõ, dropdown tải gợi ý phim theo từ khóa. Chỉ Enter trong ô hoặc nhấn biểu tượng tìm kiếm mới mở `/kham-pha?keyword=...`; chọn một gợi ý mở trang chi tiết phim đó.
- Normal và VIP vẫn có cùng quyền như yêu cầu trước đây; không thêm quảng cáo, upsell, gói trả phí hay nội dung thương mại.
- Không sao chép nguyên bản giao diện, icon, logo hay nội dung của iQIYI. Mục tiêu là cùng nguyên tắc bố cục, không phải bản sao.

## Các hướng đã cân nhắc

1. **Chọn: cải tiến toàn web trên kiến trúc hiện có.** Dùng backdrop hero, poster rail và header gọn trên trang khám phá phim; các trang chức năng dùng cùng tokens, khoảng cách, nút và bề mặt. Tận dụng dữ liệu/phân trang hiện tại, nên ít rủi ro tốc độ và hành vi.
2. **Không chọn: tái cấu trúc gần iQIYI.** Thêm nhiều rail theo chủ đề, tải catalog riêng từng rail, thay bộ lọc thành giao diện mới. Đổi nhiều hơn về nội dung lẫn luồng, tăng request KKPhim và khối lượng kiểm thử; không phù hợp mục tiêu giữ tốc độ của VPhim.

## Thiết kế cụ thể

### Khung chung

- Header desktop thấp và cô đọng hơn; logo, liên kết chính, ô tìm kiếm luôn thấy, tài khoản giữ nguyên điểm đến. Mục hiện tại có dấu nhấn dễ nhận biết. Trên màn hẹp, ô tìm kiếm có một hàng riêng, điều hướng vẫn thấy được và cuộn ngang nếu cần.
- Tìm kiếm header gửi yêu cầu gợi ý sau khi người dùng ngừng gõ khoảng 300 ms và từ khóa có ít nhất 2 ký tự; tối đa 5 kết quả trong dropdown. Dùng cùng hàm `listMovies`/cache hiện có qua một route handler chỉ phục vụ gợi ý; không gọi Supabase. Hủy/bỏ qua phản hồi cũ khi từ khóa đổi. Dropdown có trạng thái đang tìm, không có kết quả, lỗi tải; đóng bằng Escape, click ra ngoài hoặc chọn kết quả. Enter và click biểu tượng tìm kiếm chuyển sang Khám phá với từ khóa đã nhập, không tự chuyển trang khi chỉ gõ. Từ khóa rỗng chuyển đến `/kham-pha`.
- Sử dụng chữ đậm hơn cho tiêu đề phim và tiêu đề mục, chữ phụ ngắn và dễ đọc. Bề mặt có độ sâu nhẹ bằng các sắc than sẵn có; viền và bán kính nhất quán. Tránh hiệu ứng mờ nặng, chuyển động dài hoặc backdrop gây rối.
- Thành phần dùng chung (nút, chip, poster, trạng thái hover/focus, form control, thẻ thông báo, footer) theo một quy luật. Giữ focus rõ, tương phản đủ đọc trên ảnh và bàn phím đi được qua mọi mục.

### Trang chủ

- Hero chiếm ngang vùng nội dung lớn với ảnh `thumbUrl` (dự phòng `posterUrl`) phủ rộng, gradient than từ trái và dưới, tiêu đề/meta/mô tả/nút xem đặt trên ảnh. Nếu ảnh thiếu hoặc tải lỗi, nền than và nội dung vẫn đọc được.
- Chip thể loại ngay dưới hero, dẫn đến bộ lọc Khám phá như hiện nay.
- “Xem tiếp câu chuyện” khi đã đăng nhập và “Mới lên sóng” thành dải cuộn ngang trên màn hình đủ rộng; trên điện thoại hiển thị các thẻ ngang có một phần thẻ kế tiếp để gợi ý thao tác vuốt. Có liên kết “Tất cả” đến trang đầy đủ. Không tạo dải mới bằng API request bổ sung.
- Giữ lời mời khám phá cuối trang, nhưng đưa vào cùng nhịp thị giác mới.

### Khám phá và kết quả tìm kiếm

- Trang Khám phá giữ tìm kiếm, loại phim, thể loại, quốc gia, năm, sắp xếp và phân trang hiện có. Bộ lọc được gom thành vùng điều khiển gọn, dễ dùng cả desktop/mobile.
- Kết quả vẫn là lưới để duyệt nhiều phim và xem rõ phân trang, dùng cùng poster card của trang chủ. URL query và cách lọc không đổi.

### Chi tiết phim và trang xem

- Trang chi tiết mở bằng backdrop của phim, gradient chữ, thông tin chính và nút Xem/Yêu thích/Danh sách hiện có; nội dung tóm tắt, thông tin phim và danh sách tập ở phía dưới. Khi thiếu backdrop, dùng poster hoặc nền trung tính. Tên tập và server vẫn hiện đầy đủ.
- Trang xem giữ video là ưu tiên cao nhất, có tiêu đề, thông tin tập và danh sách tập rõ ràng trên bề mặt than. Không đụng vào HLS player, luồng chọn tập, lưu tiến độ hay nguồn video.

### Tài khoản, xác thực, quản trị và nội dung văn bản

- Trang đăng nhập/đăng ký/khôi phục mật khẩu giữ nguyên trường, thông báo và hành vi; cập nhật layout, màu, khoảng cách và kiểu chữ theo hệ mới. Trang tài khoản và các mục Yêu thích/Danh sách/Xem tiếp giữ sidebar/chức năng, làm rõ mục đang chọn, thẻ phim và trạng thái rỗng.
- Khu vực quản trị vẫn tập trung đọc dữ liệu và thao tác, không dùng hero ảnh phim. Điều khoản ưu tiên độ dài dòng, phân cấp tiêu đề và liên kết dễ đọc. Footer thống nhất với header và màu mới.

## Kích thước, trạng thái và hiệu năng

- Kiểm tra desktop rộng, tablet và mobile khoảng 390px. Ở màn hình hẹp, hero rút chiều cao và gradient phủ sâu hơn; chữ/nút không che mặt phim quá mức; rail cuộn chạm, không gây tràn ngang toàn trang.
- Tôn trọng `prefers-reduced-motion`. Hover không phải cách duy nhất để thấy thông tin hoặc sử dụng card. Ảnh trang dưới tải lười; hero ưu tiên tải như hiện tại.
- Giữ loading/empty/error hiện có, cập nhật cách trình bày cho khớp. Không tăng số request lúc render chính; chỉ gọi tìm kiếm gợi ý khi người dùng gõ. Không cần thư viện UI hay dependency mới.

## Phần để người triển khai quyết định

- Chi tiết CSS responsive, độ cao hero, mật độ thẻ và khoảng cách từng breakpoint dựa trên ảnh thực tế.
- Cách chia component để tái sử dụng poster rail và grid, miễn không làm thay đổi dữ liệu, route và chức năng.
- Kiểm tra build, typecheck, test liên quan và duyệt trực quan các trang đại diện, bao gồm trường hợp ảnh thiếu, dữ liệu dài và trạng thái chưa đăng nhập.
