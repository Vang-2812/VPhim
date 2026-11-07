export async function processAuthJob(io: {
  get: () => Promise<{ status: "active" | "blocked"; revision: number } | null>;
  apply: (status: "active" | "blocked") => Promise<void>;
  complete: (revision: number) => Promise<boolean>;
}): Promise<boolean> {
  const job = await io.get();
  if (!job) return true;
  await io.apply(job.status);
  return io.complete(job.revision);
}
