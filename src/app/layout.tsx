import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "VPhim — Câu chuyện tiếp theo của bạn",
    template: "%s | VPhim",
  },
  description:
    "Khám phá phim mới, lưu phim yêu thích và tiếp tục câu chuyện của bạn cùng VPhim.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <a className="skip-link" href="#main">
          Đến nội dung chính
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <Link href="/" className="footer-brand">
            VPhim
          </Link>
          <p>Câu chuyện tiếp theo, do bạn chọn.</p>
          <nav aria-label="Liên kết cuối trang">
            <Link href="/kham-pha">Khám phá phim</Link>
            <Link href="/tai-khoan">Tài khoản</Link>
            <a href="https://kkphim.com" target="_blank" rel="noreferrer">
              Nguồn phim: KKPhim
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
