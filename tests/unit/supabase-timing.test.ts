import { expect, it, vi } from "vitest";
import { createTimedFetch } from "@/lib/supabase/timed-fetch";
it("logs only sanitized metrics even when request or failure contains secrets", async () => {
  vi.stubEnv("SUPABASE_TIMING", "1");
  const log = vi.spyOn(console, "info").mockImplementation(() => {});
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response("{}", { status: 200 }));
  const request = createTimedFetch("server", transport);
  await request(
    "https://project.supabase.co/rest/v1/profiles?email=private@example.test",
    { headers: { Authorization: "Bearer SECRET" } },
  );
  const output = JSON.stringify(log.mock.calls);
  expect(output).toContain('"endpoint":"rest"');
  expect(output).toContain('"status":200');
  expect(output).not.toMatch(/private|SECRET|profiles|supabase\.co|email/);
  transport.mockRejectedValue(new Error("Bearer SECRET"));
  await expect(
    request("https://project.supabase.co/auth/v1/user"),
  ).rejects.toThrow("SECRET");
  expect(JSON.stringify(log.mock.calls)).not.toContain("SECRET");
  log.mockRestore();
  vi.unstubAllEnvs();
});
it("does not log by default", async () => {
  vi.stubEnv("SUPABASE_TIMING", "0");
  const log = vi.spyOn(console, "info").mockImplementation(() => {});
  await createTimedFetch(
    "server",
    async () => new Response("{}"),
  )("https://project.supabase.co/auth/v1/user");
  expect(log).not.toHaveBeenCalled();
  log.mockRestore();
  vi.unstubAllEnvs();
});
