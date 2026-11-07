import { it, expect } from "vitest";
import { requestJson } from "@/features/movies/client.server";
it("returns a recoverable error after at most one retry on a failed provider", async () => {
  let attempts = 0;
  const r = await requestJson("/test", async () => {
    attempts++;
    throw new Error("network");
  });
  expect(r).toMatchObject({ ok: false, code: "UPSTREAM_UNAVAILABLE" });
  expect(attempts).toBe(2);
});
it("does not retry an absent movie", async () => {
  let attempts = 0;
  const r = await requestJson("/test", async () => {
    attempts++;
    return new Response("{}", { status: 404 });
  });
  expect(r).toMatchObject({ ok: false, code: "NOT_FOUND" });
  expect(attempts).toBe(1);
});
