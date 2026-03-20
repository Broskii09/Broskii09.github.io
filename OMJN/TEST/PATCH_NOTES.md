# PATCH_NOTES.md

## Summary
Restored the missing Operator-side Viewer timer toggle and wired it to hide/show both the Viewer timer and the Viewer progress bar. Also hardened the Viewer media fallback so performer slots with blank/legacy media layouts default to QR presentation instead of unexpectedly collapsing the media pane when a new act goes live.

The recurring `A listener indicated an asynchronous response...` console error is not caused by the OMJN app code. It is characteristic of a browser extension/service-worker message listener, not BroadcastChannel/localStorage sync inside this project.

## File list
- operator.html
- operator.js
- viewer.js
- shared.js
- app.css

## Install steps (exact paths)
Replace these files at your project root:
- `/operator.html`
- `/operator.js`
- `/viewer.js`
- `/shared.js`
- `/app.css`

## Smoke test checklist
- Operator shows a `Hide Viewer Timer` button in the timer controls row.
- Clicking it hides the Viewer timer immediately.
- Clicking it also hides the Viewer progress bar immediately.
- Clicking it again restores both.
- Advancing from one performer to the next no longer collapses the Viewer media pane for legacy/blank-layout performer slots.
- No syntax errors in `operator.js`, `viewer.js`, or `shared.js`.

## Known risks / limitations
- The async-response console error can still appear until the responsible browser extension is disabled.
- This patch is a targeted regression repair on the current uploaded baseline. It does not pull in unrelated older experimental branches.
