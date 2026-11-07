import { AuthPage } from "@/features/auth/auth-page";
export const metadata = { title: "Đặt lại mật khẩu" };
export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <AuthPage mode="reset" searchParams={searchParams} />;
}
