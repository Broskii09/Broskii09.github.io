# PATCH NOTES

## Summary

Polished the TEST Operator right-side UI and queue item controls.

This pass:

- moved the queue forecast math into a cleaner inline position in the queue bar
- improved queue action alignment so the action cluster sits higher
- centered the queue ETA better inside the bar
- reduced the size of the KPI summary strip chips
- removed duplicate `Import Show` / `Export Show` buttons from the live control area
- tightened the Live Control card layout with a cleaner action/timer grouping
- changed `No obs` to `No gaps yet` so the transition-average status is easier to understand

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

- Open TEST Operator and verify queue action buttons sit near the top of each queue card.
- Confirm the remove button is no longer stranded on its own row.
- Check that the queue ETA aligns more cleanly with the forecast math inside the top bar.
- Confirm the KPI summary strip chips are visibly smaller.
- Confirm `Import Show` / `Export Show` only appear in the main card header, not in Live Control.
- Check that the live action/timer section feels cleaner and still functions normally.
- Verify `Transition Avg` now shows `No gaps yet` instead of `No obs` before any transitions have been observed.

## Known risks/limitations

- This is a TEST-only UI/layout pass.
- I did not run a live browser smoke test here.
- The broader ETA/transition forecast feature work from the current TEST branch remains in place.

## Target environment

- `OMJN/TEST` only

## Rollback note

If needed, restore the previous `TEST/operator.html`, `TEST/operator.js`, and `TEST/app.css` files or revert this specific polish pass.
