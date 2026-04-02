# PATCH NOTES - Refresh Prompt

## Summary

Adds a shared "Refresh available" prompt to both the live/root `OMJN` build and the `OMJN/TEST` build.

Open pages now poll a small `site-version.json` file every 15 seconds. If that file changes after the page is already open, the user sees a refresh prompt with `Refresh` and `Dismiss` actions.

This covers:

- `index.html`
- `operator.html`
- `viewer.html`
- `soundboard.html`

The prompt is injected by `shared.js`, so Operator, Viewer, and Soundboard pick it up automatically. The homepage was updated to load `shared.js` too.

## File list

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\shared.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\app.css`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\index.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\site-version.json`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\index.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\site-version.json`

## Install steps

1. Copy the updated files into these exact locations:
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\shared.js`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\app.css`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\index.html`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\site-version.json`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\index.html`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\site-version.json`
2. Publish/deploy as usual.
3. Every time you ship a new update, change the `version` and `updatedAt` values inside the matching `site-version.json` file for that environment.

## Smoke test checklist

- Open `index.html`, `operator.html`, `viewer.html`, or `soundboard.html` from the hosted site.
- Leave the page open.
- Change the matching environment's `site-version.json` value and publish it.
- Wait up to 15 seconds, or background/foreground the tab once.
- Confirm the `Refresh available` prompt appears.
- Click `Dismiss` and confirm the prompt stays hidden for that same version.
- Change the version value again and confirm the prompt returns.
- Click `Refresh` and confirm the page reloads.

## Known risks / limitations

- This is near-live polling, not true server push. The prompt appears on the next poll, currently every 15 seconds.
- The prompt depends on `site-version.json` being updated when you deploy. If that file is not changed, open tabs will not know a new build exists.
- The checker is intentionally disabled for `file://` usage. It is designed for hosted `http`/`https` pages.
- Users who freshly open the site after a deploy should already get the newest version, so the prompt is mainly for tabs that were already open.

## Target environment

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST`

## Rollback note

To roll back, restore the previous versions of `shared.js`, `app.css`, and `index.html`, and remove `site-version.json` from each environment if you no longer want refresh polling.
