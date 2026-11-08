# Video Image Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real-time video image filter options (brightness, contrast, saturation, sharpness presets, and custom sliders) to the video player, persisting user choices across sessions and working seamlessly on both native video and embedded iframe sources.

---

## File Structure Map

- **New files:**
  - `src/features/playback/filters.ts`: Filter presets, settings interfaces, filter CSS string generator with safe boundary clamping.
  - `src/features/playback/video-filter-defs.tsx`: Hidden SVG component containing convolution matrix filters (`#vphim-sharpen-low`, `#vphim-sharpen-high`).
  - `tests/unit/playback-filters.test.ts`: Unit tests for preset definitions, boundary clamping, CSS filter generation, and serialization.
  - `tests/components/custom-controls-filters.test.tsx`: Tests for the settings menu navigation (Submenu: Tốc độ phát vs Bộ lọc hình ảnh), preset selection, and custom sliders.
- **Modified files:**
  - `src/features/playback/storage.ts`: Persistence for video filter settings (`getVideoFilterSettings()`, `setVideoFilterSettings()`).
  - `src/features/playback/custom-controls.tsx`: Settings menu with sub-panel navigation (Main menu -> Speed / Video Filters), preset buttons, custom adjustment sliders.
  - `src/features/playback/video-player.tsx`: Mount SVG filter definitions, apply computed `filter` style to `<video>` and `<iframe>`, pass filter state and callbacks to `CustomControls`.
  - `src/app/globals.css`: Styles for settings submenu, back button, preset selector pills, range sliders, and active states.

---

## Tasks

### Task 1: Video Filter Model, Presets, and Storage Persistence
- [ ] Create `tests/unit/playback-filters.test.ts` to test preset mappings, CSS filter string generation, and safe clamping values.
- [ ] Implement `src/features/playback/filters.ts`:
  - `VideoFilterPreset`: `"none" | "vivid" | "anime" | "cinema" | "night" | "custom"`
  - `VideoFilterSettings`: `{ preset, brightness, contrast, saturate, sepia, sharpen }`
  - `FILTER_PRESETS`: Map of preset names to pre-calibrated values.
  - `getVideoFilterCSS(settings: VideoFilterSettings): string`: Generates safe CSS filter string (e.g., `contrast(108%) saturate(115%) brightness(102%) url(#vphim-sharpen-low)`).
- [ ] Update `src/features/playback/storage.ts`:
  - Add `getVideoFilterSettings(): VideoFilterSettings` (with fallback to `"none"`).
  - Add `setVideoFilterSettings(settings: VideoFilterSettings): void`.
- [ ] Run `npm test tests/unit/playback-filters.test.ts` to verify unit tests pass.

### Task 2: SVG Sharpening Filter Definitions Component
- [ ] Implement `src/features/playback/video-filter-defs.tsx`:
  - SVG element hidden from layout (`position: absolute; width: 0; height: 0; pointer-events: none; opacity: 0;`).
  - Include `<filter id="vphim-sharpen-low">` with `<feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -0.5 0 -0.5 3 -0.5 0 -0.5 0" />`.
  - Include `<filter id="vphim-sharpen-high">` with `<feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0" />`.
- [ ] Add unit test in `tests/unit/playback-filters.test.ts` verifying component renders cleanly.

### Task 3: Settings Submenu in CustomControls (Speed & Video Filters)
- [ ] Update `src/features/playback/custom-controls.tsx`:
  - Add `videoFilter: VideoFilterSettings` and `onVideoFilterChange: (settings: VideoFilterSettings) => void` to `CustomControlsProps`.
  - Introduce sub-view state: `settingsView: "main" | "speed" | "filters"`.
  - In `"main"` view, show menu rows:
    - `Tốc độ phát` -> displays current speed (e.g. `1.0x`) and chevron right.
    - `Bộ lọc hình ảnh` -> displays current preset name (e.g. `Sống động`) and chevron right.
  - In `"speed"` view, show back button `< Cài đặt` and list of playback rates.
  - In `"filters"` view, show back button `< Cài đặt`, list of presets (`Gốc`, `Sống động`, `Anime`, `Điện ảnh`, `Dịu mắt`, `Tùy chỉnh`), and if `Tùy chỉnh` is chosen, render sliders for:
    - Độ sáng (80% - 130%)
    - Tương phản (80% - 140%)
    - Bão hòa (50% - 160%)
    - Độ nét (Tắt / Vừa / Cao)
    - Nút "Đặt lại" (Reset to default)
- [ ] Add CSS in `src/app/globals.css` for `.player-settings-header`, `.player-settings-back-btn`, `.filter-preset-list`, `.filter-slider-group`.
- [ ] Create `tests/components/custom-controls-filters.test.tsx` to verify navigation to the filters view and preset selection triggering `onVideoFilterChange`.
- [ ] Run `npm test tests/components/custom-controls-filters.test.tsx`.

### Task 4: Connect Filter to Video Player and Iframe
- [ ] Update `src/features/playback/video-player.tsx`:
  - Mount `<VideoFilterDefs />` once inside `VideoPlayer`.
  - Maintain `videoFilter` state initialized with `getVideoFilterSettings()`.
  - Derive `filterCss = getVideoFilterCSS(videoFilter)`.
  - Apply `style={{ filter: filterCss !== "none" ? filterCss : undefined }}` to `<video>` element.
  - Also apply `style={{ filter: filterCss !== "none" ? filterCss : undefined }}` to `<iframe>` element so embedded source benefits from chosen filters!
  - In `handleVideoFilterChange`, update state and call `setVideoFilterSettings(newSettings)`.
- [ ] Run `npm test` across all 30+ test suites.

### Task 5: End-to-End Verification & Git Sync
- [ ] Run `npm run typecheck` (`tsc --noEmit`).
- [ ] Run `npm run build` (`next build`) to ensure clean Turbopack build.
- [ ] Stage and commit changes with a descriptive commit message.
- [ ] Push to `origin main`.
