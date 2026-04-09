Summary
- Removed the TEST-only custom cursor experiment.
- Restored the site to normal browser and OS cursor behavior.
- Removed the custom cursor SVG assets that were only used by that experiment.

File list
- `app.css`
- deleted `assets/cursors/omjn-cursor-default.svg`
- deleted `assets/cursors/omjn-cursor-pointer.svg`
- deleted `assets/cursors/omjn-cursor-grab.svg`
- `PATCH_NOTES_CURSOR_REMOVAL_20260409.md`

Install steps (exact paths)
1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Remove these files from `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\assets\cursors\`
   - `omjn-cursor-default.svg`
   - `omjn-cursor-pointer.svg`
   - `omjn-cursor-grab.svg`
3. Keep this patch note at `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\PATCH_NOTES_CURSOR_REMOVAL_20260409.md`

Smoke test checklist
- Refresh the TEST Operator page.
- Confirm the browser is using the normal system cursor again on the page background.
- Hover buttons, links, and queue drag handles and confirm they use the default OS cursor behavior.
- Confirm text fields still show the normal text insertion cursor.

Known risks/limitations
- This patch only removes the custom cursor experiment.
- Existing built-in browser cursors like pointer, text, grab, and grabbing may still appear where the browser or existing CSS uses them natively.

Target environment
- `OMJN/TEST` only

Rollback note
- Restore the removed cursor block in `app.css` and restore the three cursor SVG files if you decide to revisit custom cursors later.
