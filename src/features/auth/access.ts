import { AppError } from "@/lib/result";
export interface MemberContext {
  userId: string;
  role: "member" | "admin";
  membership: "normal" | "vip";
}
export function assertAccess(
  record: (MemberContext & { status: string }) | null,
  admin = false,
): MemberContext {
  if (!record)
    throw new AppError("UNAUTHENTICATED", "Vui lòng đăng nhập để tiếp tục.");
  if (record.status !== "active")
    throw new AppError(
      "BLOCKED",
      "Tài khoản đã bị khóa. Bạn vẫn có thể xem phim như khách.",
    );
  if (admin && record.role !== "admin")
    throw new AppError("FORBIDDEN", "Bạn không có quyền quản trị.");
  return {
    userId: record.userId,
    role: record.role,
    membership: record.membership,
  };
}
