// @vitest-environment node
import { expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const sdk = vi.hoisted(() => ({ getUser: vi.fn(), getClaims: vi.fn() }));
vi.mock("@/lib/config/public", () => ({
  isAuthConfigured: () => true,
  publicConfig: {
    supabaseUrl: "https://project.supabase.co",
    supabasePublishableKey: "public-key",
  },
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { cookies: { setAll(values: unknown[]): void } },
  ) => {
    sdk.getUser.mockRejectedValue(new Error("Unnecessary online user lookup"));
    sdk.getClaims.mockImplementation(async () => {
      options.cookies.setAll([
        {
          name: "sb-session",
          value: "refreshed",
          options: { path: "/", httpOnly: true },
        },
      ]);
      return { data: { claims: { sub: "user-a" } }, error: null };
    });
    return { auth: sdk };
  },
}));
import { proxy } from "@/proxy";
it("refreshes claims and propagates cookies to both server render and browser", async () => {
  const request = new NextRequest("https://vphim.test/phim/a");
  const response = await proxy(request);
  expect(request.cookies.get("sb-session")?.value).toBe("refreshed");
  expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
  expect(response.headers.get("x-middleware-request-cookie")).toContain(
    "sb-session=refreshed",
  );
});
