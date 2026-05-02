# Ray Leo’s at Lamasco — GitHub Pages Static Test v2

Target URL: `https://broskii09.github.io/RayLeos/`

## What changed in v2

- Rebuilt the visual direction around a mostly black/charcoal venue aesthetic.
- Reduced decorative atomic/diner elements.
- Kept the logo as the main brand personality.
- Reordered the page to prioritize food/menu first, then photos/vibe, visit info, socials, shows, and booking.
- Added lighter grain, poster grit, subtle stickers, and restrained red/teal/yellow accents.
- Preserved the static event JSON workflow and booking mailto fallback.

## Deployment

Copy the `RayLeos/` folder into the repository root and push to GitHub Pages.

The folder should resolve at:

```txt
https://broskii09.github.io/RayLeos/
```

## Replacing placeholder photos

Replace the SVG placeholders in:

```txt
assets/img/placeholders/
```

with final optimized `.webp`, `.jpg`, or `.png` photos, then update the matching `src` paths in `index.html`.

Recommended image widths:

- Hero/large food image: 1600–2200px wide
- Card/grid images: 900–1400px wide
- Event poster images: 900–1400px tall

## Events

Edit:

```txt
assets/data/events.json
```

Each event supports:

```json
{
  "title": "Event name",
  "date": "Month Day",
  "time": "Doors / show time",
  "summary": "Short event description",
  "image": "assets/img/placeholders/event-01.svg",
  "ticketUrl": "https://...",
  "tag": "Live Music"
}
```

For GitHub Pages, do not expose Eventbrite API tokens in browser JavaScript. Use manual JSON for testing, then move to GitHub Actions build-time fetch or a serverless proxy later.

## Booking form

The booking form opens a pre-filled email to `Booking@rayleos.com`. This is GitHub Pages-safe but not a production backend.

Production options:

- Netlify Forms
- Formspree
- Cloudflare Pages Functions
- Vercel/Netlify serverless function
- Custom backend + spreadsheet/CRM routing

## Fonts

Font hooks are included, but font files are not packaged. Place licensed `.woff2` files in:

```txt
assets/fonts/
```

Expected names are listed in `assets/fonts/README.txt`.
