export interface PlaybackSample {
  position: number | null;
  duration: number | null;
  ended: boolean;
  reason: "time" | "pause" | "ended";
}
