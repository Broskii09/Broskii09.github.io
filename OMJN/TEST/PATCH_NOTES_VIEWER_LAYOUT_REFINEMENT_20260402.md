# Viewer Layout Refinement Patch Notes

## Summary

- Targeted the TEST Viewer only for layout and readability refinement on 16:9 venue screens.
- Reduced reliance on browser zoom by making the Viewer auto-scale against a broadcast-safe 16:9 stage and by adding operator controls for edge padding, queue-card text, and media-pane width.
- Improved long-name handling so the main performer name, Splash `Up Next / On Deck / In The Hole`, and LIVE `Next Up / On Deck` are much less likely to clip or truncate.
- Made the right-side media area stretch to the full hero height when there is no donation/social card content.
- Added recommended artwork guidance in Operator settings for the media box.

## File list

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\viewer.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\viewer.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`

## Install steps (exact paths)

1. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`
2. Copy `viewer.html` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\viewer.html`
3. Copy `viewer.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\viewer.js`
4. Copy `operator.html` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
5. Copy `operator.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
6. Copy `shared.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
7. Refresh the TEST Operator and TEST Viewer pages after the files are in place.

## Smoke test checklist

- Open TEST Operator and confirm the Viewer scale section shows the new controls for `Upcoming / queue card text`, `Viewer edge padding`, and `Media pane width`.
- Open TEST Viewer on a 16:9 browser window and verify the Splash layout fills the screen without needing browser zoom.
- Check a long performer name on the LIVE screen and confirm the main performer name still fits cleanly.
- Check long names in `Up Next`, `On Deck`, and `In The Hole` on Splash and `Next Up` / `On Deck` on LIVE and confirm they wrap instead of hard truncating.
- Toggle a donation/social link on and off for a LIVE performer and confirm the media box expands to fill the right column when the donation card is hidden.
- Try the new padding/media width controls from Operator and confirm the Viewer updates immediately.

## Known risks / limitations

- This patch improves fitting and wrapping but cannot guarantee perfect typography for every possible all-caps or extremely long custom name on every projector resolution.
- Final layout polish still depends on the venue screen, browser chrome, and whether the display is true 16:9 or a mirrored/scaled feed.
- No live browser screenshot or projector hardware validation was run in this patch pass.
- The media box works best with artwork prepared for the intended layout:
  - Landscape promo image: `1600x900` minimum, `1920x1080` preferred
  - Square QR or square social graphic: `1400x1400` or larger
  - Keep logos, QR codes, and important text inset away from the outer edges

## Target environment

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST`

## Rollback note

- Roll back by restoring the previous TEST copies of `app.css`, `viewer.html`, `viewer.js`, `operator.html`, `operator.js`, and `shared.js`.
