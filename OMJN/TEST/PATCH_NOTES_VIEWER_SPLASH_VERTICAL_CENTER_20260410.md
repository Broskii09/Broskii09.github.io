Summary
- Adjusted the TEST Viewer splash layout so `splashLeft` and `splashRight` stay vertically centered in the main splash area.
- The House Band row remains below the centered splash columns.
- Added a narrower-screen fallback so stacked splash layouts remain natural on smaller viewports.

File list
- `app.css`
- `PATCH_NOTES_VIEWER_SPLASH_VERTICAL_CENTER_20260410.md`

Install steps (exact paths)
1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Keep this patch note at `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\PATCH_NOTES_VIEWER_SPLASH_VERTICAL_CENTER_20260410.md`

Smoke test checklist
- Open the TEST Viewer on Splash.
- Confirm the left splash image area and right Up Next / On Deck / In The Hole stack are centered vertically.
- Toggle House Band footer/lineup visibility and confirm the main splash columns remain visually centered.
- Test with the splash image missing or hidden and confirm the remaining splash column stays centered.
- Shrink the browser below the stacked breakpoint and confirm the layout still reads naturally.

Known risks/limitations
- This patch changes layout CSS only and does not alter Viewer data or queue logic.
- Final perceived centering can still vary slightly if the House Band row becomes unusually tall.

Target environment
- `OMJN/TEST` only

Rollback note
- Revert the splash layout section in `app.css` to restore the previous stretched grid behavior.
