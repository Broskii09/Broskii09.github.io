# Summary
- Fixes the Open Slot action buttons by overriding the later general `.qActions` rules that were forcing a 3-column, no-wrap layout.
- Gives Open Slot actions a dedicated 2-column layout, wider action area, wrapped text, and taller stable buttons.
- Expands the Playwright smoke test to check both desktop and narrow viewport layouts for button overlap and text overflow.
- Bumps the TEST site version timestamp.

# File list
- OMJN/TEST/app.css
- OMJN/TEST/site-version.json
- OMJN/TEST/tests/omjn-smoke.spec.js
- OMJN/TEST/PATCH_NOTES.md

# Install steps (exact paths)
1. Copy `app.css` to `OMJN/TEST/app.css`.
2. Copy `site-version.json` to `OMJN/TEST/site-version.json`.
3. Copy `tests/omjn-smoke.spec.js` to `OMJN/TEST/tests/omjn-smoke.spec.js`.
4. Keep `PATCH_NOTES.md` with the patch archive for reference.

# Smoke test checklist
- Run `npm.cmd run test:e2e` from `OMJN/TEST`.
- Open `OMJN/TEST/operator.html`.
- Confirm Open Slot action buttons no longer overlap.
- Confirm Add Performer, Intermission After, Ad After, and House Band After are readable at your normal window size.

# Known risks/limitations
- Internal CSS/JS names still use `paperSlot*` identifiers because they are data/model names, not user-facing labels.
- This only adjusts TEST layout and smoke coverage.

# Target environment
- TEST directory / hosted TEST path only.
- Not live/root.

# Rollback note
- Restore the previous versions of the files listed above.
