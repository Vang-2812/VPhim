import { it, expect } from "vitest";
import { parseProfile, validateAvatar } from "@/features/profile/validation";
it("accepts trimmed profile values but rejects empty, oversized or invalid gender", () => {
  expect(
    parseProfile({ displayName: "  Người xem  ", gender: "unspecified" }),
  ).toEqual({ displayName: "Người xem", gender: "unspecified" });
  for (const input of [
    { displayName: " ", gender: "male" },
    { displayName: "x".repeat(81), gender: "male" },
    { displayName: "A", gender: "admin" },
  ])
    expect(() => parseProfile(input)).toThrow();
});
it("rejects oversized, SVG and spoofed image files", () => {
  expect(validateAvatar(new Uint8Array(2097153), "image/png").ok).toBe(false);
  expect(
    validateAvatar(new TextEncoder().encode("<svg/>"), "image/svg+xml").ok,
  ).toBe(false);
  expect(
    validateAvatar(new TextEncoder().encode("not a png"), "image/png").ok,
  ).toBe(false);
});
