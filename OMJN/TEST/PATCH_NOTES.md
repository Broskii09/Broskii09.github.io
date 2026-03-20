# PATCH_NOTES.md

## Summary
This patch consolidates the current uploaded OMJN build into one coherent baseline and fixes the recent branch drift that had reintroduced older Operator and Viewer behavior.

Restored and stabilized in this patch:
- Combined **Pause / Resume** control with the **Paused** badge inside the button
- **Hide Viewer Timer** control on Operator, wired to hide both the Viewer timer and progress bar
- **5-minute changeover buffer** in queue ETA and Estimated End math
- Improved **Intermission** actions:
  - Splash: **Go Live Now** / **Add to Top**
  - Live or paused: **Arm Next** / **Add Next**
- **Crowd Prompt** run console plus **modal editor**
- Crowd Prompt **Save / Save & Close / Cancel** behavior
- **Jamaoke** slot type with planning minutes for ETA and hidden timer/progress on Viewer
- Viewer **PAUSED** chip visibility
- Default sponsor bug asset path set to `./assets/InSeitz Media Logo.png`
- Favicon links for Operator, Viewer, Index, and Soundboard

Cleanup included in this audit patch:
- Removed dead Viewer `startBanner` DOM references from JS
- Removed dead Operator `crowdEditor` inline-panel wiring from JS
- Removed stale CSS selectors for the retired inline Crowd Prompt editor
- Removed stale CSS selectors tied to the removed `#startBanner` element while preserving the live-card intro animation
- Added a lightweight `toast()` helper to avoid runtime errors in Intermission and related flows

## Files changed
- `operator.html`
- `operator.js`
- `viewer.html`
- `viewer.js`
- `shared.js`
- `app.css`
- `index.html`
- `soundboard.html`
- `favicon.svg`
- `PATCH_NOTES.md`
- `REGRESSION_LEDGER.md`
- `AUDIT_REPORT.md`

## Install steps
1. Replace the matching files in your GitHub Pages `TEST` directory.
2. Ensure the sponsor default asset exists at:
   - `./assets/InSeitz Media Logo.png`
3. Hard refresh Operator and Viewer after deploy.
4. Validate in `/TEST` before promoting to the live root.

## Smoke test checklist

### Local test
- Open Operator and Viewer.
- Confirm no startup JS errors in either page.
- Start a normal timed slot.
- Confirm combined **Pause / Resume** works and does not shift the Live Control layout.
- Confirm Viewer shows **PAUSED** only while paused.
- Confirm **Hide Viewer Timer** hides both the Viewer timer and progress bar immediately.
- Add multiple performers and confirm ETA labels and Estimated End include the 5-minute changeover buffer.
- Add an Intermission slot and confirm:
  - Splash: **Go Live Now** / **Add to Top**
  - Live: **Arm Next** / **Add Next**
- Add a Jamaoke slot and confirm Viewer hides timer/progress during live Jamaoke.
- Open Crowd Prompt editor, then verify:
  - **Save** keeps it open
  - **Save & Close** closes after saving
  - **Cancel** closes without saving the draft

### Internet-side test (TEST dir)
- Repeat the checks in the hosted `/TEST` build.
- Confirm Operator, Viewer, and Soundboard all load the favicon without 404 noise.
- Confirm sponsor bug loads the default InSeitz logo when enabled and no custom source is set.

## Known limitations / notes
- The browser console message `A listener indicated an asynchronous response by returning true...` is still most likely caused by a browser extension, not this app.
- This was a code-level consolidation and static audit. Media playback timing, ad transitions, and Crowd Prompt visual feel should still be validated in a real browser session.
