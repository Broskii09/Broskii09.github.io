# PATCH NOTES

## Summary

Made the TEST Operator queue forecast helper much more visible and easier to spot in each queued performer card.

Changes:

- Added a `Forecast Math:` label before the helper text
- Styled the helper as its own highlighted block
- Increased contrast and weight so it no longer blends into the queue metadata

## File list

- `TEST/operator.js`
- `TEST/app.css`

## Install steps (exact paths)

Copy these files into:

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open TEST Operator and confirm queued performer rows now show a visible `Forecast Math:` block.
- Verify the helper wraps cleanly on narrower widths instead of being cut off.
- Confirm the helper still appears below the normal queue metadata and not inside the top status band.

## Known risks/limitations

- This only changes visibility and wording, not the forecast engine itself.
- I did not run a browser smoke test here.

## Target environment

- `OMJN/TEST` only

## Rollback note

If needed, restore the previous `TEST/operator.js` and `TEST/app.css` files or revert this specific visibility pass.
