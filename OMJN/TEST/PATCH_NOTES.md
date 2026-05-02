# Summary
- Diagnoses and hardens the shared TEST refresh prompt path in `shared.js`, including manual force-check/reset controls, same-environment cross-tab refresh prompting, and safer diagnostic state exposure.
- Adds Operator and Soundboard refresh controls for `Force Check for Update`, `Reset Refresh Dismissal`, and `Prompt Open Tabs to Refresh`, without changing Prompt 1 timer/overtime, Prompt 2/2B queue/edit/blank-slot behavior, Prompt 3 All Star Jam behavior, or Prompt 4 Last Call behavior.
- Fixes prompt coexistence so the shared refresh prompt stacks cleanly above the Operator-only Last Call prompt instead of hiding behind it.
- Adds focused Playwright coverage for update prompting, dismissal reset, cross-tab prompt requests, and prompt stacking, and includes that spec in `test:smoke:all`.

# File list
- OMJN/TEST/shared.js
- OMJN/TEST/operator.html
- OMJN/TEST/operator.js
- OMJN/TEST/soundboard.html
- OMJN/TEST/soundboard.js
- OMJN/TEST/app.css
- OMJN/TEST/package.json
- OMJN/TEST/tests/omjn-test-helpers.js
- OMJN/TEST/tests/omjn-refresh-prompt.spec.js
- OMJN/TEST/PATCH_NOTES.md

# Install steps (exact paths)
1. Copy `shared.js` to `OMJN/TEST/shared.js`.
2. Copy `operator.html` to `OMJN/TEST/operator.html`.
3. Copy `operator.js` to `OMJN/TEST/operator.js`.
4. Copy `soundboard.html` to `OMJN/TEST/soundboard.html`.
5. Copy `soundboard.js` to `OMJN/TEST/soundboard.js`.
6. Copy `app.css` to `OMJN/TEST/app.css`.
7. Copy `package.json` to `OMJN/TEST/package.json`.
8. Copy `tests/omjn-test-helpers.js` to `OMJN/TEST/tests/omjn-test-helpers.js`.
9. Copy `tests/omjn-refresh-prompt.spec.js` to `OMJN/TEST/tests/omjn-refresh-prompt.spec.js`.
10. Keep `PATCH_NOTES.md` with the patch archive for reference.

# Smoke test checklist
- From `OMJN/TEST`, run `npm.cmd run test:refresh-prompt`.
- From `OMJN/TEST`, run `npm.cmd run test:queue-state`.
- From `OMJN/TEST`, run `npm.cmd run test:special-slots`.
- From `OMJN/TEST`, run `npm.cmd run test:media-houseband`.
- From `OMJN/TEST`, run `npm.cmd run test:smoke:all`.
- On Operator, open `Settings -> Advanced -> Site Update Prompt` and confirm `Force Check for Update`, `Reset Refresh Dismissal`, and `Prompt Open Tabs to Refresh` are present.
- On Soundboard, open `Settings -> Site update prompt` and confirm the same three controls are present.
- Open Operator + Viewer + Soundboard in the same TEST environment/browser profile, click `Prompt Open Tabs to Refresh` on Operator, and confirm all three tabs show the shared refresh prompt without auto-reloading.

# Known risks/limitations
- The refresh prompt still depends on `site-version.json` changing between deployments. This patch adds better diagnostics and controls, but it does not force deployments to use the version bump helper.
- `Prompt Open Tabs to Refresh` only reaches currently open OMJN tabs in the same origin/environment/browser profile. It does not and cannot force remote devices to refresh from static GitHub Pages hosting.
- `file://` loads still cannot poll `site-version.json`; use a local server or hosted TEST URL for real refresh checks.

# Target environment
- TEST directory only: `OMJN/TEST`.
- Local working copy only.
- Not live/root.

# Rollback note
- Restore the previous versions of the files listed above. If rolling back manually, also restore the prior `PATCH_NOTES.md` from source control or the previous patch archive.
