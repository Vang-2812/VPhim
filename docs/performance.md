# Hiệu năng Supabase — 07/11/2026

## Bằng chứng trước thay đổi

Source đã đọc lại từ commit `6b739d1`, gồm các thay đổi auto-resume, cache danh sách, logo, loading và fallback nhúng. Không thay thế các tính năng này.

Deployment `vphim-one.vercel.app` được Vercel API xác nhận chạy `iad1`. Project Supabase cũ ở Sydney `ap-southeast-2`. Các request mạng từ server Mỹ đến Úc cộng với nhiều bước nối tiếp làm tăng thời gian người dùng chờ; chưa có phép đo authenticated end-to-end để quy toàn bộ 1–2 giây cho riêng một nguyên nhân.

Log Supabase trong cửa sổ kiểm tra 24 giờ: 1.851 request `/auth/v1/user`, 231 request `user_access`, 372 REST khác. Chỉ lấy thống kê tổng hợp, không đọc email, token hoặc nội dung user. Log count là bằng chứng tải Auth cao, không phải số request của riêng một page view.

Từ máy kiểm tra: Auth health cold 1564ms, warm 497/237ms; JWKS 258/50/66ms. Public Vercel không đăng nhập: headers 350–546ms, toàn body 352–874ms trong các mẫu này. Các số đó không đại diện lượt xem của user đăng nhập và không có bảo đảm SLA.

Advisors: health không có cảnh báo; 9 khóa ngoại thiếu index ở mức INFO. Với database hiện còn nhỏ, không có bằng chứng đây là nguyên nhân của độ trễ mạng; chưa thêm index hoặc thay schema tùy tiện. [Giải thích cảnh báo index](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys).

Security advisor cũng báo các bảng chỉ dùng server/RPC không có RLS policy trực tiếp và các RPC `SECURITY DEFINER` được authenticated gọi: đây là thiết kế có guard riêng, đã có SQL tests cho truy cập bị từ chối, không sửa thành public để xóa cảnh báo. [RLS no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). Project cũ đang tắt leaked-password protection; có thể bật theo [password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), không tự đổi chính sách Auth trong lượt tối ưu này.

## Thay đổi và ngân sách request

- Proxy và member context dùng SDK `getClaims()`; project cũ có JWKS ES256. Khi cache khóa đã ấm, không cần gọi `/auth/v1/user` cho mỗi lần xác minh. Token cũ dùng khóa đối xứng vẫn có thể khiến SDK gọi Auth; không bỏ kiểm tra chữ ký. [Supabase getClaims](https://supabase.com/docs/reference/javascript/auth-getclaims).
- React `cache()` chia sẻ context/client trong một render. Đây là cache theo request, không lưu user/role giữa người dùng. Actions/Route Handlers không dựa vào React cache để giảm request; các guard và RLS vẫn kiểm tra quyền hiện tại. [React cache](https://react.dev/reference/react/cache).
- Resume: 2 query dữ liệu → 1 join có scope owner và slug. Library controls: 3 query nối tiếp + guard lặp → 2 query song song, chỉ lấy playlist id/name.
- Xem tiếp tối đa 12 phim: 1+12 query → 2 query, batch giới hạn cả movie và tập (tối đa 144 cặp), ghép đúng cặp ID/tập. Quoted filenames được escape; lỗi query không biến thành tiến độ rỗng.
- Header/nav và nội dung phim công khai stream độc lập với phần account. Player vẫn đợi chọn tập resume trước khi mount. Không có cache CDN cho dữ liệu cá nhân.
- Guest có kết quả SSR rõ ràng không gọi lại server action thư viện khi mount.

Tests dùng Supabase JS thật với transport kiểm soát để kiểm tra URL/filter, số request và kết quả. Auth/proxy tests kiểm tra boundary SDK, live DB status và cookie refresh; không giả rằng unit tests đo được RTT hosted. Request dedup trong render dựa vào React/Next runtime, không coi gọi hàm `cache()` trực tiếp trong Vitest là bằng chứng dedup.

## Đo lại sau khi deploy

1. Bật `SUPABASE_TIMING=1` trên môi trường cần kiểm tra và deploy lại. Logger chỉ ghi scope, nhóm endpoint, method, status và duration; không ghi URL/query, headers, body, key hoặc thông báo lỗi có dữ liệu.
2. Đăng nhập bằng tài khoản của bạn, thử home, chi tiết, Xem tiếp và đổi tập. So sánh số request/độ trễ trong Runtime Logs với cùng luồng trước đó. Phân biệt cold start/JWKS cache lần đầu với các lượt ấm.
3. Xác nhận deployment chạy `sin1` và Supabase đích `ap-southeast-1`. Cùng region giảm đường mạng giữa Function và DB; static assets vẫn được CDN phân phối. [Vercel region](https://vercel.com/docs/functions/configuring-functions/region).
4. Tắt `SUPABASE_TIMING` sau khi đo nếu không cần logs. Kiểm tra lại quyền user A/B, blocked token và admin trước cutover.

Không dùng `getSession().user`, cache TTL cho role hay tắt RLS để đạt thời gian đẹp. Không nhận là đã sửa xong độ trễ production khi chưa triển khai và đo lại bằng phiên đăng nhập thực.
