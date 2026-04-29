# Summary
- Tightens the TEST-only Operator queue UX by shrinking blank-slot controls into a denser layout, adding `Delete All Blank Slots` to the queue header, and keeping the numbered blank-slot model from the latest TEST queue pass.
- Replaces the old under-row performer editor with an inline row-transform edit mode that opens only from explicit controls, auto-saves on outside click, and saves/closes on `Esc` or `Enter` outside the notes textarea.
- Adds focused Playwright coverage for bulk blank deletion, inline edit entry rules, outside-click save, and `Esc` save/close while preserving the current green TEST smoke suite.

# File list
- OMJN/TEST/app.css
- OMJN/TEST/operator.html
- OMJN/TEST/operator.js
- OMJN/TEST/tests/omjn-queue-state.spec.js
- OMJN/TEST/PATCH_NOTES.md

# Install steps (exact paths)
1. Copy `app.css` to `OMJN/TEST/app.css`.
2. Copy `operator.html` to `OMJN/TEST/operator.html`.
3. Copy `operator.js` to `OMJN/TEST/operator.js`.
4. Copy `tests/omjn-queue-state.spec.js` to `OMJN/TEST/tests/omjn-queue-state.spec.js`.
5. Keep `PATCH_NOTES.md` with the patch archive for reference.

# Smoke test checklist
- From `OMJN/TEST`, run `npm.cmd run test:queue-state`.
- From `OMJN/TEST`, run `npm.cmd run test:smoke:all`.
- Confirm blank-slot rows are visibly shorter and the main four blank actions stay visible in a compact grid.
- Confirm `Delete All Blank Slots` prompts first, removes all current blanks, preserves special visual order, and adds 5 fresh blanks at the bottom.
- Confirm clicking a row or performer name does not open edit mode.
- Confirm clicking `Edit` transforms the row inline, hides normal row actions, and shows `Saved` briefly after auto-save or `Esc` save.

# Known risks/limitations
- The blank-slot action grid is forced to four columns on small screens when space permits, so labels can feel tighter on the narrowest phones.
- Outside-click save depends on the browser document click cycle; custom overlays added later should continue to respect the current inline-edit containment checks.
- This pass intentionally leaves timer/overtime, last-call, refresh-notification, and All Star Jam behavior untouched.

# Target environment
- TEST directory only: `OMJN/TEST`.
- Local working copy only.
- Not live/root.

# Rollback note
- Restore the previous versions of the files listed above. If rolling back manually, also restore the prior `PATCH_NOTES.md` from source control or the previous patch archive.
