export type ErrorCode =
  | "CONFIG_MISSING"
  | "UNAUTHENTICATED"
  | "BLOCKED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "UPSTREAM_UNAVAILABLE"
  | "SAVE_FAILED";
export type Result<T> =
  { ok: true; data: T } | { ok: false; code: ErrorCode; message: string };
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}
export const fail = (code: ErrorCode, message: string): Result<never> => ({
  ok: false,
  code,
  message,
});
export function errorResult(error: unknown): Result<never> {
  return error instanceof AppError
    ? fail(error.code, error.message)
    : fail("SAVE_FAILED", "Chưa thể hoàn tất. Vui lòng thử lại.");
}
