Summary

- Restored the visible Pause/Resume animated border effect by moving it back onto an outer wrapper ring.
- Kept the effect border-only, `Resume`-only, and aligned to the article's bright gradient colors.
- Preserved the fixed-width button and overlay badge so the paused state does not shift surrounding UI.

File list

- `app.css`
- `PATCH_NOTES_PAUSE_RESUME_EFFECT_RESTORE_20260331.md`

Install steps (exact paths)

1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Keep this patch note file with the TEST artifact for reference.

Smoke test checklist

- In Operator, start a timed slot and confirm `Pause` looks like a normal button.
- Pause the timed slot and confirm `Resume` shows a clearly visible animated border ring.
- Confirm the `Paused` badge appears without moving neighboring controls.
- Repeat the same check on Soundboard.

Known risks / limitations

- This was a CSS-only follow-up and was not smoke-tested in a live browser here.
- Git reported only line-ending warnings (`LF` to `CRLF`) during diff checks; no content errors were reported.

Target environment

- `OMJN/TEST`

Rollback note

- Restore the previous version of `app.css` from your last known-good TEST copy or Git history if you want to undo this patch.
