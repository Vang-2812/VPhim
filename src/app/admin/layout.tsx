import Link from "next/link";
import { requireAdmin } from "@/features/auth/context.server";
import { AccountNav } from "@/components/layout/account-nav";
import { Feedback } from "@/components/ui/feedback";
import { errorResult } from "@/lib/result";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let message = "";
  try {
    await requireAdmin();
  } catch (e) {
    const r = errorResult(e);
    if (!r.ok) message = r.message;
  }
  if (message)
    return (
      <div className="container">
        <Feedback title="Khu vực quản trị" message={message} kind="error">
          <Link className="button" href="/dang-nhap?next=/admin/nguoi-dung">
            Đăng nhập
          </Link>
          <Link className="button secondary" href="/">
            Về trang chủ
          </Link>
        </Feedback>
      </div>
    );
  return (
    <div className="container account-shell">
      <AccountNav admin />
      <div className="account-content">{children}</div>
    </div>
  );
}
