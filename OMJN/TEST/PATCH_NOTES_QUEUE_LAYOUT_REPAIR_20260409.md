# PATCH NOTES

## Summary

Repaired the TEST Operator queue item layout after the recent ETA/KPI refinement pass. The queue cards now use the stable three-column structure again, with the row action buttons back in their own right-side column and the new forecast helper text remaining inside the main body of each queue item.

## File list

- `TEST/operator.js`
- `TEST/app.css`

## Install steps (exact paths)

Copy these files into:

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open TEST Operator and confirm each queue item renders with:
  - drag handle on the left
  - queue content in the center
  - action buttons in a separate right column
- Verify long queue items still show the ETA/helper text beneath the metadata instead of crowding the top band.
- Open an inline editor on a queue item and confirm the expander still spans the full card width.
- Check one smaller window width and confirm the action buttons remain readable.

## Known risks/limitations

- This is a structural layout repair only; no browser smoke test was run here.
- The broader ETA/KPI changes from the current TEST pass are still present.

## Target environment

- `OMJN/TEST` only

## Rollback note

If needed, roll back `TEST/operator.js` and `TEST/app.css` to the prior commit or restore the previous local copies.
