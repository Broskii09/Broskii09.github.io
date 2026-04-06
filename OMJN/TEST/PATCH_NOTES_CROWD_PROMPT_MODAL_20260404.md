## Summary

- Reworked the Operator Crowd Prompts editor from an inline panel into a dedicated modal.
- Cleaned up the main Crowd Prompts card so it focuses on quick show/hide controls, selected preset status, and Viewer preview.
- Improved modal behavior with overlay click close, Escape close, focus return, and Tab trapping.
- Added cleaner preset summary states and safer preset deletion behavior.

## File list

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Install steps

1. Copy `operator.html` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
2. Copy `operator.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
3. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open TEST Operator and confirm the Crowd Prompts card shows the selected preset summary plus Viewer preview.
- Click `Edit preset` from the main card and confirm the editor opens in a modal.
- Click `Open Crowd Prompt Editor` from Settings and confirm Settings closes and the same modal opens.
- Type into the modal and confirm the preview updates live without changing the saved preset until `Save Preset`.
- Press `Escape` in the modal and confirm it closes with unsaved-change protection.
- Use `Tab` and `Shift+Tab` in the modal and confirm focus stays inside the dialog.
- Try deleting the last remaining preset and confirm the delete button is disabled.
- Duplicate or add a preset and confirm the active preset/summary updates correctly.

## Known risks/limitations

- This pass was validated with static checks only; it was not browser-smoke-tested here.
- The modal focus trap was added only to the Crowd Prompt editor, not retrofitted to every older modal in Operator.

## Target environment

- `OMJN/TEST` only

## Rollback note

- Restore the previous versions of `operator.html`, `operator.js`, and `app.css` from Git if you want the old inline editor back.
