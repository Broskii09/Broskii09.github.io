# Summary
- Splits the OMJN TEST Playwright coverage into focused smoke, special-slot, and queue-state spec files.
- Moves shared Playwright helper functions into `tests/omjn-test-helpers.js`.
- Keeps `npm.cmd run test:smoke` focused on the core smoke checks.
- Adds beginner-friendly scripts for special-slot, queue-state, and combined smoke coverage.

# File list
- OMJN/TEST/package.json
- OMJN/TEST/tests/omjn-smoke.spec.js
- OMJN/TEST/tests/omjn-special-slots.spec.js
- OMJN/TEST/tests/omjn-queue-state.spec.js
- OMJN/TEST/tests/omjn-test-helpers.js
- OMJN/TEST/PATCH_NOTES.md

# Install steps (exact paths)
1. Copy `package.json` to `OMJN/TEST/package.json`.
2. Copy `tests/omjn-smoke.spec.js` to `OMJN/TEST/tests/omjn-smoke.spec.js`.
3. Copy `tests/omjn-special-slots.spec.js` to `OMJN/TEST/tests/omjn-special-slots.spec.js`.
4. Copy `tests/omjn-queue-state.spec.js` to `OMJN/TEST/tests/omjn-queue-state.spec.js`.
5. Copy `tests/omjn-test-helpers.js` to `OMJN/TEST/tests/omjn-test-helpers.js`.
6. Keep `PATCH_NOTES.md` with the patch archive for reference.

# Smoke test checklist
- From `OMJN/TEST`, run `npm.cmd run test:smoke`.
- Run `npm.cmd run test:special-slots`.
- Run `npm.cmd run test:queue-state`.
- Optional combined check: `npm.cmd run test:smoke:all`.
- Confirm the combined coverage reports 11 passing tests.

# Known risks/limitations
- The ad smoke test checks CSS classes such as `isLive` and `isAd`, which are practical but still CSS-coupled.
- The graphic ad smoke test uses a deterministic `data:image/svg+xml` URL instead of exercising preset, upload, or hosted asset loading.
- Deeper video ad and house band flows are still outside this smoke split.

# Target environment
- TEST directory only.
- Not live/root.

# Rollback note
- Restore the previous versions of the files listed above and remove the added spec/helper files.
