# PATCH_NOTES.md

## Summary
This patch restores the refined live-control UI branch that had regressed in the current TEST build.

Primary fixes:
- Restored the **single combined Pause/Resume** button in the Live Control row.
- Restored the **animated cyan/teal chasing border** treatment and **Paused** badge.
- Removed the split legacy `Pause` / `Resume` buttons from the Operator HTML so it matches the current JS branch again.
- Normalized the show-state download/upload labels from generic JSON wording to **Backup Show** / **Restore Show**.
- Unified both header-level and live-row backup/restore controls onto the same show-state export/import path.

Important note:
- I could confirm the refined Pause/Resume branch from the accessible recent project artifacts.
- I could **not** recover a definitive historical final wording for the old “Export/Import JSON” rename from the accessible artifacts, so this patch normalizes that copy to **Backup Show** / **Restore Show** instead of guessing an unsupported exact phrase.

## File list
- `operator.html`
- `operator.js`
- `app.css`
- `PATCH_NOTES.md`

## Install steps (exact paths)
Copy these files into your TEST build, replacing the existing files at:
- `TEST/operator.html`
- `TEST/operator.js`
- `TEST/app.css`

If you are testing locally first, replace the same files in your local OMJN working directory.

## Smoke test checklist
### Local test
- Open `operator.html` and confirm the Live Control row now shows a **single Pause/Resume** button instead of separate Pause and Resume buttons.
- Confirm the Pause/Resume button shows an animated cyan/teal border while visible.
- Start a timed live slot and verify:
  - button label starts as **Pause**
  - clicking it changes phase to paused
  - button label changes to **Resume**
  - **Paused** badge appears
- Resume the slot and verify the badge hides again.
- Confirm the button remains visible but disabled when there is no timed live slot.
- Confirm the header buttons now read **Backup Show** and **Restore Show**.
- Confirm the live-row backup buttons also read **Backup Show** and **Restore Show**.
- Use both header and live-row controls to export and import a JSON state file successfully.

### Internet-side test (TEST dir)
- Upload the three files into your GitHub-hosted `TEST` directory.
- Open Operator + Viewer in separate tabs.
- Start a performer, pause, and resume from Operator.
- Confirm live state changes propagate normally to Viewer and no console syntax errors appear.
- Confirm the backup/restore controls still work in the hosted environment.

## Known risks / limitations
- The exact historical wording for the renamed JSON buttons was not recoverable from the accessible builds/files. This patch uses a clearer normalized pair: **Backup Show** / **Restore Show**.
- This patch restores the refined live-control UI and the state-control wording, but it does not attempt broader cleanup beyond those targeted regressions.
- Visual motion can vary slightly by browser because the border effect is CSS-driven.
