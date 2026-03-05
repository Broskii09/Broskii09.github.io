# OMJN Patch Notes — Settings Fix + Slider Reliability

## Summary
This patch fixes the Operator crash that broke the Settings button (syntax error in `operator.js`) and makes the Viewer scaling sliders apply reliably.

## What changed
- **Fixed `operator.js` syntax/structure**: corrected a brace/nesting issue in the Settings → Viewer scale binding block that caused `Unexpected token 'function'` in the broken patch.
- **Viewer scale vars now apply more robustly**: `viewer.js` sets `--vScale`, `--nameScale`, and `--hbLineupScale` on both `:root` (documentElement) and the Viewer root container, so font-size changes reliably propagate even if Viewer styles are scoped.

## Files
- `operator.js`
- `viewer.js`
- `operator.html`
- `shared.js`
- `app.css`

## Install (exact paths)
1. Copy these files into:
   - `Broskii09.github.io/OMJN/TEST/` (overwrite existing)
2. Hard refresh pages:
   - Windows/Chrome: `Ctrl + F5`
   - macOS/Safari: `Cmd + Shift + R`

## Smoke test checklist
- Operator loads with **no console errors**.
- Settings modal opens.
- Settings → Viewer:
  - Moving **Viewer font scale** changes Viewer immediately.
  - Moving **Performer name size** changes LIVE + Splash names immediately.
  - Moving **House Band text size** changes HB lineup text immediately.
- Viewer shows **Connected** on Operator.

## Known risks / limitations
- This patch cannot remove stale browser caches automatically. If you still see old behavior after replacing files, do a hard refresh.
