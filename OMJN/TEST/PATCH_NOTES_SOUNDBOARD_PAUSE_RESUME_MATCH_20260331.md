# PATCH_NOTES_SOUNDBOARD_PAUSE_RESUME_MATCH_20260331

## Summary
TEST-targeted Soundboard control polish.

This patch updates the Soundboard transport controls so the Pause/Resume experience matches the Operator page UI/UX more closely:
- replaces separate `Pause` and `Resume` buttons with one combined button
- mirrors the Operator label swap behavior (`Pause` <-> `Resume`)
- mirrors the Operator paused badge behavior
- mirrors the Operator disabled/title behavior when no timed live slot is active

## File list
- `soundboard.html`
- `soundboard.js`
- `PATCH_NOTES_SOUNDBOARD_PAUSE_RESUME_MATCH_20260331.md`

## Install steps (exact paths)
Copy these files into the TEST build root, replacing the existing files:
- `soundboard.html` -> `OMJN/TEST/soundboard.html`
- `soundboard.js` -> `OMJN/TEST/soundboard.js`
- `PATCH_NOTES_SOUNDBOARD_PAUSE_RESUME_MATCH_20260331.md` -> `OMJN/TEST/PATCH_NOTES_SOUNDBOARD_PAUSE_RESUME_MATCH_20260331.md`

## Smoke test checklist
- Open `soundboard.html`.
- Confirm the transport row now shows one combined Pause/Resume button between `Start` and `End`.
- While the show is `SPLASH`, confirm the Pause/Resume button is disabled and shows the tooltip `No timed live slot is active`.
- Start a timed slot and confirm the button label reads `Pause`.
- Click it once and confirm the show enters `PAUSED`, the label changes to `Resume`, and the `Paused` pill appears.
- Click it again and confirm the show returns to `LIVE`, the label changes back to `Pause`, and the pill hides.
- Confirm `End -> Splash` behavior still works normally after pause/resume.

## Known risks / limitations
- This patch assumes the current TEST Soundboard cleanup baseline is already in place.
- This pass does not change Soundboard keyboard shortcuts; it only aligns the transport button UI/UX with Operator.

## Target environment
- `OMJN/TEST`

## Rollback note
Restore the previous versions of `soundboard.html` and `soundboard.js` if you want to undo the combined Pause/Resume control.
