# PATCH_NOTES

## Summary
- Darkened the Operator page background and increased UI contrast (cards, buttons, form fields) without changing Viewer/Soundboard styling.

## Files
- app.css

## Install steps (exact paths)
1) In your repo, replace:
   - /OMJN/TEST/app.css
2) After verifying, replace:
   - /OMJN/app.css

## Smoke test checklist
Local (file://) or GitHub Pages:
- Open /operator.html and confirm:
  - Background is darker blue.
  - Cards/panels have higher contrast vs background.
  - Buttons and inputs remain readable.
- Open /viewer.html and confirm Viewer visuals are unchanged.

## Known risks / limitations
- If you later want the Viewer background to also be darker, we should move the global html/body gradient to Viewer-only and keep Operator’s override as-is.
