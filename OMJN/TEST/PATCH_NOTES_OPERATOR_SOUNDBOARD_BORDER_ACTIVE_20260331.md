Summary

- Applied an Example 3-style animated gradient border to the shared Pause/Resume control on both Operator and Soundboard.
- Tuned the border animation to run faster than the article example while keeping the article's bright gradient color language.
- Changed the Soundboard active button treatment to an Example 5-style animated SVG stroke on currently playing pads.
- Removed the default "first pad is always selected" look on initial Soundboard load so active state is clearer.

File list

- `app.css`
- `operator.js`
- `soundboard.js`
- `PATCH_NOTES_OPERATOR_SOUNDBOARD_BORDER_ACTIVE_20260331.md`

Install steps (exact paths)

1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Copy `operator.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
3. Copy `soundboard.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\soundboard.js`
4. Keep this patch note file with the TEST artifact for reference.

Smoke test checklist

- In Operator, start a timed live slot and confirm the shared Pause/Resume button gets the animated Example 3 border.
- In Operator, pause the timed slot and confirm the button still animates, flips to `Resume`, and shows the paused badge.
- In Operator, return to Splash and confirm the Pause/Resume border effect turns off when the button is disabled.
- In Soundboard, confirm the Pause/Resume button matches the same animated border treatment and state behavior.
- Reload Soundboard and confirm the first pad is no longer pre-highlighted on initial load.
- Play a sound and confirm the active pad shows the animated Example 5-style SVG stroke.
- Stop the sound and confirm the active pad animation clears.
- Search for a sound and confirm keyboard selection still works with Arrow keys and Enter.

Known risks / limitations

- This was validated with static review and `node --check`; I did not run a live browser smoke test in this environment.
- The Example 5 active-pad effect is applied to currently playing pads. Keyboard-selected pads still have a lighter non-animated selection state.
- Git reported only line-ending warnings (`LF` to `CRLF`) during diff checks; no functional content errors were reported.

Target environment

- `OMJN/TEST`

Rollback note

- Restore the previous versions of `app.css`, `operator.js`, and `soundboard.js` from your last known-good TEST copy or Git history if you want to undo this patch.
