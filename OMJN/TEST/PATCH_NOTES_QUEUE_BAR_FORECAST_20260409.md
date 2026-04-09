# PATCH NOTES

## Summary

Refined the TEST Operator queue item layout so the forecast helper is integrated directly into the top queue status bar, immediately to the left of the ETA time.

Also tightened the queue card layout so the action buttons sit higher and align more cleanly with the top bar.

## File list

- `TEST/operator.js`
- `TEST/app.css`

## Install steps (exact paths)

Copy these files into:

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open TEST Operator and confirm queued performer rows show forecast math inside the top `qBar`, immediately before the ETA.
- Confirm the queue action buttons sit near the top of each queue item and align more closely with the bar.
- Verify queued cards still show:
  - drag handle on the left
  - performer name and metadata in the center
  - actions in the right column
- Check one narrower Operator width and confirm the top bar stacks cleanly without cutting off the forecast text.

## Known risks/limitations

- This is a queue UI/layout change only; forecast engine math is unchanged.
- I did not run a live browser smoke test here.

## Target environment

- `OMJN/TEST` only

## Rollback note

If needed, restore the previous `TEST/operator.js` and `TEST/app.css` files or revert this queue-bar forecast pass.
