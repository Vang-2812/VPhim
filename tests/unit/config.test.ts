import { describe, it, expect } from "vitest";
import { getPublicConfig } from "@/lib/config/public";
import { getServerConfig } from "@/lib/config/server";
describe("configuration boundary", () => {
  it("keeps public browsing available without auth configuration", () =>
    expect(getPublicConfig({}).supabaseUrl).toBeNull());
  it("never returns server credentials to public callers", () =>
    expect(
      JSON.stringify(
        getPublicConfig({ SUPABASE_SERVICE_ROLE_KEY: "sentinel" }),
      ),
    ).not.toContain("sentinel"));
  it("rejects unsafe app origins", () =>
    expect(() =>
      getServerConfig({ APP_ORIGIN: "javascript:alert(1)" }),
    ).toThrow());
});
