import type { SupabaseClient } from "@supabase/supabase-js";

type Job = { status: "active" | "blocked"; revision: number };
export interface AuthSyncIo {
  claim(): Promise<
    { state: "idle" } | { state: "busy" } | { state: "claimed"; job: Job }
  >;
  apply(status: Job["status"]): Promise<void>;
  finish(
    revision: number,
  ): Promise<
    { state: "done" } | { state: "lost" } | { state: "changed"; job: Job }
  >;
  release(): Promise<void>;
}

export async function processAuthJob(io: AuthSyncIo): Promise<boolean> {
  const claim = await io.claim();
  if (claim.state === "idle") return true;
  if (claim.state === "busy") return false;
  let job = claim.job;
  for (let attempt = 0; attempt < 5; attempt++) {
    // Retain the lease on uncertain provider failure: the request may still be
    // completing remotely. A later retry reconciles the durable desired state.
    await io.apply(job.status);
    const result = await io.finish(job.revision);
    if (result.state === "lost") return false;
    if (result.state === "done") {
      await io.release();
      return true;
    }
    job = result.job;
  }
  await io.release();
  return false;
}

// The admin action and retry CLI share this worker; SQL serializes each user.
export async function syncSupabaseAuth(
  client: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const token = crypto.randomUUID();
  async function rpc(name: string, args: Record<string, unknown>) {
    const { data, error } = await client.rpc(name, {
      p_user: userId,
      p_token: token,
      ...args,
    });
    if (error) throw error;
    return data;
  }
  return processAuthJob({
    claim: () => rpc("claim_auth_sync", {}),
    apply: async (status) => {
      const { error } = await client.auth.admin.updateUserById(userId, {
        ban_duration: status === "blocked" ? "876000h" : "none",
      });
      if (error) throw error;
    },
    finish: (revision) => rpc("finish_auth_sync", { p_revision: revision }),
    release: async () => {
      await rpc("release_auth_sync", {});
    },
  });
}
