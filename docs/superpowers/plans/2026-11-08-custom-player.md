# Custom Video Player & Bottom Action Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an on-screen custom video player control bar (with persistent volume/mute, +/-10s seek, timeline scrubber, settings, PiP, fullscreen) and a bottom action bar (favorite, add to playlist, auto-next episode toggle, prev/next episode, share) matching the modern streaming UI reference.

**Architecture:** Create client-side storage helpers for player preferences (volume, mute, auto-next). Build `CustomControls` for the `<video>` element with timeline scrubbing, rate selection, PiP, and fullscreen. Build `WatchActionBar` directly below the video stage integrating existing library actions (`setFavorite`, `setPlaylistMovie`), auto-next navigation, episode switching, and clipboard sharing. Style both components using the existing charcoal and amber token palette in `globals.css`.

**Tech Stack:** Next.js 16.4.5 App Router, React 19, TypeScript, Vitest, Testing Library, Lucide React icons.

**Spec:** `docs/superpowers/specs/2026-11-08-custom-player-design.md`

## Global Constraints

- Keep the charcoal background and amber accent defined in `src/styles/tokens.css`; keep existing routes and API contracts.
- Do not break existing HLS buffer optimizations, auto-resume, or auto-fallback to embed iframe on stream error.
- All storage access must be SSR-safe (`typeof window !== "undefined"`).
- Keyboard shortcuts on video player must not interfere with typing when focus is inside an input, textarea, or select.
- When player is in embed (iframe) mode, the bottom action bar must remain active and functional underneath.

## Review Focus

- Volume and mute state must restore correctly on page refresh and apply immediately to newly mounted `<video>` elements.
- Seeking on the custom scrubber must update playback position smoothly without resetting or infinite re-renders.
- Auto-next must automatically route to the next episode when the video ends if enabled, and do nothing if disabled or on the final episode.
- Share button must copy the current watch URL to clipboard and show feedback even if clipboard API fails.
- Player controls must auto-hide after 3 seconds of mouse inactivity while playing, and immediately reappear on user interaction.

---

### Task 1: Playback Preferences Storage (Volume, Mute, Auto-Next)

**Files:**
- Create: `src/features/playback/storage.ts`
- Test: `tests/unit/playback-storage.test.ts`

**Interfaces:**
```ts
export interface PlayerPreferences {
  volume: number; // 0.0 to 1.0, default 1.0
  muted: boolean; // default false
  autoNext: boolean; // default true
}

export function getPlayerPreferences(): PlayerPreferences;
export function setPlayerVolume(volume: number, muted?: boolean): void;
export function setPlayerAutoNext(autoNext: boolean): void;
```

- [ ] **Step 1: Write unit tests** for `getPlayerPreferences`, `setPlayerVolume`, and `setPlayerAutoNext` in `tests/unit/playback-storage.test.ts` testing default values, persistence to `localStorage`, and SSR/window safety.
- [ ] **Step 2: Run** `npx vitest run tests/unit/playback-storage.test.ts` to confirm test failure.
- [ ] **Step 3: Implement** `src/features/playback/storage.ts` with safe parsing, clamping volume between 0 and 1, and fallback defaults.
- [ ] **Step 4: Run the unit tests** and confirm they pass.
- [ ] **Step 5: Commit** Task 1.

---

### Task 2: Custom Video Player Controls Overlay

**Files:**
- Create: `src/features/playback/custom-controls.tsx`
- Modify: `src/features/playback/video-player.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/components/custom-controls.test.tsx`

**Interfaces:**
```tsx
export interface CustomControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number, muted: boolean) => void;
}
```

- [ ] **Step 1: Write component tests** in `tests/components/custom-controls.test.tsx` testing play/pause toggle, +/-10s seek buttons, volume slider/mute toggle, time display format, and fullscreen button.
- [ ] **Step 2: Run** `npx vitest run tests/components/custom-controls.test.tsx` to confirm failure.
- [ ] **Step 3: Implement** `CustomControls` with:
  - Play/pause toggle and +/-10s buttons.
  - Interactive scrub bar with buffered and current progress.
  - Persistent volume slider with mute toggle.
  - Formatted time counter (`mm:ss / mm:ss` or `hh:mm:ss`).
  - Right controls: VPhim brand badge, speed settings dropdown (0.75x, 1x, 1.25x, 1.5x, 2x), PiP button, Fullscreen button.
  - Idle auto-hide timer (3s) on mouse move / mouse leave.
  - Keyboard listener for Space, Left/Right arrow, Up/Down arrow, M, F.
- [ ] **Step 4: Add CSS styles** in `src/app/globals.css` for controls overlay, scrub track, hover tooltip, buttons, and animations.
- [ ] **Step 5: Run tests** and confirm all pass.
- [ ] **Step 6: Commit** Task 2.

---

### Task 3: Bottom Action Bar Component

**Files:**
- Create: `src/features/playback/watch-action-bar.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/components/watch-action-bar.test.tsx`

**Interfaces:**
```tsx
export interface WatchActionBarProps {
  slug: string;
  member: boolean;
  prevHref: string | null;
  nextHref: string | null;
  autoNext: boolean;
  onToggleAutoNext: (enabled: boolean) => void;
}
```

- [ ] **Step 1: Write component tests** in `tests/components/watch-action-bar.test.tsx` for:
  - Favorite toggle (shows heart, calls action or links to login for guests).
  - Add to playlist button/dropdown.
  - Auto-next toggle button changing state between ON/OFF.
  - Previous and Next episode navigation links (disabled when null).
  - Share button copying URL to clipboard and showing toast message.
- [ ] **Step 2: Run** `npx vitest run tests/components/watch-action-bar.test.tsx` to confirm failure.
- [ ] **Step 3: Implement** `WatchActionBar` in `src/features/playback/watch-action-bar.tsx`.
- [ ] **Step 4: Add CSS styles** in `src/app/globals.css` for action bar, responsive scrolling on mobile, and toast feedback.
- [ ] **Step 5: Run tests** and confirm pass.
- [ ] **Step 6: Commit** Task 3.

---

### Task 4: Player & Watch Screen Integration and End-to-End Verification

**Files:**
- Modify: `src/features/playback/video-player.tsx`
- Modify: `src/features/playback/watch-screen.tsx`
- Modify: `tests/components/video-player.test.tsx`
- Modify: `tests/components/video-player-hls.test.tsx`

- [ ] **Step 1: Integrate `CustomControls` into `VideoPlayer`**:
  - Remove `controls` attribute on `<video>` when native playback is active.
  - Bind custom controls to video ref, track `currentTime`, `duration`, `bufferedEnd`, `isPlaying`.
  - Restore initial volume & mute from `getPlayerPreferences()` on mount and update on change.
- [ ] **Step 2: Integrate `WatchActionBar` into `WatchScreen`**:
  - Place `WatchActionBar` directly below the video stage.
  - Wire `autoNext` preference: when video `ended` event triggers, if `autoNext` is true and `nextHref` exists, call `router.push(nextHref)`.
  - Ensure action bar remains fully functional in both direct HLS and embed iframe modes.
- [ ] **Step 3: Run full test suite (`npm test`), typecheck (`npm run typecheck`), and build (`npm run build`).**
- [ ] **Step 4: Commit** Task 4.
