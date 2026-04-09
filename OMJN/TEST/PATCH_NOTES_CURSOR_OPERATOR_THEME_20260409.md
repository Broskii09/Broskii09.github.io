# PATCH NOTES

## Summary

Added a first-pass TEST-only custom cursor set for OMJN using a polished blue/gold operator theme.

This pass includes:

- default OMJN operator cursor
- brighter OMJN pointer cursor for clickable controls
- themed grab cursor for draggable queue items

The cursor rules are scoped to `pointer: fine`, so they only apply on mouse/trackpad-style devices and do not interfere with touch devices.

## File list

- `TEST/app.css`
- `TEST/assets/cursors/omjn-cursor-default.svg`
- `TEST/assets/cursors/omjn-cursor-pointer.svg`
- `TEST/assets/cursors/omjn-cursor-grab.svg`

## Install steps (exact paths)

Copy these files into:

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\assets\cursors\omjn-cursor-default.svg`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\assets\cursors\omjn-cursor-pointer.svg`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\assets\cursors\omjn-cursor-grab.svg`

## Smoke test checklist

- Open TEST Operator and confirm the default cursor changes across the page.
- Hover buttons/links and confirm the brighter pointer cursor appears.
- Hover draggable queue rows/drag handles and confirm the grab cursor appears.
- Click into text inputs and confirm they still use the normal text cursor.
- Check the cursor feel in both Windows and Mac browsers.

## Known risks/limitations

- macOS and Safari can still apply some browser/OS limitations to custom cursor rendering.
- If a browser refuses SVG cursors, it will fall back to the default system cursor.
- I did not run a live browser smoke test here.

## Target environment

- `OMJN/TEST` only

## Rollback note

If needed, restore the previous `TEST/app.css` file and remove the cursor SVG files from `TEST/assets/cursors`.
