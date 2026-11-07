"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp, requestPasswordReset, resetPassword } from "./actions";
export function AuthForm({
  mode,
  configured,
  next = "/",
  initialError,
}: {
  mode: "login" | "register" | "forgot" | "reset";
  configured: boolean;
  next?: string;
  initialError?: string;
}) {
  const [pending, start] = useTransition(),
    [message, setMessage] = useState(
      initialError ? "Liên kết đăng nhập không hợp lệ hoặc đã hết hạn." : "",
    ),
    [success, setSuccess] = useState(false);
  const router = useRouter();
  const titles = {
    login: "Chào mừng trở lại",
    register: "Tạo tài khoản",
    forgot: "Quên mật khẩu?",
    reset: "Đặt mật khẩu mới",
  };
  return (
    <form
      className="form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setMessage("");
        start(async () => {
          const result = await (mode === "login"
            ? signIn(form)
            : mode === "register"
              ? signUp(form)
              : mode === "forgot"
                ? requestPasswordReset(form)
                : resetPassword(form));
          setSuccess(result.ok);
          if (!result.ok) {
            setMessage(result.message);
            return;
          }
          if (mode === "login") {
            router.push(next);
            router.refresh();
          } else
            setMessage(
              mode === "register"
                ? "Kiểm tra email để xác nhận tài khoản trước khi đăng nhập."
                : mode === "forgot"
                  ? "Nếu email có tài khoản, bạn sẽ nhận được hướng dẫn khôi phục."
                  : "Đã đổi mật khẩu. Bạn có thể đăng nhập lại.",
            );
        });
      }}
    >
      <h2>{titles[mode]}</h2>
      <p>
        {mode === "login"
          ? "Đăng nhập để lưu phim và tiếp tục xem trên mọi thiết bị."
          : mode === "register"
            ? "Giữ lại những câu chuyện bạn yêu thích."
            : mode === "forgot"
              ? "Nhập email đã dùng để đăng ký tài khoản."
              : "Dùng liên kết khôi phục trong email để đặt mật khẩu."}
      </p>
      {!configured && (
        <div className="form-note">
          Đăng nhập chưa được mở. VPhim cần kết nối Supabase; bạn vẫn có thể tìm
          và xem phim.
        </div>
      )}
      {mode === "register" && (
        <label>
          Tên hiển thị
          <input
            name="displayName"
            autoComplete="nickname"
            maxLength={80}
            required
            disabled={!configured}
          />
        </label>
      )}
      {mode !== "reset" && (
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            disabled={!configured}
          />
        </label>
      )}
      {mode !== "forgot" && (
        <label>
          Mật khẩu
          <input
            type="password"
            name="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            minLength={mode === "login" ? 1 : 8}
            maxLength={1024}
            required
            disabled={!configured}
          />
        </label>
      )}
      <input type="hidden" name="next" value={next} />
      {mode === "login" && (
        <div className="form-row">
          <span />
          <Link href="/quen-mat-khau">Quên mật khẩu?</Link>
        </div>
      )}
      <button
        className="button"
        type="submit"
        disabled={pending || !configured}
      >
        {pending
          ? "Đang xử lý…"
          : mode === "login"
            ? "Đăng nhập"
            : mode === "register"
              ? "Tạo tài khoản"
              : mode === "forgot"
                ? "Gửi hướng dẫn"
                : "Lưu mật khẩu mới"}
      </button>
      {message && (
        <p
          className={"form-note " + (success ? "success" : "error")}
          role={success ? "status" : "alert"}
        >
          {message}
        </p>
      )}
      {(mode === "login" || mode === "register") && (
        <>
          <div className="form-divider">hoặc</div>
          {configured ? (
            <a
              className="button secondary"
              href={"/auth/google?next=" + encodeURIComponent(next)}
            >
              <span className="google-icon" aria-hidden="true">
                G
              </span>
              Tiếp tục với Google
            </a>
          ) : (
            <button className="button secondary" type="button" disabled>
              <span className="google-icon" aria-hidden="true">
                G
              </span>
              Tiếp tục với Google
            </button>
          )}
        </>
      )}
      <div className="form-row">
        <span>
          {mode === "login"
            ? "Chưa có tài khoản?"
            : mode === "register"
              ? "Đã có tài khoản?"
              : "Quay lại"}
        </span>
        <Link href={mode === "login" ? "/dang-ky" : "/dang-nhap"}>
          {mode === "login" ? "Đăng ký" : "Đăng nhập"}
        </Link>
      </div>
    </form>
  );
}
