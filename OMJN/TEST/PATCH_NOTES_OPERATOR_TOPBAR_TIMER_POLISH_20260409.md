# PATCH NOTES

## Summary

Polished the TEST Operator top/upper-right UI:

- moved `Hide Viewer Timer` into the timer readout block
- styled it with the same visual treatment pattern as the Pause/Resume control
- refreshed the Live Control action/timer button layout
- moved the status banner inline beside the Show Title field
- improved queue action ordering so `Remove from queue` is pulled forward
- replaced `No obs` with `No gaps yet` in Transition Average

## File list

- `TEST/operator.html`
- `TEST/operator.js`
- `TEST/app.css`

## Install steps (exact paths)

Copy these files into:

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open TEST Operator and confirm the status banner now sits to the right of Show Title.
- Confirm `Hide Viewer Timer` is now inside the timer readout block on the right.
- Toggle the Viewer timer and verify the button switches between `Hide Viewer Timer` and `Show Viewer Timer` and uses the pause/resume-style glow when hidden.
- Check the Live Control buttons for cleaner spacing and stronger visual grouping.
- Confirm queue action buttons stay top-aligned and `Remove from queue` is no longer buried at the end.
- Verify `Transition Avg` now shows `No gaps yet` before the show has recorded any real transition gaps.

## Known risks/limitations

- This is a TEST-only UI/layout pass.
- I did not run a live browser smoke test here.
- The HTML indentation in the Live Control block is not fully cleaned up yet, but the structure is valid.

## Target environment

- `OMJN/TEST` only

## Rollback note

If needed, restore the previous `TEST/operator.html`, `TEST/operator.js`, and `TEST/app.css` files or revert this polish pass.
