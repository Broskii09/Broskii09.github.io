# PATCH_NOTES.md

## Summary
Adds two Operator-side time features:
- **Approx showtime (ETA)** displayed on the right side of each queued performer’s status bar (`qBar`) as `h:mm AM/PM (≈)`.
- **Current time** shown on the far-right of the Live Control KPI row.

ETA rules (per your spec):
- Only shown for **non-ad queued performers**.
- **Ads count as 0** in the ETA calculation (ignored).
- When the current performer is in **overtime**, ETAs **do not shift earlier** (remaining time clamps at 0).

## Files changed
- `operator.html`
- `operator.js`
- `app.css`

## Install steps
1) Copy these files into your GitHub Pages **TEST** directory (overwrite):
   - `operator.html`
   - `operator.js`
   - `app.css`
2) Hard refresh:
   - Chrome/Edge: `Ctrl+F5`
   - Safari: `Cmd+Shift+R`

After validating in `/OMJN/TEST/`, copy the same files into `/OMJN/` (live).

## Smoke test checklist

### Local test
- Open Operator, add several queued performers with different minute values.
- Start the show (LIVE).
- Confirm each **queued performer** row shows a time label like `8:42 PM (≈)` on the right of the `qBar`.
- Add an **ad** between performers and confirm it does **not** change the ETAs.
- Let the current performer run into overtime and confirm future ETAs do **not** jump earlier.
- Confirm the KPI row shows **Now** time on the far right and updates over time.

### Internet-side test (TEST dir)
- Repeat the checks in `.../OMJN/TEST/`.
- Verify TEST changes do not affect the live `.../OMJN/` page.

## Known limitations / notes
- ETAs are approximate and assume each queued slot runs its configured minutes (except ads = 0).
- If the Operator page is left open in a background tab, some browsers may throttle timers; the “Now” clock and ETAs may update less frequently until the tab is focused again.
