Summary

- Tuned the shared Operator/Soundboard Pause/Resume styling so the animated effect appears only on the `Resume` state.
- Switched the effect to a border-only treatment using the article's gradient color palette more directly.
- Fixed the `Paused` badge layout so it overlays inside the button instead of changing nearby spacing.

File list

- `app.css`
- `PATCH_NOTES_PAUSE_RESUME_BORDER_TUNE_20260331.md`

Install steps (exact paths)

1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Keep this patch note file with the TEST artifact for reference.

Smoke test checklist

- In Operator, start a timed slot and confirm the `Pause` button looks like the other standard controls.
- In Operator, pause the timed slot and confirm the `Resume` button gets the animated border effect.
- While paused, confirm the `Paused` badge appears without moving the Start/End buttons or the surrounding row.
- Return to live and confirm the animated effect disappears when the button goes back to `Pause`.
- Repeat the same checks on the Soundboard page.

Known risks / limitations

- This was a CSS-only tune; I did not run a live browser smoke test in this environment.
- Git reported only line-ending warnings (`LF` to `CRLF`) during diff checks; no content errors were reported.
- This patch assumes the shared Pause/Resume markup and state classes from the current TEST build are already in place.

Target environment

- `OMJN/TEST`

Rollback note

- Restore the previous version of `app.css` from your last known-good TEST copy or Git history if you want to undo this patch.
