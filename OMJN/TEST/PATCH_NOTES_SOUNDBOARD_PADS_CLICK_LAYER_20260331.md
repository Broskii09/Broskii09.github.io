Summary

- Refined the Soundboard pad grid so pads stay more uniform even when sound names wrap.
- Changed pad click behavior so clicking the same pad again stops that sound by default, while clicking a different pad still layers/overlaps.
- Added a global `Repeat click layers` toggle so repeat-clicking the same pad can layer instead of stop when desired.
- Cleaned up each pad's control strip so the favorite, stop, layer, pin, and volume controls line up more consistently.

File list

- `soundboard.html`
- `soundboard.js`
- `app.css`
- `PATCH_NOTES_SOUNDBOARD_PADS_CLICK_LAYER_20260331.md`

Install steps (exact paths)

1. Copy `soundboard.html` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\soundboard.html`
2. Copy `soundboard.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\soundboard.js`
3. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
4. Keep this patch note file with the TEST artifact for reference.

Smoke test checklist

- Open the TEST Soundboard and confirm long sound names no longer make some pads visibly taller than neighbors.
- Click a pad once and confirm it plays.
- Click the same pad again and confirm it stops using the configured Stop Fade behavior.
- Click one pad, then click a different pad, and confirm both sounds overlap instead of stopping each other.
- Turn on `Repeat click layers` and click the same pad multiple times to confirm it layers instead of stopping.
- Turn `Repeat click layers` back off and confirm the same pad returns to click-again-to-stop behavior.
- Use a pad's `Layer` button with the global toggle off and confirm that one pad still layers on repeat click.
- Confirm `Stop`, `Pin`, favorite, and per-pad volume still work on a few sample pads.

Known risks / limitations

- This was validated with static review and `node --check`; I did not run an in-browser smoke test in this environment.
- The pad grid is tuned for more consistent heights, but very narrow browser widths may still cause small visual wrapping differences depending on font rendering.
- Existing uncommitted Soundboard changes in TEST remain part of the current working copy; this artifact includes the latest versions of the touched files.

Target environment

- `OMJN/TEST`

Rollback note

- Restore the previous versions of `soundboard.html`, `soundboard.js`, and `app.css` from your last known-good TEST copy or Git history if you want to undo this patch.
