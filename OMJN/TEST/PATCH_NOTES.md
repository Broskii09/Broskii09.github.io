# PATCH_NOTES

## Summary
Fixes a load-breaking error introduced in the prior patch where `ensureFormA11y()` was accidentally declared inside `applyThemeToDocument()`, causing `shared.js` to throw on load and preventing `OMJN` from being defined.

## Files
- `shared.js`

## Install steps
1. Replace `shared.js` in your OMJN directory with the one from this zip.

## Smoke test checklist
- Load `operator.html`:
  - No console errors (`OMJN is not defined` / `ensureFormA11y is not defined` should be gone).
  - Operator UI renders normally.
- Load `viewer.html`:
  - No console errors.
- Chrome DevTools → Issues:
  - “Interactive element inside <summary>” should remain fixed if you installed the prior UI patch too.

## Known risks / limitations
- This patch only fixes the load-breaking scoping error in `shared.js`. It does not change any behaviors beyond restoring normal execution.
