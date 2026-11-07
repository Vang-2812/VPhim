import Link from "next/link";
import { getOptionalMember } from "@/features/auth/context.server";
import { isAuthConfigured } from "@/lib/config/public";
import { AccountNav } from "@/components/layout/account-nav";
import { Feedback } from "@/components/ui/feedback";
export const dynamic = "force-dynamic";
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await getOptionalMember();
  if (!member)
    return (
      <div className="container">
        <Feedback
          title={
            isAuthConfigured()
              ? "Không gian dành riêng cho bạn"
              : "Tài khoản chưa được mở"
          }
          message={
            isAuthConfigured()
              ? "Đăng nhập để lưu phim yêu thích, danh sách và tiến độ xem. Nếu tài khoản bị khóa, bạn vẫn có thể xem phim như khách."
              : "VPhim chưa kết nối Supabase. Bạn vẫn có thể tìm và xem phim."
          }
        >
          <Link className="button" href="/dang-nhap?next=/tai-khoan">
            Đến trang đăng nhập
          </Link>
          <Link className="button secondary" href="/kham-pha">
            Khám phá phim
          </Link>
        </Feedback>
      </div>
    );
  return (
    <div className="container account-shell">
      <AccountNav admin={member.role === "admin"} />
      <div className="account-content">{children}</div>
    </div>
  );
}
