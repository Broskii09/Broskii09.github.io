# PATCH NOTES - Operator Version Header

## Summary

Adds the current site build/version to the Operator page header next to `Operator - Queue`.

The version badge is driven by the same `site-version.json` value used by the refresh prompt. It shows the loaded page version as a compact `Build YYYY-MM-DD HH:MM` pill in the Operator card header.

This was added to both environments:

- `OMJN`
- `OMJN/TEST`

## File list

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\shared.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\operator.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\app.css`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Install steps

1. Copy the updated files into these exact paths:
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\shared.js`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\operator.html`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\operator.js`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\app.css`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open Operator in `OMJN` and confirm the header shows a build badge next to `Operator - Queue`.
- Open Operator in `OMJN/TEST` and confirm the same badge appears there too.
- Confirm the badge text matches the current environment's `site-version.json`.
- Leave Operator open, bump the site version, and confirm the refresh prompt can appear without the displayed current build badge incorrectly changing before refresh.

## Known risks / limitations

- The badge intentionally shows the page's loaded build version, not the newer available version after a refresh prompt appears.
- If `site-version.json` fails to load, the badge stays hidden.
- The compact badge uses the timestamp version format; custom non-timestamp version strings will still display, but without timestamp shortening.

## Target environment

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST`

## Rollback note

Restore the previous `shared.js`, `operator.html`, `operator.js`, and `app.css` files to remove the Operator version badge.
