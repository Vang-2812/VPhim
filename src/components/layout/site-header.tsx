import Link from "next/link";
import { UserRound } from "lucide-react";
import { getOptionalMember } from "@/features/auth/context.server";
import { VPhimLogo } from "@/components/ui/logo";
import { HeaderSearch } from "./header-search";
import { SiteNav, SiteNavFallback } from "./site-nav";
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
        <Suspense fallback={<SiteNavFallback />}>
          <SiteNav />
        </Suspense>
        <div className="header-actions">
          <HeaderSearch />
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
      <Suspense fallback={<SiteNavFallback mobile />}>
        <SiteNav mobile />
      </Suspense>
    </header>
  );
}
