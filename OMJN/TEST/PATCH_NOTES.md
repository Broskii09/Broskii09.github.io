# Summary
- Cleans up the TEST-only Operator UX for short desktop viewports by keeping the page horizontally contained while validating reachability across `1920x1080`, `1536x322`, `1536x500`, `1440x600`, and `1280x720`.
- Makes `Insert Special` explicitly report open/closed state, and confirms the same button toggles its own popover closed while a different row button switches the active popover cleanly.
- Makes the queue delete/undo notice much easier to spot by keeping it pinned near the top of the Operator queue area and nudging it into view after delete actions.
- Preserves queue model behavior, timer/overtime, All Star Jam, Last Call scheduling/actions, refresh prompt behavior, House Band, viewer sync, and all root/live files.

# File list
- OMJN/TEST/operator.js
- OMJN/TEST/app.css
- OMJN/TEST/tests/omjn-queue-state.spec.js
- OMJN/TEST/tests/omjn-smoke.spec.js
- OMJN/TEST/PATCH_NOTES.md

# Install steps (exact paths)
1. Copy `operator.js` to `OMJN/TEST/operator.js`.
2. Copy `app.css` to `OMJN/TEST/app.css`.
3. Copy `tests/omjn-queue-state.spec.js` to `OMJN/TEST/tests/omjn-queue-state.spec.js`.
4. Copy `tests/omjn-smoke.spec.js` to `OMJN/TEST/tests/omjn-smoke.spec.js`.
5. Keep `PATCH_NOTES.md` with the patch archive for reference.

# Smoke test checklist
- From `OMJN/TEST`, run `node --check operator.js`.
- From `OMJN/TEST`, run `node --check tests\omjn-queue-state.spec.js`.
- From `OMJN/TEST`, run `node --check tests\omjn-smoke.spec.js`.
- From `OMJN/TEST`, run `npm.cmd run test:queue-state`.
- From `OMJN/TEST`, run `npm.cmd run test:special-slots`.
- From `OMJN/TEST`, run `npm.cmd run test:smoke:all`.
- In Operator, confirm `Insert Special` closes on a second click of the same button and switches cleanly when clicking a different row’s button.
- In a short desktop viewport, delete a filled row and a blank row and confirm the `Deleted. Undo last action?` notice stays visible near the top of the queue area.

# Known risks/limitations
- The short-height desktop layout intentionally remains a vertically scrollable desktop page rather than introducing a new condensed desktop-only shell.
- The undo notice now scrolls itself into view after deletes; that is intentional for visibility, but it can produce a small upward page adjustment if the operator was working deep in the queue.
- Refresh and Last Call prompts now yield to modal overlays so modal actions stay clickable; this is a stacking fix only, not a workflow change.

# Target environment
- TEST directory only: `OMJN/TEST`.
- Local working copy only.
- Not live/root.

# Rollback note
- Restore the previous versions of the files listed above. If rolling back manually, also restore the prior `PATCH_NOTES.md` from source control or the previous patch archive.
