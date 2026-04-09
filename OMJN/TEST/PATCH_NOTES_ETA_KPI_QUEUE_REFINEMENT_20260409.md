## Summary

- Confirmed ETA behavior after queue edits:
  - removing a performer from the queue recalculates the forecast
  - ending the current performer early recalculates the forecast from real time
- Kept the new transition forecast model and added clearer Operator UI around it.
- Cleaned up the Live Control KPI area by removing the redundant live banner/placeholder ready strip and replacing them with a single summary strip.
- Made `Current` and `Next` KPI cards wider so names read more cleanly.
- Moved queue row action buttons to the top of each queue item and added a small forecast helper line for queued slots.

## File list

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Install steps

1. Copy `operator.html` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
2. Copy `operator.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
3. Copy `shared.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
4. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open TEST Operator and confirm the Live Control card now uses the cleaner KPI layout plus one summary strip.
- Confirm the old right-side live status banner and static ready strip are gone.
- Add a few performers, then remove one queued performer and confirm `Estimated End` and queued ETA chips update.
- Start a performer, then end them early and confirm `Estimated End` updates immediately for the remaining queue.
- Confirm `Current` and `Next` names fit more comfortably in the widened KPI cards.
- Confirm queue row action buttons now sit at the top of each queue item.
- Confirm queued performer rows show helper text like `Ahead 42m • 3 slots • 1 transition`.
- Confirm Timer settings still show the ETA forecast controls and `Transition Avg` KPI still updates.

## Known risks/limitations

- This pass was validated with static checks only; it was not browser-smoke-tested through a full show run here.
- The new queue helper text appears only on queued performer-style rows that get ETA chips.
- The transition-learning model still depends on the operator ending one act and starting the next act through the normal controls.

## Target environment

- `OMJN/TEST` only

## Rollback note

- Restore the previous versions of `operator.html`, `operator.js`, `shared.js`, and `app.css` from Git if you want to revert to the older KPI/queue layout and fixed ETA presentation.
