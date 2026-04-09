# PATCH NOTES

## Summary

Made the TEST Operator queue forecast helper text more readable and more explicit about the time math behind each queued performer ETA.

Instead of compact shorthand like counts only, the helper now reads in a clearer format such as:

- `Ahead 20m | current left 3m + 2 queued performers = 10m + 1 special screen = 4m + 2 transitions x 3m = 6m`

## File list

- `TEST/operator.js`

## Install steps (exact paths)

Copy this file into:

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`

## Smoke test checklist

- Open TEST Operator and confirm queued performer rows show:
  - `Ahead ...`
  - current remaining time when applicable
  - queued performer time total
  - special screen time total
  - transition count and total transition time
- Confirm the helper line still wraps cleanly on narrower Operator widths.
- Check one `Up Next` item and one deeper queued item to make sure the math changes as expected.

## Known risks/limitations

- This is display/clarity work only; it does not change the underlying forecast engine math.
- I did not run a live browser smoke test here.

## Target environment

- `OMJN/TEST` only

## Rollback note

If needed, restore the previous `TEST/operator.js` copy or revert this file to the earlier queue-forecast helper implementation.
