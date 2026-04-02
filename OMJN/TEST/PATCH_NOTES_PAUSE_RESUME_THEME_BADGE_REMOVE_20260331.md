Summary

- Removed the `Paused` badge from the shared Pause/Resume control on both Operator and Soundboard.
- Retuned the Resume-state glow to OMJN-style blues and golds instead of the earlier rainbow palette.
- Set the `Resume` button fill to an opaque navy by default, with a 50% transparent hover state.

File list

- `app.css`
- `operator.html`
- `soundboard.html`
- `PATCH_NOTES_PAUSE_RESUME_THEME_BADGE_REMOVE_20260331.md`

Install steps (exact paths)

1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Copy `operator.html` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
3. Copy `soundboard.html` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\soundboard.html`
4. Keep this patch note file with the TEST artifact for reference.

Smoke test checklist

- In Operator, start a timed slot and confirm the normal `Pause` button looks like the surrounding buttons.
- Pause the timed slot and confirm the `Resume` button shows only the blue/gold glowing border effect.
- Hover the `Resume` button and confirm the fill drops to 50% transparency.
- Confirm there is no `Paused` badge on either Operator or Soundboard.
- Repeat the same paused-state check on Soundboard.

Known risks / limitations

- This was verified with static file checks only; I did not run a live browser smoke test in this environment.
- Git reported only line-ending warnings (`LF` to `CRLF`) during diff checks; no content errors were reported.
- The shared JS still contains harmless null-safe references to the old badge elements.

Target environment

- `OMJN/TEST`

Rollback note

- Restore the previous versions of `app.css`, `operator.html`, and `soundboard.html` from your last known-good TEST copy or Git history if you want to undo this patch.
