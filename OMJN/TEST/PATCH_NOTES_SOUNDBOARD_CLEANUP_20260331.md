# PATCH_NOTES_SOUNDBOARD_CLEANUP_20260331

## Summary
TEST-targeted cleanup pass for the Soundboard page.

This patch:
- fixes Soundboard HTML label/attribute issues
- improves modal keyboard behavior and focus handling
- prevents global Soundboard hotkeys from firing while modals or the audio overlay are active
- makes failed sound loads retry cleanly instead of getting stuck
- removes stale Soundboard-only CSS selectors that no longer map to the current layout

## File list
- `app.css`
- `soundboard.html`
- `soundboard.js`
- `PATCH_NOTES_SOUNDBOARD_CLEANUP_20260331.md`

## Install steps (exact paths)
Copy these files into the TEST build root, replacing the existing files:
- `app.css` -> `OMJN/TEST/app.css`
- `soundboard.html` -> `OMJN/TEST/soundboard.html`
- `soundboard.js` -> `OMJN/TEST/soundboard.js`
- `PATCH_NOTES_SOUNDBOARD_CLEANUP_20260331.md` -> `OMJN/TEST/PATCH_NOTES_SOUNDBOARD_CLEANUP_20260331.md`

## Smoke test checklist
- Open `soundboard.html`.
- Confirm `Compact` and `Sticky controls` labels toggle the correct checkboxes.
- Open Soundboard Settings and verify `Tab` stays inside the modal and `Escape` closes it.
- Open Add music embed and verify overlay click closes it, `Escape` closes it, and focus returns to the opener.
- Focus buttons like `Enable`, `Settings`, `Back`, and transport controls, then press `Space` and confirm they do not trigger panic stop.
- Trigger a sound load failure if available, then retry and confirm the pad can recover instead of staying stuck in `loading`.
- Resize the music embed pane with keyboard arrows on the splitter and confirm the separator still works normally.

## Known risks / limitations
- This pass was statically verified with `node --check`, not full browser automation.
- Modal focus trapping is intentionally lightweight and scoped to the current Soundboard modal structure.
- No Soundboard product behavior was changed around Drive defaults or preload strategy.

## Target environment
- `OMJN/TEST`

## Rollback note
Restore the previous versions of `app.css`, `soundboard.html`, and `soundboard.js` if you want to undo this cleanup pass.
