# OMJN Patch Notes — Video Ads Hotfix (2026-02-14)

## Summary
Fixes a JavaScript syntax error in `operator.js` that prevented the Operator app from initializing (which also caused the Crowd Prompt Viewer Preview panel to appear missing/non-functional).

## Files
- `operator.js`

## Install
Replace your existing file with the one in this zip:
- `./operator.js`

## Smoke test checklist
1. Open `operator.html` and confirm **no console errors**.
2. Confirm **Crowd Prompts** preview renders again (main Operator screen).
3. Open Ad modal and change **Source** (Upload/URL) — confirm no errors.
4. Add a Video Ad and Go Live — confirm Viewer plays full-screen.

## Notes / limitations
- The Crowd Preview issue was a side effect of the Operator script failing to load; fixing the syntax error restores it.
