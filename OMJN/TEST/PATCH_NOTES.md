# PATCH_NOTES

## Summary
Targeted UI polish pass on the consolidated baseline. This patch is presentation-only: it tightens the Operator live-control area and stabilizes Viewer chip-row spacing without changing show logic.

## Files
- operator.html
- app.css

## Install
Replace the matching files in your current baseline with the files in this zip.

## Smoke test
- Toggle Pause/Resume and confirm the live-control row stays aligned.
- Toggle Hide Viewer Timer and confirm the timer row still wraps cleanly on narrower widths.
- Pause a live slot and confirm the Viewer PAUSED chip appears without the chip row jumping vertically.
- Check a normal live slot, Intermission, and Jamaoke screen for clean card spacing.

## Known limitations
- No show logic was changed in this patch.
- This does not add new features; it only stabilizes layout and spacing.
