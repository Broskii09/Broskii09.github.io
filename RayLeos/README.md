# Ray Leo’s at Lamasco — GitHub Pages Static v3

Target URL: `https://broskii09.github.io/RayLeos/`

Copy this `RayLeos/` folder into the root of `Broskii09.github.io`, commit, and push.

## Pages

- `/RayLeos/` — Home
- `/RayLeos/shows/` — Upcoming shows
- `/RayLeos/food-bar/` — Food, bar, Toast link, embedded menu PDF
- `/RayLeos/booking/` — Booking form and future availability structure
- `/RayLeos/visit/` — Address, phone, policies, socials
- `/RayLeos/about/` — Short venue positioning

## Event editing

Edit `assets/data/events.json`. The Shows page and homepage preview read from this file.

## Menu PDF

The Food & Bar page embeds this Google Drive preview:

`https://drive.google.com/file/d/1n41yPAIqVjPfgOIHtGbTl2mWDkZQUNWE/preview`

If the owner updates the menu, keep the same Drive file ID when possible by replacing the file contents rather than uploading a new file.

## Booking form

The form currently creates a prefilled email to `BOOKING_EMAIL`. GitHub Pages does not run server-side form code. Later options: Formspree, Netlify Forms, Cloudflare Pages Functions, or a custom backend.

## Future calendar availability

`assets/data/availability-example.json` shows the intended parse pattern. Public display should only show the status before the hyphen. Example: `Hold (1) - Band Name` displays as `Hold`.

## Fonts

Font files are intentionally not included. Place licensed `.woff2` files in `assets/fonts/` using the filenames in `assets/fonts/README.txt`.
