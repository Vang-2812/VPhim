import { beforeEach, expect, it, vi } from "vitest";
const sdk = vi.hoisted(() => ({
  getClaims: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  access: { role: "member", membership: "normal", status: "active" },
}));
vi.mock("@/lib/config/public", () => ({ isAuthConfigured: () => true }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({ auth: sdk, from: sdk.from }),
}));
import { requireMember, requireAdmin } from "@/features/auth/context.server";
beforeEach(() => {
  vi.clearAllMocks();
  sdk.access = { role: "member", membership: "normal", status: "active" };
  sdk.getUser.mockRejectedValue(
    new Error("Unnecessary Auth network round trip"),
  );
  sdk.getClaims.mockResolvedValue({
    data: {
      claims: {
        sub: "user-a",
        role: "authenticated",
        user_metadata: { role: "admin" },
      },
    },
    error: null,
  });
  sdk.from.mockImplementation(() => ({
    select: () => ({
      eq: (_key: string, id: string) => ({
        single: async () => ({
          data: id === "user-a" ? sdk.access : null,
          error: null,
        }),
      }),
    }),
  }));
});
it("authorizes a verified subject with current DB access without an Auth user lookup", async () => {
  expect(await requireMember()).toEqual({
    userId: "user-a",
    role: "member",
    membership: "normal",
  });
  expect(sdk.getUser).not.toHaveBeenCalled();
});
it("rejects unverifiable claims before reading private permissions", async () => {
  sdk.getClaims.mockResolvedValue({
    data: null,
    error: { message: "Invalid signature" },
  });
  await expect(requireMember()).rejects.toMatchObject({
    code: "UNAUTHENTICATED",
  });
  expect(sdk.from).not.toHaveBeenCalled();
});
it("still blocks an account with a valid JWT after its DB status changes", async () => {
  sdk.access.status = "blocked";
  await expect(requireMember()).rejects.toMatchObject({ code: "BLOCKED" });
});
it("ignores admin metadata and enforces the current database role", async () => {
  await expect(requireAdmin()).rejects.toMatchObject({ code: "FORBIDDEN" });
});
