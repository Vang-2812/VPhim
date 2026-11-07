import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng & Bản quyền",
  description:
    "Cách VPhim vận hành, quy định tài khoản, bảo vệ dữ liệu và tiếp nhận phản ánh bản quyền.",
};
const sections = [
  ["van-hanh", "Cách VPhim vận hành"],
  ["ban-quyen", "Quyền tác giả & yêu cầu gỡ bỏ"],
  ["su-dung", "Quy định sử dụng"],
  ["tai-khoan", "Tài khoản & thành viên"],
  ["du-lieu", "Dữ liệu cá nhân & cookie"],
  ["trach-nhiem", "Khả dụng & trách nhiệm"],
  ["cap-nhat", "Cập nhật & liên hệ"],
];
const email = "contact.vphim@gmail.com";

export default function TermsPage() {
  return (
    <div className="container page-space legal-page">
      <Link href="/" className="text-link">
        Về trang chủ
      </Link>
      <header className="legal-heading">
        <p className="legal-kicker">THÔNG TIN & QUY ĐỊNH</p>
        <h1>
          Điều khoản sử dụng
          <br />& Bản quyền
        </h1>
        <p>
          Tìm hiểu cách VPhim hoạt động và cách liên hệ khi bạn cần hỗ trợ, phản
          ánh nội dung hoặc bảo vệ quyền của mình.
        </p>
        <p className="muted">
          Cập nhật ngày 07/11/2026 · Áp dụng cho website VPhim
        </p>
      </header>
      <div className="legal-layout">
        <nav className="legal-nav" aria-label="Mục lục điều khoản">
          <p>TRONG TRANG NÀY</p>
          {sections.map(([id, label], index) => (
            <a href={"#" + id} key={id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </a>
          ))}
        </nav>
        <article className="legal-content">
          <section id="van-hanh">
            <h2>01. Cách VPhim vận hành</h2>
            <p>
              VPhim cung cấp giao diện khám phá phim và các tiện ích tài khoản.
              Danh mục, hình ảnh, thông tin tập và địa chỉ nguồn phát được lấy
              từ API KKPhim. Trình duyệt có thể phát video trực tiếp từ nguồn
              bên thứ ba hoặc qua trình phát nhúng của họ.
            </p>
            <p>
              Máy chủ ứng dụng VPhim không tải lên, lưu trữ hay chuyển tiếp tệp
              video. VPhim vẫn lưu dữ liệu tài khoản và thông tin cần thiết cho
              thư viện, lịch sử xem như mô tả bên dưới. Việc một nội dung xuất
              hiện trong API công khai không đồng nghĩa nội dung đó được phép
              khai thác hoặc phân phối.
            </p>
          </section>
          <section id="ban-quyen">
            <h2>02. Quyền tác giả & yêu cầu gỡ bỏ</h2>
            <p>
              Quyền đối với phim, hình ảnh, âm thanh, tên gọi và các nội dung
              liên quan thuộc chủ thể quyền tương ứng. VPhim không tuyên bố sở
              hữu hay cấp giấy phép sử dụng các tác phẩm này. Vui lòng ưu tiên
              các kênh phát hành được chủ thể quyền cho phép.
            </p>
            <p>
              Chủ thể quyền, người đại diện được ủy quyền hoặc cơ quan có thẩm
              quyền có thể gửi yêu cầu đến{" "}
              <a
                href={
                  "mailto:" +
                  email +
                  "?subject=Phan%20anh%20ban%20quyen%20VPhim"
                }
              >
                {email}
              </a>
              . Để hỗ trợ xác minh, vui lòng cung cấp:
            </p>
            <ul>
              <li>
                Tên và thông tin liên hệ của người gửi; tư cách chủ thể quyền
                hoặc đại diện.
              </li>
              <li>
                Tác phẩm hoặc quyền bị ảnh hưởng và đường dẫn cụ thể trên VPhim.
              </li>
              <li>
                Mô tả vấn đề, căn cứ hoặc tài liệu chứng minh quyền/ủy quyền phù
                hợp và yêu cầu xử lý.
              </li>
              <li>
                Xác nhận thông tin phản ánh là chính xác theo hiểu biết của
                người gửi.
              </li>
            </ul>
            <p>
              Ban quản trị sẽ xem xét, có thể đề nghị bổ sung thông tin, và xử
              lý yêu cầu hợp lệ theo pháp luật, bao gồm hạn chế truy cập hoặc gỡ
              đường dẫn thuộc phạm vi kiểm soát của VPhim. Yêu cầu của cơ quan
              có thẩm quyền được thực hiện theo quy định. VPhim không kiểm soát
              việc xóa tệp trên máy chủ của bên thứ ba.
            </p>
            <p>
              Không gửi mật khẩu, mã đăng nhập hay giấy tờ định danh không cần
              thiết. Nếu một đường dẫn đã bị gỡ xuất hiện trở lại, vui lòng phản
              ánh kèm đường dẫn mới.
            </p>
          </section>
          <section id="su-dung">
            <h2>03. Quy định sử dụng</h2>
            <p>
              Chỉ sử dụng dịch vụ trong phạm vi pháp luật và quyền được cho
              phép. Không sử dụng VPhim để sao chép, phát lại, kinh doanh hoặc
              phân phối tác phẩm khi chưa có quyền; không vượt biện pháp bảo vệ
              nội dung, xâm nhập hệ thống, giả mạo, phát tán mã độc hoặc thu
              thập dữ liệu tài khoản của người khác.
            </p>
            <p>
              Lựa chọn nội dung phù hợp với độ tuổi và các cảnh báo do nguồn
              phát cung cấp. Cha mẹ, người giám hộ cần hướng dẫn và giám sát trẻ
              em khi truy cập. Không sử dụng website để tiếp cận nội dung bị cấm
              theo pháp luật áp dụng.
            </p>
          </section>
          <section id="tai-khoan">
            <h2>04. Tài khoản & thành viên</h2>
            <p>
              Bạn có thể duyệt phim mà không cần tài khoản. Đăng nhập bằng
              email/mật khẩu hoặc Google giúp lưu hồ sơ, yêu thích, danh sách và
              tiến độ xem giữa các thiết bị. Hãy sử dụng thông tin của mình, bảo
              vệ thông tin đăng nhập và báo cho ban quản trị khi nghi ngờ tài
              khoản bị truy cập trái phép.
            </p>
            <p>
              Hiện VPhim không có gói thanh toán; nhãn thường và VIP có cùng
              chức năng. VPhim có thể hạn chế tài khoản vi phạm quy định, gây
              hại hệ thống hoặc theo yêu cầu hợp lệ của cơ quan có thẩm quyền.
              Bạn có thể liên hệ để yêu cầu kiểm tra lại việc hạn chế.
            </p>
          </section>
          <section id="du-lieu">
            <h2>05. Dữ liệu cá nhân & cookie</h2>
            <p>
              Dữ liệu được xử lý để vận hành tài khoản gồm email và thông tin
              xác thực qua Supabase Auth, danh tính Google nếu bạn chọn Google,
              tên hiển thị, giới tính nếu khai báo, avatar, yêu thích, danh
              sách, phiên xem và tiến độ. Hoạt động quản trị có thể được ghi vào
              nhật ký phục vụ kiểm tra và bảo vệ hệ thống. VPhim không nhận mật
              khẩu Google của bạn.
            </p>
            <p>
              Cookie phiên đăng nhập giúp duy trì và làm mới phiên. Vercel cung
              cấp hạ tầng website; Supabase cung cấp Auth, database và storage.
              Dữ liệu có thể được xử lý trên hạ tầng ngoài Việt Nam. Khi tải
              hình ảnh, video hoặc trình phát nhúng, trình duyệt kết nối với
              nguồn thứ ba; các nguồn này có thể nhận địa chỉ IP, thông tin
              thiết bị và áp dụng cookie/chính sách riêng. VPhim không kiểm soát
              toàn bộ việc xử lý dữ liệu của các nguồn đó.
            </p>
            <p>
              Dữ liệu được giữ theo nhu cầu vận hành, bảo mật và các nghĩa vụ
              pháp luật có liên quan. Để yêu cầu tiếp cận, chỉnh sửa, xóa dữ
              liệu hoặc phản ánh việc xử lý dữ liệu của mình, gửi email đến{" "}
              <a href={"mailto:" + email}>{email}</a>. Ban quản trị có thể cần
              xác minh chủ tài khoản; phạm vi xử lý phụ thuộc yêu cầu hợp lệ và
              nghĩa vụ lưu giữ áp dụng. Website hiện chưa có nút tự xóa tài
              khoản.
            </p>
          </section>
          <section id="trach-nhiem">
            <h2>06. Khả dụng & trách nhiệm</h2>
            <p>
              Danh mục, chất lượng, phụ đề và khả năng phát phụ thuộc nguồn cung
              cấp; nội dung có thể thay đổi hoặc ngừng khả dụng. Tiến độ theo
              giây chỉ được đồng bộ khi trình phát cho phép; nguồn nhúng có thể
              chỉ ghi nhớ tập. VPhim không bảo đảm dịch vụ hoạt động liên tục
              hoặc mọi thông tin từ nguồn thứ ba luôn chính xác.
            </p>
            <p>
              Các giới hạn trách nhiệm chỉ áp dụng trong phạm vi pháp luật cho
              phép, không loại trừ nghĩa vụ bắt buộc của đơn vị vận hành hoặc
              quyền hợp pháp của người dùng. Việc sử dụng nguồn thứ ba hay không
              lưu tệp video không tự miễn trừ nghĩa vụ về quyền tác giả và các
              nghĩa vụ pháp lý khác.
            </p>
          </section>
          <section id="cap-nhat">
            <h2>07. Cập nhật & liên hệ</h2>
            <p>
              Ban quản trị có thể cập nhật điều khoản khi cách vận hành hoặc yêu
              cầu pháp luật thay đổi; ngày cập nhật được hiển thị ở đầu trang.
              Những thay đổi cần sự đồng ý riêng theo pháp luật sẽ được xử lý
              theo yêu cầu tương ứng, không mặc định từ việc bạn tiếp tục truy
              cập.
            </p>
            <p>
              Phản ánh bản quyền, hỗ trợ tài khoản và yêu cầu về dữ liệu:{" "}
              <a href={"mailto:" + email}>{email}</a>. Các bên ưu tiên trao đổi
              để giải quyết phản ánh; quyền yêu cầu cơ quan có thẩm quyền bảo vệ
              quyền lợi theo pháp luật được giữ nguyên.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
