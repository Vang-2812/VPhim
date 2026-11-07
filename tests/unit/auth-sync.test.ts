import { it, expect } from "vitest";
import { processAuthJob } from "@/features/admin/auth-sync";
it("does not report success if a newer account state replaced the sync job", async () => {
  let revision = 1;
  const applied: string[] = [];
  const complete = await processAuthJob({
    get: async () => ({ status: "blocked", revision }),
    apply: async (status) => {
      applied.push(status);
      revision = 2;
    },
    complete: async (original) => original === revision,
  });
  expect(applied).toEqual(["blocked"]);
  expect(complete).toBe(false);
});
