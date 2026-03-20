# PATCH_NOTES.md

## Summary
Redesigned the Operator **Crowd Prompts** experience so the main card is now a clean run console and the editor is a dedicated modal.

## File list
- `operator.html`
- `operator.js`
- `app.css`
- `PATCH_NOTES.md`
- `REGRESSION_LEDGER.md`

## Install steps (exact paths)
Copy these files into the same locations in your project root or `TEST` directory:
- `operator.html`
- `operator.js`
- `app.css`

## What changed
- Rebuilt the main **Crowd Prompts** card into a compact live-use console.
- Added a direct **Preset** selector to the main card.
- Promoted **Show Prompt / Hide Prompt** into the primary action.
- Added a dedicated **Crowd Prompt Editor** modal.
- Added a preset sidebar inside the modal for faster editing and switching.
- Kept the live preview, but split it into:
  - compact preview on the main card
  - full preview inside the modal
- Simplified the Crowd section inside **Settings** so it only acts as a shortcut into the editor.

## Smoke test checklist
### Local test
- Open Operator and confirm the Crowd Prompts card shows:
  - Previous / Show-Hide / Next controls
  - Preset dropdown
  - Edit Prompts button
  - compact preview
- Click **Edit Prompts** and confirm the modal opens.
- In the modal:
  - switch presets from the left list
  - edit title / lines / footer / auto-hide
  - confirm preview updates while typing
  - save changes and confirm they persist
- On the main card:
  - switch presets from the dropdown
  - step with prev / next
  - toggle Show Prompt / Hide Prompt
- Confirm Escape closes the Crowd Prompt modal.

### Internet-side test (`TEST` dir)
- Confirm the modal overlay opens and closes cleanly over the deployed Operator page.
- Confirm no layout collisions with the Settings modal.
- Confirm Crowd Prompt actions still update the Viewer immediately.

## Known risks / limitations
- This patch intentionally redesigns the Crowd Prompt operation/editor workflow, so it changes muscle memory.
- I did not remove every legacy JS reference tied to old settings-only controls, but the remaining references are guarded and should not execute when the elements are absent.
