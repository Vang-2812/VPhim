"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const links = [
  { label: "Khám phá", href: "/kham-pha", type: "" },
  { label: "Phim lẻ", href: "/kham-pha?type=phim-le", type: "phim-le" },
  { label: "Phim bộ", href: "/kham-pha?type=phim-bo", type: "phim-bo" },
  { label: "Hoạt hình", href: "/kham-pha?type=hoat-hinh", type: "hoat-hinh" },
] as const;

function NavLinks({
  mobile,
  activeType,
}: {
  mobile: boolean;
  activeType: string | null;
}) {
  return (
    <nav
      className={mobile ? "mobile-nav" : "desktop-nav"}
      aria-label={mobile ? "Điều hướng trên điện thoại" : "Điều hướng chính"}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={activeType === link.type ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedType = searchParams.get("type") || "";
  const activeType =
    pathname === "/kham-pha"
      ? links.some((link) => link.type === selectedType)
        ? selectedType
        : ""
      : null;

  return <NavLinks mobile={mobile} activeType={activeType} />;
}

export function SiteNavFallback({ mobile = false }: { mobile?: boolean }) {
  return <NavLinks mobile={mobile} activeType={null} />;
}
