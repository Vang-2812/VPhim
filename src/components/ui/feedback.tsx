import { CircleAlert, Film, RefreshCw } from "lucide-react";
export function Feedback({
  title,
  message,
  kind = "empty",
  children,
}: {
  title: string;
  message?: string;
  kind?: "empty" | "error";
  children?: React.ReactNode;
}) {
  const Icon = kind === "error" ? CircleAlert : Film;
  return (
    <div className="feedback" role={kind === "error" ? "alert" : undefined}>
      <Icon size={28} strokeWidth={1.4} />
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      <div className="feedback-actions">{children}</div>
    </div>
  );
}
export function RetryLink({ href = "" }: { href?: string }) {
  return (
    <a className="button secondary" href={href || "?"}>
      <RefreshCw size={16} />
      Thử lại
    </a>
  );
}
