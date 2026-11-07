import { AuthPage } from "@/features/auth/auth-page";
export const metadata = { title: "Khôi phục mật khẩu" };
export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <AuthPage mode="forgot" searchParams={searchParams} />;
}
