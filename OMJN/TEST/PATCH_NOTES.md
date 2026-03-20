# PATCH_NOTES

Summary
- Restored and added the requested hosted-baseline fixes on the latest uploaded files.
- Added Jamaoke as a real slot type.
- Added Show/Hide Viewer Timer control back to the Operator and wired it to hide both the Viewer timer and the progress bar.
- Re-combined Pause/Resume into a single state-aware button with the PAUSED badge inside the button.
- Restored the 5-minute changeover buffer in queue ETA and Estimated End math.
- Improved Intermission actions: Add to Top / Add Next and Go Live Now / Arm Next.
- Added Save & Close behavior to the Crowd Prompt editor panel.
- Renamed import/export buttons to “Show Data” to match what those controls actually handle.
- Set the Sponsor Bug default image URL to ./assets/InSeitz Media Logo.png.
- Added a toast helper to prevent the Intermission/ad error path from crashing when toast() is called.
- Added a favicon to reduce the favicon 404 noise in Operator/Viewer/Soundboard.

Files
- operator.html
- operator.js
- viewer.html
- viewer.js
- shared.js
- app.css
- soundboard.html
- favicon.svg

Install
- Replace the matching files in your site root with the versions from this patch zip.
- Add your sponsor default image at: ./assets/InSeitz Media Logo.png

Smoke test checklist
- Operator:
  - Export/Import button labels read “Export Show Data” / “Import Show Data”.
  - Combined Pause/Resume button shows PAUSED inside the button while paused.
  - Hide Viewer Timer button toggles to Show Viewer Timer and back.
  - Intermission modal shows:
    - Splash: Go Live Now / Add to Top
    - Live: Arm Next / Add Next
  - Crowd Prompt editor supports Save and Save & Close.
- Viewer:
  - PAUSED chip appears only while paused.
  - Hide Viewer Timer hides both timer and progress bar.
  - Jamaoke shows the live card but hides timer and progress.
- Queue math:
  - ETA labels include a 5-minute changeover buffer between eligible acts.
  - Estimated End includes the same buffer.
- Sponsor Bug:
  - Default URL points to ./assets/InSeitz Media Logo.png and can still be replaced by upload or custom URL.

Known risks / limitations
- The async “message channel closed” console error is still likely from a browser extension, not your app code.
- The Crowd Prompt editor in this baseline remains an inline editor panel with Save & Close, not the full modal redesign branch.
