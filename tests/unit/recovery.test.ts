import { it, expect, vi } from "vitest";
const sdk = vi.hoisted(() => ({ error: null as null | { code: string } }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({
    auth: {
      resetPasswordForEmail: async () => ({ data: {}, error: sdk.error }),
    },
  }),
}));
import { requestPasswordReset } from "@/features/auth/actions";
it("reports delivery/rate limit failures without revealing account existence", async () => {
  sdk.error = { code: "over_email_send_rate_limit" };
  const f = new FormData();
  f.set("email", "a@example.com");
  expect((await requestPasswordReset(f)).ok).toBe(false);
});
it("does not reveal that an email has no account", async () => {
  sdk.error = { code: "user_not_found" };
  const f = new FormData();
  f.set("email", "unknown@example.com");
  expect((await requestPasswordReset(f)).ok).toBe(true);
});
