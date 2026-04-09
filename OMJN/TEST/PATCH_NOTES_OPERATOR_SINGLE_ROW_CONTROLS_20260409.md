# PATCH NOTES

## Summary

Follow-up TEST Operator control-row fix to keep the Live Control buttons and timer adjustment buttons on a single row instead of wrapping.

This pass:

- changed `liveActionRow` to a fixed 5-column grid
- changed `timerControlsRow` to a fixed 7-column grid
- reduced gaps slightly so the rows fit better
- added responsive `clamp()` font sizing so labels shrink before wrapping
- kept button labels on one line with `white-space: nowrap`

## File list

- `TEST/app.css`

## Install steps (exact paths)

Copy this file into:

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open TEST Operator at 1920x1080 and confirm `liveActionRow` stays on one row.
- Confirm `timerControlsRow` also stays on one row.
- Resize the window narrower and verify the buttons shrink rather than dropping to a second line.
- Check that labels such as `End → Splash` and `Reset Time` still remain readable.

## Known risks/limitations

- This keeps the controls on one row by allowing text/buttons to compress more aggressively.
- On very narrow screens the controls may feel dense, but they should avoid wrapping.
- I did not run a browser smoke test here.

## Target environment

- `OMJN/TEST` only

## Rollback note

If needed, restore the previous `TEST/app.css` file or revert this single-row control fix.
