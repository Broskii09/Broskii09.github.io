# PATCH NOTES

## Summary

Added a themed TEST-only scrollbar skin for the main OMJN scrollable areas so the queue and other panels no longer use the default browser scrollbar look.

This pass adds:

- blue/gold OMJN-themed scrollbar thumb
- darker track styling
- hover state for the thumb
- Firefox support via `scrollbar-color` / `scrollbar-width`
- WebKit support for Chrome, Edge, and Safari via `::-webkit-scrollbar*`

## File list

- `TEST/app.css`

## Install steps (exact paths)

Copy this file into:

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open TEST Operator and scroll the main queue.
- Open House Band and scroll a category list.
- Open Settings and verify the modal scrollbar matches the new theme.
- Open Soundboard and confirm the major scrollable panels use the same scrollbar look.
- On Mac/Safari, verify the scrollbar styling appears when the scrollbar becomes visible.

## Known risks/limitations

- macOS overlay scrollbars can still auto-hide based on OS/browser settings, so this does not fully override platform behavior.
- Firefox scrollbar styling is more limited than WebKit browsers.
- I did not run a live browser smoke test here.

## Target environment

- `OMJN/TEST` only

## Rollback note

If needed, restore the previous `TEST/app.css` file or revert this scrollbar polish pass.
