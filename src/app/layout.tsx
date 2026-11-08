import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { RouteTracker } from "@/features/analytics/route-tracker";
import { VPhimLogo } from "@/components/ui/logo";
import { getSiteOrigin } from "@/lib/seo/config";
import { WebSiteJsonLd } from "@/lib/seo/schema-org";
import Link from "next/link";
import "./globals.css";

const siteOrigin = getSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "VPhim — Câu chuyện tiếp theo của bạn",
    template: "%s | VPhim",
  },
  description:
    "Khám phá phim mới, lưu phim yêu thích và tiếp tục câu chuyện của bạn cùng VPhim. Xem phim online chuẩn Full HD Vietsub và Thuyết minh.",
  keywords: [
    "xem phim",
    "phim online",
    "phim vietsub",
    "phim thuyet minh",
    "phim hd",
    "vphim",
    "phim moi",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "VPhim",
    title: "VPhim — Xem Phim Online Chất Lượng Cao",
    description:
      "Khám phá phim mới, lưu phim yêu thích và xem phim mượt mà cùng VPhim.",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "VPhim",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VPhim — Xem Phim Online Chất Lượng Cao",
    description:
      "Khám phá phim mới, lưu phim yêu thích và xem phim mượt mà cùng VPhim.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <WebSiteJsonLd origin={siteOrigin} />
      </head>
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
          <RouteTracker />
        </Suspense>
        <a className="skip-link" href="#main">
          Đến nội dung chính
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <Link href="/" className="footer-brand" aria-label="VPhim">
            <VPhimLogo size={22} />
          </Link>
          <p>Câu chuyện tiếp theo, do bạn chọn.</p>
          <nav aria-label="Liên kết cuối trang">
            <Link href="/kham-pha">Khám phá phim</Link>
            <Link href="/tai-khoan">Tài khoản</Link>
            <Link href="/dieu-khoan">Điều khoản & Bản quyền</Link>
            <a href="https://kkphim.com" target="_blank" rel="noreferrer">
              Nguồn phim: KKPhim
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
