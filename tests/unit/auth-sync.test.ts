import { it, expect } from "vitest";
import { processAuthJob, type AuthSyncIo } from "@/features/admin/auth-sync";
it("serializes provider writes and reconciles a newer desired state before releasing its lease", async () => {
  let job = {
      status: "blocked" as "active" | "blocked",
      revision: 1,
      applied: 0,
    },
    lease: string | null = null,
    provider: string = "active";
  let release: () => void = () => {},
    entered: () => void = () => {};
  const gate = new Promise<void>((r) => (release = r)),
    started = new Promise<void>((r) => (entered = r));
  const writes: string[] = [];
  function io(token: string): AuthSyncIo {
    return {
      claim: async () => {
        if (job.applied >= job.revision) return { state: "idle" };
        if (lease && lease !== token) return { state: "busy" };
        lease = token;
        return {
          state: "claimed",
          job: { status: job.status, revision: job.revision },
        };
      },
      apply: async (status) => {
        if (status === "blocked") {
          entered();
          await gate;
        }
        provider = status;
        writes.push(status);
      },
      finish: async (revision) => {
        if (lease !== token) return { state: "lost" };
        if (revision !== job.revision)
          return {
            state: "changed",
            job: { status: job.status, revision: job.revision },
          };
        job.applied = revision;
        return { state: "done" };
      },
      release: async () => {
        if (lease === token) lease = null;
      },
    };
  }
  const old = processAuthJob(io("old"));
  await started;
  job = { ...job, status: "active", revision: 2 };
  expect(await processAuthJob(io("new"))).toBe(false);
  release();
  expect(await old).toBe(true);
  expect(provider).toBe("active");
  expect(writes).toEqual(["blocked", "active"]);
  expect(job.applied).toBe(2);
  expect(lease).toBeNull();
});
it("keeps the durable lease on an uncertain provider failure for later retry", async () => {
  let released = false;
  await expect(
    processAuthJob({
      claim: async () => ({
        state: "claimed",
        job: { status: "blocked", revision: 1 },
      }),
      apply: async () => {
        throw new Error("timeout");
      },
      finish: async () => ({ state: "done" }),
      release: async () => {
        released = true;
      },
    }),
  ).rejects.toThrow("timeout");
  expect(released).toBe(false);
});
