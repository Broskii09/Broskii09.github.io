# Summary
- Updates the TEST Viewer House Band display to default to a full active roster by category.
- Shows the roster on splash and active intermission only.
- Hides the roster during active House Band slots, where the manually selected set remains the main display.
- Adds compact roster paging/cycling so tight screens and long categories eventually show every active name.
- Keeps House Band category rotation tied to the real category queues and moves selected set members to the bottom only when that House Band slot ends.

# File list
- OMJN/TEST/shared.js
- OMJN/TEST/operator.js
- OMJN/TEST/viewer.js
- OMJN/TEST/app.css
- OMJN/TEST/tests/omjn-media-and-houseband.spec.js
- OMJN/TEST/tests/omjn-test-helpers.js
- OMJN/TEST/PATCH_NOTES.md

# Install steps (exact paths)
1. Copy `shared.js` to `OMJN/TEST/shared.js`.
2. Copy `operator.js` to `OMJN/TEST/operator.js`.
3. Copy `viewer.js` to `OMJN/TEST/viewer.js`.
4. Copy `app.css` to `OMJN/TEST/app.css`.
5. Copy `tests/omjn-media-and-houseband.spec.js` to `OMJN/TEST/tests/omjn-media-and-houseband.spec.js`.
6. Copy `tests/omjn-test-helpers.js` to `OMJN/TEST/tests/omjn-test-helpers.js`.
7. Keep `PATCH_NOTES.md` with the patch archive for reference.

# Smoke test checklist
- From `OMJN/TEST`, run `npm.cmd run test:media-houseband`.
- From `OMJN/TEST`, run `npm.cmd run test:smoke:all`.
- Confirm the Viewer splash shows grouped House Band categories when active House Band members exist.
- Confirm active intermission shows the grouped House Band roster in the compact footer.
- Confirm active House Band slots do not show the full roster footer.
- Confirm the House Band tab category order changes only after ending a House Band slot with selected players.

# Known risks/limitations
- The new display mode shows active House Band members. Inactive members remain available in the Operator roster but are hidden from the Viewer roster.
- The existing `HB Footer` toggle still controls this secondary Viewer roster visibility; the label was preserved to avoid a broader Operator redesign.
- Roster cycling uses viewport-width buckets and a fixed timer rather than measuring every rendered word, keeping the change small and predictable.

# Target environment
- TEST directory only: `OMJN/TEST`.
- Local working copy only.
- Not live/root.

# Rollback note
- Restore the previous versions of the files listed above. If rolling back manually, also restore the prior `PATCH_NOTES.md` from source control or the previous patch archive.
