# PATCH_NOTES.md

## Summary
Focused TEST-build patch for three operator UX issues:
- Completed performers are now collapsed by default.
- House Band queue slots now preserve editable/custom titles, keep blank lineups blank, and no longer auto-seed suggested players at start.
- Soundboard search highlights now use a light readable foreground instead of browser-default dark text.

## File list
- `operator.js`
- `app.css`

## Install steps (exact paths)
Copy these files into your current TEST build root, replacing the existing files:
- `operator.js` → `TEST/operator.js`
- `app.css` → `TEST/app.css`

If you are testing locally first, replace the same two files in your local working directory root.

## Smoke test checklist
### Local test
- Add a few performers, mark at least one as `DONE` or `SKIPPED`, and confirm the **Completed** section is collapsed by default.
- Expand **Completed**, trigger a render change, and confirm it stays in the same open/closed state during that session.
- Add a **House Band** slot, edit its queue title from the inline editor, save, and confirm the custom title persists.
- Create a House Band slot with **Clear all** in the set builder, add it to the queue, then start it and confirm it does **not** auto-fill suggested players.
- Edit the same House Band slot later and confirm the queue row still shows the saved/custom title and lineup summary.
- Search on the **Soundboard** and confirm matching highlights are readable against the dark UI.

### Internet-side test (TEST dir)
- Open Operator + Viewer in separate tabs/windows.
- Confirm a blank-lineup House Band slot still starts as House Band rather than unexpectedly promoting a suggested lineup.
- Confirm Next / On Deck text still behaves normally around House Band entries.
- Confirm the Soundboard search highlight remains readable in the hosted TEST environment.

## Known risks / limitations
- This patch does not change the House Band modal layout; title customization is preserved through the existing queue inline editor rather than a new modal field.
- For House Band slots with operator notes, the queue row prioritizes the lineup summary for faster scanning.
- This patch assumes your current TEST baseline already includes the recent combined Pause/Resume and Export Show / Import Show fixes.
