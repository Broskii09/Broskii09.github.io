# Summary
- Refines TEST queue behavior so moving a performer into a blank numbered slot swaps directly with that blank instead of shifting the whole numbered paper queue.
- Adds manual blank-slot controls for moving and deleting blank rows.
- Adds confirmation-gated `Delete Blank` behavior that removes the blank row, renumbers later active paper slots to close that gap, and re-anchors following special slots from visible queue order.
- Preserves existing special-slot, ad, intermission, House Band, viewer sync, and smoke behaviors.

# File list
- OMJN/TEST/operator.js
- OMJN/TEST/tests/omjn-queue-state.spec.js
- OMJN/TEST/tests/omjn-special-slots.spec.js
- OMJN/TEST/tests/omjn-test-helpers.js
- OMJN/TEST/PATCH_NOTES.md

# Install steps (exact paths)
1. Copy `operator.js` to `OMJN/TEST/operator.js`.
2. Copy `tests/omjn-queue-state.spec.js` to `OMJN/TEST/tests/omjn-queue-state.spec.js`.
3. Copy `tests/omjn-special-slots.spec.js` to `OMJN/TEST/tests/omjn-special-slots.spec.js`.
4. Copy `tests/omjn-test-helpers.js` to `OMJN/TEST/tests/omjn-test-helpers.js`.
5. Keep `PATCH_NOTES.md` with the patch archive for reference.

# Smoke test checklist
- From `OMJN/TEST`, run `npm.cmd run test:queue-state`.
- From `OMJN/TEST`, run `npm.cmd run test:special-slots`.
- From `OMJN/TEST`, run `npm.cmd run test:smoke:all`.
- Confirm moving a performer into an earlier blank fills that blank and moves the blank to the old performer position.
- Confirm blank rows now show `Delete Blank`, prompt for confirmation, and renumber later active paper slots right away.
- Confirm a special visually following a deleted blank stays in the same visible queue spot after re-anchor.
- Confirm special-slot drag/drop and arrow/button moves still work.

# Known risks/limitations
- Explicit blank deletion now allows the active paper-slot count to shrink below the initial default until the operator adds more open slots again.
- Renumbering after blank deletion respects preserved retired/completed slot numbers, so historical numbering can still create intentional gaps outside the active blank being removed.
- Blank rows are movable through the existing up/down controls; this patch does not redesign performer drag/drop to cover numbered paper rows.

# Target environment
- TEST directory only: `OMJN/TEST`.
- Local working copy only.
- Not live/root.

# Rollback note
- Restore the previous versions of the files listed above. If rolling back manually, also restore the prior `PATCH_NOTES.md` from source control or the previous patch archive.
