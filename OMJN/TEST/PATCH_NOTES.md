# PATCH_NOTES.md

## Summary
Final consolidation patch on the latest uploaded baseline. Restores missing live-control features, fixes known runtime errors, and preserves recent Viewer/Crowd/Jamaoke work without pulling from older broken branches.

## Included in this patch
- Combined Pause/Resume button with stable layout and in-button Paused badge
- Hide/Show Viewer Timer button (controls Viewer timer + progress bar)
- 5-minute changeover buffer in queue ETA and Estimated End
- Intermission modal actions: Go Live Now / Arm Next and Add to Top / Add Next
- Export/Import relabeled to Show Data
- Jamaoke preserved as a real slot type with untimed Viewer behavior
- Crowd Prompt Save & Close retained
- Viewer PAUSED chip visibility hardened
- Lightweight toast helper added for ad/intermission flows
- Favicon links added to Operator, Index, and Soundboard

## Files changed
- operator.html
- operator.js
- viewer.js
- index.html
- soundboard.html
- favicon.svg
- PATCH_NOTES.md
- REGRESSION_LEDGER.md

## Smoke test checklist
- Operator loads without `closeAfter` or `toast` errors
- Combined Pause/Resume button updates correctly and does not shift layout
- Hide Viewer Timer hides both timer and progress bar immediately
- Jamaoke appears in slot types and hides timer/progress on Viewer
- Queue ETA / Estimated End include the 5-minute buffer
- Intermission modal shows Go Live / Arm Next and Add to Top / Add Next appropriately
- Crowd Prompt Save stays open; Save & Close closes after saving
- Viewer PAUSED chip appears while paused
