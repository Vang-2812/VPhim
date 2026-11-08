# Custom Video Player and Bottom Action Bar Specification

## 1. Overview
Enhance the VPhim playback experience (`/xem/[slug]`) to match modern streaming platforms (inspired by LyngFlix / iQIYI reference design):
1. **Custom Video Player Controls**: An on-screen overlay replacing native browser video controls with custom scrub bar, play/pause, +/-10s seek, persistent volume slider & mute, time counter, brand watermark, playback speed selector, picture-in-picture, and fullscreen toggle.
2. **Persistent Volume & Mute**: Remember player volume level (0.0 to 1.0) and muted state across sessions and page navigations via `localStorage`.
3. **Bottom Action Bar**: A sleek dark toolbar sitting directly underneath the player containing:
   - Favorite toggle (`♡ Yêu thích` / `♥ Đã thích`)
   - Add to playlist (`+ Thêm vào`)
   - Auto-next episode toggle badge (`Chuyển tập [ON / OFF]`)
   - Previous episode button (`⏮ Tập trước`)
   - Next episode button (`⏭ Tập tiếp theo`)
   - Share button (`✈ Chia sẻ`) with clipboard copy and toast notification.
4. **Auto-next Execution**: When video ends, if `Chuyển tập [ON]` is active and a next episode exists, automatically transition to the next episode.

---

## 2. Requirements & Behavior

### A. Persistent Volume & Mute (`storage.ts`)
- Stored keys:
  - `vphim_player_volume`: floating string (e.g. `"0.8"`), default `1`.
  - `vphim_player_muted`: `"true"` or `"false"`, default `false`.
- When `<video>` mounts or source changes, initialize `video.volume = storedVolume` and `video.muted = storedMuted`.
- When user adjusts volume or clicks mute in the UI, update the video and save to `localStorage`.
- Volume slider range: `0` to `100` (mapped to `0.0` to `1.0`).

### B. Custom Video Player Controls Overlay
- When in `hls` (native `<video>`) mode, remove native `controls` attribute (`controls={false}`) and render a custom overlay.
- Overlay elements:
  - **Scrubber / Progress Bar**:
    - Progress track showing played percentage (amber line) and loaded buffer percentage (lighter bar).
    - Hover preview time tooltip.
    - Click and drag seek support.
  - **Bottom Left Controls**:
    - Play / Pause button (`Play`, `Pause` icons).
    - Rewind 10s button (`RotateCcw` with 10s label).
    - Fast-forward 10s button (`RotateCw` with 10s label).
    - Volume button (`Volume2`, `Volume1`, `VolumeX`) with hover/touch slider.
    - Time text: `02:24 / 24:20` (or `01:10:05 / 02:05:30` when over 1 hour).
  - **Bottom Right Controls**:
    - Brand watermark badge: `VPhim` in amber accent.
    - Settings button (`Settings` icon): popup menu with playback rates: `0.75x`, `1x`, `1.25x`, `1.5x`, `2x`.
    - Picture-in-Picture (`Pip` icon): calls `document.pictureInPictureElement ? document.exitPictureInPicture() : video.requestPictureInPicture()`.
    - Fullscreen button (`Maximize`, `Minimize` icons): toggles fullscreen on the player container.
  - **Auto-hide**:
    - Controls automatically fade out after 3 seconds of inactivity while video is playing.
    - Mouse movement or touch immediately restores controls.
    - Controls stay visible when paused or when settings menu is open.
  - **Keyboard Shortcuts**:
    - `Space` / `k`: Play/Pause
    - `ArrowLeft` / `j`: Seek backward 10s
    - `ArrowRight` / `l`: Seek forward 10s
    - `ArrowUp`: Increase volume 10%
    - `ArrowDown`: Decrease volume 10%
    - `m`: Toggle mute
    - `f`: Toggle fullscreen

### C. Bottom Action Bar (`watch-action-bar.tsx`)
- Container styled with dark surface (`var(--color-surface)`), rounded corners, flex items.
- Items:
  1. **Yêu thích (`Heart` icon)**:
     - Logged-in: calls `setFavorite(slug, !favorite)`, toggles state.
     - Guest: links to `/dang-nhap?next=...`.
  2. **Thêm vào (`ListPlus` icon)**:
     - Logged-in: opens playlist selection dropdown / modal.
     - Guest: links to `/dang-nhap?next=...`.
  3. **Chuyển tập (`Toggle` with `ON` / `OFF` badge)**:
     - Stored in `localStorage` (`vphim_auto_next`, default `true`).
     - Toggles badge between `ON` (amber accent) and `OFF` (muted).
     - When `ended` event fires on video: if `autoNext === true` and next episode exists, automatically navigates to next episode.
  4. **Tập trước (`SkipBack` icon)**:
     - Disabled / dimmed if at the first episode.
     - Navigates to previous episode URL.
  5. **Tập tiếp theo (`SkipForward` icon)**:
     - Disabled / dimmed if at the last episode.
     - Navigates to next episode URL.
  6. **Chia sẻ (`Send` / `Share2` icon)**:
     - Copies current URL (`window.location.href`) to clipboard.
     - Shows toast notification: "Đã sao chép liên kết xem phim!".

### D. Embed (Iframe) Fallback Compatibility
- When player falls back to iframe embed (or starts in embed mode), custom video controls cannot overlay cross-origin iframe. The iframe uses its own player controls.
- However, the **Bottom Action Bar** remains fully visible and active right underneath the iframe!
- Notice for embed mode remains displayed cleanly.

---

## 3. Visual & Responsive Design
- Palette adheres strictly to `tokens.css`: charcoal surfaces (`#121316`, `#1a1b20`), amber accent (`#f59e0b`), white text with muted secondary (`#9ca3af`).
- Mobile (< 640px):
  - Action bar scrolls horizontally or compresses button text smoothly without wrapping or overlapping.
  - Volume slider collapses to icon tap or compact touch slider.
