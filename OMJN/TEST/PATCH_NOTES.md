# PATCH_NOTES

## Summary
Consolidation patch restoring the recent feature set onto the latest uploaded baseline without rolling back Crowd Prompt UX.

Restored in this patch:
- Crowd Prompt run-console + modal editor redesign
- Combined Pause/Resume button with inline PAUSED badge
- Viewer Hide Timer toggle (timer + progress)
- 5-minute changeover buffer in ETA / Estimated End math
- Jamaoke slot type with Viewer timer/progress suppression
- Viewer PAUSED chip visibility
- Intermission Go Live / Arm Next and Add Top / Add Next behavior
- Adaptive Viewer name fit retained

## File list
- operator.html
- operator.js
- viewer.html
- viewer.js
- shared.js
- app.css
- PATCH_NOTES.md
- REGRESSION_LEDGER.md

## Install steps
Replace the matching files in your project root with the versions from this zip.

## Smoke test checklist
- Operator shows a single Pause/Resume button with the Paused badge inside the button
- Hide Viewer Timer hides both timer and progress immediately
- Crowd Prompt card is a compact run console and Edit Prompts opens a modal
- Crowd Prompt preset dropdown on the main card switches presets
- Intermission modal shows Go Live Now / Arm Next and Add Top / Add Next correctly
- Jamaoke appears in slot types and hides timer/progress on Viewer when live
- Viewer shows PAUSED chip only while paused
- Queue ETA labels and Estimated End include the 5-minute changeover buffer

## Known risks / limitations
- Browser-only behaviors such as real media playback, exact font fitting, and extension-related console noise still need manual in-browser verification.
