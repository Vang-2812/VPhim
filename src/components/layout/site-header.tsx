import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { getOptionalMember } from "@/features/auth/context.server";
import { VPhimLogo } from "@/components/ui/logo";
import { Suspense } from "react";
async function HeaderAccount() {
  const member = await getOptionalMember();
  return (
    <Link
      href={member ? "/tai-khoan" : "/dang-nhap"}
      className="header-account"
    >
      <UserRound size={17} />
      <span>{member ? "Tài khoản" : "Đăng nhập"}</span>
    </Link>
  );
}
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="VPhim trang chủ">
          <VPhimLogo size={28} />
        </Link>
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          <Link href="/kham-pha">Khám phá</Link>
          <Link href="/kham-pha?type=phim-le">Phim lẻ</Link>
          <Link href="/kham-pha?type=phim-bo">Phim bộ</Link>
          <Link href="/kham-pha?type=hoat-hinh">Hoạt hình</Link>
        </nav>
        <div className="header-actions">
          <Link
            href="/kham-pha"
            className="icon-button"
            aria-label="Tìm kiếm phim"
          >
            <Search size={20} />
          </Link>
          <Suspense
            fallback={
              <span className="header-account" aria-busy="true">
                <UserRound size={17} />
                <span>Đang tải…</span>
              </span>
            }
          >
            <HeaderAccount />
          </Suspense>
        </div>
      </div>
      <nav className="mobile-nav" aria-label="Điều hướng trên điện thoại">
        <Link href="/kham-pha">Khám phá</Link>
        <Link href="/kham-pha?type=phim-le">Phim lẻ</Link>
        <Link href="/kham-pha?type=phim-bo">Phim bộ</Link>
        <Link href="/kham-pha?type=hoat-hinh">Hoạt hình</Link>
      </nav>
    </header>
  );
}
