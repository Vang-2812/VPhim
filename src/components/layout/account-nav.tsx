"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  ListPlus,
  History,
  UserRound,
  LogOut,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { signOut } from "@/features/auth/actions";
export function AccountNav({ admin = false }: { admin?: boolean }) {
  const path = usePathname(),
    links = [
      ["/tai-khoan/yeu-thich", "Yêu thích", Heart],
      ["/tai-khoan/danh-sach", "Danh sách", ListPlus],
      ["/tai-khoan/xem-tiep", "Xem tiếp", History],
      ["/tai-khoan", "Tài khoản", UserRound],
      ...(admin
        ? [
            ["/admin", "Tổng quan", LayoutDashboard],
            ["/admin/nguoi-dung", "Người dùng", Users],
          ]
        : []),
    ] as const;
  return (
    <aside className="account-nav">
      <h2>Không gian của bạn</h2>
      <nav aria-label="Quản lý tài khoản">
        {links.map(([href, title, Icon]) => (
          <Link
            href={href as string}
            className={path === href ? "active" : ""}
            aria-current={path === href ? "page" : undefined}
            key={href as string}
          >
            <Icon size={18} />
            {title as string}
          </Link>
        ))}
      </nav>
      <form action={signOut}>
        <button type="submit">
          <LogOut size={18} />
          Đăng xuất
        </button>
      </form>
    </aside>
  );
}
