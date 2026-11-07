import type { PlaybackSample } from "./types";
export function resumePosition(
  position: number | null,
  duration: number,
  completed: boolean,
) {
  return completed || position === null || !Number.isFinite(position)
    ? 0
    : Math.max(0, Math.min(position, Math.max(0, duration - 1)));
}
export function createProgressWriter(
  send: (sample: PlaybackSample, sequence: number) => Promise<void>,
) {
  let latest: PlaybackSample | null = null,
    sequence = 0,
    inflight: Promise<void> | null = null,
    disposed = false;
  async function flush(): Promise<void> {
    if (disposed) return;
    if (inflight) {
      await inflight;
      return flush();
    }
    if (!latest) return;
    const value = latest;
    latest = null;
    inflight = send(value, ++sequence)
      .catch(() => {
        if (!latest) latest = value;
      })
      .finally(() => {
        inflight = null;
      });
    await inflight;
  }
  const timer = setInterval(() => {
    void flush();
  }, 15000);
  return {
    sample(value: PlaybackSample) {
      latest = value;
      if (value.reason !== "time") void flush();
    },
    flush,
    dispose() {
      disposed = true;
      clearInterval(timer);
    },
  };
}
