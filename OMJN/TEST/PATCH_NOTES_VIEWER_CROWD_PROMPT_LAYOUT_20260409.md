Summary
- Refined the TEST Viewer crowd prompt overlay so it fills more of the screen and reads more confidently on 16:9 displays.
- Made the crowd prompt panel wider and taller, reduced wasted outer margins, and turned each prompt line into a larger readable band.
- Added adaptive crowd prompt variants so short presets feel bigger and denser presets tighten up automatically.

File list
- `app.css`
- `viewer.js`
- `PATCH_NOTES_VIEWER_CROWD_PROMPT_LAYOUT_20260409.md`

Install steps (exact paths)
1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Copy `viewer.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\viewer.js`
3. Keep this patch note at `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\PATCH_NOTES_VIEWER_CROWD_PROMPT_LAYOUT_20260409.md`

Smoke test checklist
- Open the TEST Viewer and trigger a crowd prompt from Operator.
- Confirm the crowd prompt panel fills more of the screen at 1920x1080 without looking cramped.
- Check a short preset with 1-2 lines and confirm the prompt grows noticeably larger.
- Check a denser preset with 4+ lines and confirm it still fits cleanly without overflowing.
- Check a preset with and without footer text and confirm spacing stays balanced in both cases.
- Check the crowd prompt on a narrower window and confirm the panel still compresses cleanly.

Known risks/limitations
- This patch is Viewer-only and does not change crowd prompt data or operator-side editing.
- Final perceived size will still vary a little based on browser chrome, venue display scaling, and OS zoom settings.
- Very long individual lines will still wrap; the new layout is tuned to make that wrap cleaner rather than force single-line overflow.

Target environment
- `OMJN/TEST` only

Rollback note
- Revert `app.css` and `viewer.js` to the previous versions if you want to restore the older smaller crowd prompt overlay.
