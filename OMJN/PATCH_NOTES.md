# PATCH_NOTES

## Summary
Added a new **Jamaoke** slot type to the current uploaded baseline.

This implementation keeps **planning minutes** for queue ETA / estimated end calculations, while treating Jamaoke as **untimed on the Viewer** so the audience screen does not show a countdown or progress bar during those live slots.

## Files changed
- `shared.js`
- `operator.js`
- `viewer.js`
- `app.css`
- `REGRESSION_LEDGER.md`

## Install steps
Replace these files in your current working build:
- `shared.js`
- `operator.js`
- `viewer.js`
- `app.css`
- `REGRESSION_LEDGER.md`

## Behavior added
- New slot type: `Jamaoke`
- Default planning duration: **10 minutes**
- Enabled by default in slot-type settings and quick-add selection
- Distinct queue color / icon
- Viewer live card shows **JAMAOKE** as the label/chip type
- Viewer **hides timer + progress bar** automatically for Jamaoke live slots
- Viewer suppresses warn/final/overtime chips and timer-driven card cues during Jamaoke
- Queue ETA / estimated end still use Jamaoke planning minutes

## Smoke test checklist
### Local test
- Open Operator and confirm **Jamaoke** appears in the add-slot dropdown.
- Confirm **Jamaoke** appears in the slot-types editor.
- Add a Jamaoke slot and confirm it lands in the queue with its own label/color.
- Start a Jamaoke slot live and confirm the Viewer shows the live card but **no timer/progress bar**.
- Confirm the Viewer still shows the performer name and **JAMAOKE** labeling.
- End Jamaoke and confirm the next slot flow still works normally.
- Confirm queue ETA / estimated end still include Jamaoke in schedule math.

### Internet-side test (TEST dir)
- Repeat the same checks on the `/TEST` deployment.
- Verify Operator and Viewer stay in sync without refresh.

## Known risks / limitations
- Jamaoke is implemented as **Viewer-untimed** rather than fully timerless internally. The Operator still retains planning duration under the hood so ETA math stays useful.
- Pause/Resume remains available for Jamaoke because the internal planning timer still exists. That preserves existing timing math and minimizes regression risk.
