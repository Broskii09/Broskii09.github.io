Summary
- Refined the TEST queue action button layout so the action column reads as a stable, intentional control cluster instead of uneven max-content buttons.
- Desktop queue cards now use a fixed-width action rail with equal-width buttons.
- Narrow screens now fall back to placing the action cluster below the queue row instead of squeezing the right edge.

File list
- `app.css`
- `PATCH_NOTES_QACTIONS_LAYOUT_20260409.md`

Install steps (exact paths)
1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Keep this patch note alongside the TEST build at `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\PATCH_NOTES_QACTIONS_LAYOUT_20260409.md`

Smoke test checklist
- Open the TEST Operator page and inspect several queued rows at desktop width.
- Confirm `Remove`, `Edit`, `Skip`, `No-show`, `Up`, and `Down` align into a stable grid.
- Confirm the action cluster stays top-aligned with the queue row.
- Confirm rows in the Completed section still render correctly.
- Shrink the browser below the mobile breakpoint and confirm the actions drop below the row instead of crushing the content.

Known risks/limitations
- This patch is CSS-only and does not change queue behavior.
- Exact text fit can still vary slightly by browser font rendering, but the action rail is now fixed-width and equal-column on desktop.
- Safari and Chrome may render button text a little differently, though the grid structure is shared.

Target environment
- `OMJN/TEST` only

Rollback note
- Revert `app.css` to the previous version if you want to restore the older auto-sized action cluster.
