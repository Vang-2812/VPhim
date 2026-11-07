import { Clapperboard } from "lucide-react";
import { AuthForm } from "./auth-form";
import { isAuthConfigured } from "@/lib/config/public";
import { safeNext } from "./redirect";
export async function AuthPage({
  mode,
  searchParams,
}: {
  mode: "login" | "register" | "forgot" | "reset";
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <div className="auth-mark">
          <Clapperboard size={20} />
          VPhim
        </div>
        <h1>Câu chuyện của bạn, ở mọi nơi.</h1>
        <p>
          Lưu lại phim muốn xem. Tiếp tục đúng nơi đã dừng. Một tài khoản cho
          những tối dành riêng cho điện ảnh.
        </p>
      </aside>
      <AuthForm
        mode={mode}
        configured={isAuthConfigured()}
        next={safeNext(p.next)}
        initialError={p.error}
      />
    </div>
  );
}
