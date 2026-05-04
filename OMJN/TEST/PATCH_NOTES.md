# Summary
- Redesigns TEST queue rows around a compact drag-left / content / delete-right / move-right shell, with full-height drag handles, right-side delete `X`, slim vertical arrow controls, and smaller blank-row actions.
- Replaces the old row clutter with an `Insert Special` popover on filled/special rows, keeps blank-slot special insertion compact, limits `Go Live` to the first three non-blank queue rows, removes No-Show from the visible row UI, and adds a lightweight delete undo notice.
- Keeps inline edit in-row with Save/Cancel in the top-right delete column, preserves outside-click autosave and Esc/Enter behavior, and keeps blank-slot fill/delete-all behavior intact.
- Adds/updates focused Playwright coverage for drag handles, delete confirmations, undo notice, Go Live visibility, special popover behavior, ad-slot gating, inline edit controls, deleted-history behavior, and viewport sanity across `1440`, `1280`, `1024`, `768`, `430`, and `390`.

# File list
- OMJN/TEST/operator.html
- OMJN/TEST/operator.js
- OMJN/TEST/app.css
- OMJN/TEST/tests/omjn-test-helpers.js
- OMJN/TEST/tests/omjn-queue-state.spec.js
- OMJN/TEST/tests/omjn-special-slots.spec.js
- OMJN/TEST/tests/omjn-media-and-houseband.spec.js
- OMJN/TEST/tests/omjn-smoke.spec.js
- OMJN/TEST/PATCH_NOTES.md

# Install steps (exact paths)
1. Copy `operator.html` to `OMJN/TEST/operator.html`.
2. Copy `operator.js` to `OMJN/TEST/operator.js`.
3. Copy `app.css` to `OMJN/TEST/app.css`.
4. Copy `tests/omjn-test-helpers.js` to `OMJN/TEST/tests/omjn-test-helpers.js`.
5. Copy `tests/omjn-queue-state.spec.js` to `OMJN/TEST/tests/omjn-queue-state.spec.js`.
6. Copy `tests/omjn-special-slots.spec.js` to `OMJN/TEST/tests/omjn-special-slots.spec.js`.
7. Copy `tests/omjn-media-and-houseband.spec.js` to `OMJN/TEST/tests/omjn-media-and-houseband.spec.js`.
8. Copy `tests/omjn-smoke.spec.js` to `OMJN/TEST/tests/omjn-smoke.spec.js`.
9. Keep `PATCH_NOTES.md` with the patch archive for reference.

# Smoke test checklist
- From `OMJN/TEST`, run `npm.cmd run test:queue-state`.
- From `OMJN/TEST`, run `npm.cmd run test:special-slots`.
- From `OMJN/TEST`, run `npm.cmd run test:smoke:all`.
- In Operator, confirm filled and special rows show a left drag handle, right delete `X`, and a vertical up/down column.
- In Operator, confirm blank rows stay compact, still allow `Add Performer`, still allow single-blank delete with confirmation, and `Delete All Blank Slots` still re-adds five fresh blanks at the bottom.
- In Operator, confirm `Insert Special` on filled/special rows requires an explicit `Before` or `After` choice, and ad options stay hidden until `Enable Sponsor/Ad Slots` is turned on in Advanced settings.
- In Operator, confirm deleting a row shows the temporary undo notice near the top of the queue card and that the `Undo` button restores the deleted row.

# Known risks/limitations
- This pass intentionally leaves older queue renderer/code paths in place but unused, so the active behavior lives in the new V2 queue row renderers while legacy helpers remain for safety.
- The compact blank-row special menu is validated in Playwright, but its small hit area is still denser than the filled-row `Insert Special` button and may deserve another polish pass if operators want a larger target.
- The delete undo banner only restores the most recent history-backed action through the existing undo stack; it is intentionally lightweight and not a multi-step toast history system.

# Target environment
- TEST directory only: `OMJN/TEST`.
- Local working copy only.
- Not live/root.

# Rollback note
- Restore the previous versions of the files listed above. If rolling back manually, also restore the prior `PATCH_NOTES.md` from source control or the previous patch archive.
