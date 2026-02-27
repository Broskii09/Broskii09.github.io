# OMJN Patch Notes — splashbgremove_center_20260226

## Summary
This patch removes the legacy `splash_BG.jpg` dependency (no more missing-file console errors), keeps the Viewer on the **animated gradient background** by default, and centers the Splash layout vertically.

Key behavior changes:
- Operator “Custom Background Image URL” is now truly **optional** (blank = gradient).
- Viewer no longer falls back to `./assets/splash_BG.jpg`.
- Splash block is vertically centered (no longer anchored near the bottom).

## Files changed
- `shared.js`
- `operator.js`
- `operator.html`
- `viewer.js`
- `app.css`

## Install steps
1) Copy these files into your `/OMJN/TEST/` directory (overwrite existing):
   - `shared.js`
   - `operator.js`
   - `operator.html`
   - `viewer.js`
   - `app.css`

2) Ensure you have a Splash left graphic at:
   - `./assets/splash_left.png`

   Recommended artboard: **1920×1080 (16:9)** PNG with transparency.
   The image is rendered with `object-fit: contain`, so other aspect ratios will still work, but 16:9 tends to fill the space best on TVs.

   If the file is missing, the Viewer will automatically hide the left panel and switch to a single-column Splash.

3) After validating in `/OMJN/TEST/`, promote by copying the same files into `/OMJN/`.

## Smoke test checklist
### Local test
- Open `operator.html` and `viewer.html` locally.
- Confirm Operator shows **Viewer connected** (should flip to connected within ~2 seconds).
- Add three queued performers and confirm Splash shows:
  - **Up Next / On Deck / In The Hole** (and that Ads do NOT appear there).
- Toggle **HB Footer** and confirm the **House Band Splash row** shows/hides.
- In Operator Settings → Viewer, adjust **Viewer font scale** and confirm Viewer text grows/shrinks.

### Internet-side test (`/OMJN/TEST/`)
- Repeat the above from:
  - `https://broskii09.github.io/OMJN/TEST/operator.html`
  - `https://broskii09.github.io/OMJN/TEST/viewer.html`
- Confirm state is isolated from live `/OMJN/` (TEST should not reuse live queue).

### Video ad test
- Add a **Video Ad** slot.
- Go Live on the ad.
- Confirm the Viewer plays it once (no loop) and returns to **SPLASH** when finished.

## Known risks / limitations
- **No performer name suggestions** now (datalist removed). This is intentional to avoid stale-data gotchas.
- Media-clearing logic is intentionally aggressive when identity changes:
  - If the operator changes the slot name or type and does not explicitly update the donation URL/layout, the system will clear/normalize those fields to prevent stale carry-over.
- BroadcastChannel is required for **video-ad auto-end** (works in modern Chrome/Safari/Edge; if disabled, ads will still require manual End).
