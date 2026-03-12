# OMJN Patch Notes — Viewer Timer Toggle Button (Operator → Viewer)

## Summary
Adds a **Hide/Show Viewer Timer** button next to the Operator timer line. Clicking it hides/shows the Viewer’s big timer readout (and the progress bar, if enabled). The button label reflects the current state.

## What changed
- **Operator Live Control**: added a small toggle button beside the `Elapsed / Remaining` readout.
- **State**: introduced `viewerPrefs.showTimer` (defaults to `true`).
- **Viewer**: respects `viewerPrefs.showTimer` by hiding the timer text + progress bar when off.
- **CSS**: minor layout helper for the new timer row + Viewer `timerHidden` style.

## Files changed
- `operator.html`
- `operator.js`
- `viewer.js`
- `shared.js`
- `app.css`

## Install steps (exact paths)
Copy these files into your **TEST** directory (and later into live when ready):
- `Broskii09.github.io/OMJN/TEST/operator.html`
- `Broskii09.github.io/OMJN/TEST/operator.js`
- `Broskii09.github.io/OMJN/TEST/viewer.js`
- `Broskii09.github.io/OMJN/TEST/shared.js`
- `Broskii09.github.io/OMJN/TEST/app.css`

(Repeat for `Broskii09.github.io/OMJN/` when promoting to live.)

## Smoke test checklist
1. Open `TEST/operator.html`.
2. In **Live Control**, confirm a button appears next to the `0:00 / 0:00` timer line: **Hide Viewer Timer**.
3. Click it:
   - Button changes to **Show Viewer Timer**
   - Open `TEST/viewer.html` and confirm the big timer number is hidden.
   - If Progress Bar is enabled in Settings → Timer, confirm it is also hidden when timer is hidden.
4. Click again and confirm the timer returns.
5. Refresh Operator + Viewer and confirm the setting persists (and stays in sync).

## Known risks / notes
- If you don’t see the new button after copying files, do a hard refresh (Ctrl+F5) to bypass cache.
- Viewer timer hiding does **not** affect cue chips (Overtime/Warn/Final); it only hides the timer digits + progress bar.
