import { it, expect } from "vitest";
import { safeNext } from "@/features/auth/redirect";
import { assertAccess } from "@/features/auth/access";
it("blocks external, encoded and backslash redirects", () => {
  for (const value of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/%5cevil.test",
    "/\n/evil.test",
  ])
    expect(safeNext(value)).toBe("/");
  expect(safeNext("/phim/a?episode=1")).toBe("/phim/a?episode=1");
});
it("blocks stale sessions for disabled accounts and protects admin access", () => {
  expect(() => assertAccess(null)).toThrow();
  expect(() =>
    assertAccess({
      userId: "a",
      status: "blocked",
      role: "admin",
      membership: "vip",
    }),
  ).toThrow(/khóa/);
  expect(() =>
    assertAccess(
      { userId: "a", status: "active", role: "member", membership: "vip" },
      true,
    ),
  ).toThrow(/quyền/);
  expect(
    assertAccess({
      userId: "a",
      status: "active",
      role: "member",
      membership: "vip",
    }).role,
  ).toBe("member");
});
