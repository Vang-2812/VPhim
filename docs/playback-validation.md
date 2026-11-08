# Kiểm tra player — 08/11/2026

## Triệu chứng và bằng chứng

Người dùng báo Chrome giật hình ngay sau khi phát, timeline vẫn chạy, tại
`/xem/truoc-ngay-em-den`. Nguồn kiểm tra có thời lượng khoảng 6.618 giây,
1.655 phân đoạn MPEG-TS, playlist khoảng 44 KB và một mức 1080p được khai báo
3,5 Mbps. Không có mức chất lượng thấp hơn trong master playlist này.

Code cũ ưu tiên `video.canPlayType()` trước `Hls.isSupported()`. Trên trình
duyệt kiểm tra, production thực sự dùng URL m3u8 trực tiếp; các mẫu buffer
có nhiều khoảng trống nhỏ. [Hướng dẫn chính thức HLS.js](https://github.com/video-dev/hls.js#using-hlsjs)
cảnh báo Chrome mới có thể báo hỗ trợ native HLS nhưng phát không ổn định với
một số asset, và khuyến nghị ưu tiên HLS.js/MSE.

Cùng nguồn trên demo chính thức HLS.js 1.7.4 (trùng phiên bản cài trong repo)
phát hơn 20 giây với buffer liên tục, 0 dropped/corrupted frames. Mẫu sau
khoảng 116 giây ghi nhận 9 dropped frames, 0 corrupted frames. Đây là so sánh
đường phát trong trình duyệt kiểm tra, không phải benchmark trên thiết bị
của người dùng hay bằng chứng toàn bộ phim luôn phát mượt.

## Thay đổi

- Ưu tiên HLS.js khi MSE được hỗ trợ, dùng native HLS nếu không có MSE.
- Buffer mục tiêu: giữ khoảng 30 giây phía sau, tải trước tối đa mục tiêu
  60 giây; cho phép dọn các vùng buffer xa phía trước sau khi tua ngược.
  HLS.js làm việc theo ranh giới phân đoạn nên đây không phải giới hạn cứng
  về thời gian hay tổng RAM. Worker vẫn bật theo mặc định của thư viện.
- Giữ các nút điều khiển video, retry, fallback nhúng, lưu tiến độ và vòng
  đời hủy HLS khi đổi nguồn/rời player. Bắt lỗi tải module player.
- Điều khoản ghi rõ dự án cá nhân để học tập/thử nghiệm, phi thương mại,
  không thu phí, bán gói thành viên hay triển khai quảng cáo tạo doanh thu;
  không trình bày mục đích này như giấy phép sử dụng tác phẩm.

## Kiểm tra

- RED trước sửa: test lựa chọn HLS.js thất bại vì code chọn native; test
  buffer thất bại vì `backBufferLength` mặc định là `Infinity`.
- Sau sửa: 64 tests / 24 files đạt, typecheck và production build đạt.
- Review độc lập không tìm thấy lỗi Critical/Important/Minor cần sửa.
- Native fallback, lựa chọn MSE khi browser cũng báo native HLS, giới hạn
  buffer và lifecycle được kiểm tra bằng HLS constructor thật; jsdom thay
  thế phần media/network IO, không đo chất lượng giải mã video.
- Production build chạy local trên cùng phim: video dùng `blob:` MediaSource,
  phát qua phần đầu, tua tới khoảng giây 4.903 rồi tiếp tục phát qua giây
  4.936; khi tua về đầu, vùng buffer cũ được dọn và phần đầu tải lại. Lần
  thử này dùng trình duyệt kiểm tra tích hợp, không thay thế Chrome của người
  dùng.

Chưa có phép đo trên Chrome/thiết bị của người dùng hoặc phiên xem liên tục
hết phim. Cấu hình này không sửa được nguồn mã hóa lỗi hay vấn đề GPU/driver
cục bộ. Không thay Supabase, di chuyển dữ liệu hoặc cấu hình production.
