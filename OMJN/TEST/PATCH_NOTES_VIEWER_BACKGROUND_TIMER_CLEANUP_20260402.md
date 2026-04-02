# Viewer Background / Timer Cleanup Patch Notes

## Summary

- Removed the old custom Viewer background-image feature from the TEST build.
- Removed the Operator-side `splashPath` input that fed the Viewer background image.
- Kept the Viewer on its built-in animated gradient background only.
- Moved the LIVE `Next Up / On Deck` row to the visual bottom of the main hero card.
- Changed `Hide Viewer Timer` behavior so it resets to visible when a new slot goes live.

## File list

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\viewer.js`

## Install steps (exact paths)

1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Copy `operator.html` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
3. Copy `operator.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
4. Copy `shared.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
5. Copy `viewer.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\viewer.js`
6. Refresh the TEST Operator and TEST Viewer pages.

## Smoke test checklist

- Open TEST Operator and confirm the custom background-image field is gone from the top row.
- Open TEST Viewer and verify the background always stays on the animated gradient during Splash and LIVE.
- Start one performer, click `Hide Viewer Timer`, then end/start the next performer and confirm the timer is visible again.
- Start a performer with the media pane visible and confirm `Next Up / On Deck` sits at the bottom of the main hero card rather than floating mid-card.
- Verify normal Splash, LIVE, and PAUSED transitions still work.

## Known risks / limitations

- This removes the custom splash background feature from TEST entirely, so any previously saved custom background URL is now ignored and scrubbed during load.
- I did not run a full browser smoke test here; this was validated with targeted code review and syntax checks.
- The Viewer still uses its animated gradient background layer and LIVE dim/blur treatment; only custom image backgrounds were removed.

## Target environment

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST`

## Rollback note

- Roll back by restoring the previous TEST copies of `app.css`, `operator.html`, `operator.js`, `shared.js`, and `viewer.js`.
