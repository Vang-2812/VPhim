import { AuthPage } from "@/features/auth/auth-page";
export const metadata = { title: "Đăng ký" };
export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <AuthPage mode="register" searchParams={searchParams} />;
}
