# Ray Leo’s at Lamasco — GitHub Pages Test Build

Target URL:

```txt
https://broskii09.github.io/RayLeos/
```

## What this is

This is a static GitHub Pages-ready test build for Ray Leo’s at Lamasco. It uses plain HTML, CSS, and vanilla JavaScript so it can be dropped into a `/RayLeos` directory under the repository root with no build step.

The visual system is based on the supplied Adobe library colors, the supplied SVG logo, and a retro diner / garage-rock venue direction.

## Deploy to GitHub Pages

1. In the repository root, create a folder named `RayLeos`.
2. Copy everything from this ZIP’s `RayLeos/` folder into that repository folder.
3. Commit and push.
4. Confirm GitHub Pages is serving from the branch/root you expect.
5. Visit `https://broskii09.github.io/RayLeos/`.

## Replace placeholder images

Replace these files or update references in `index.html`:

```txt
assets/img/placeholders/food-01.svg
assets/img/placeholders/food-02.svg
assets/img/placeholders/venue-01.svg
assets/img/placeholders/event-01.svg
assets/img/placeholders/event-02.svg
assets/img/placeholders/event-03.svg
```

Recommended final image dimensions:

- Hero/venue images: 1600px wide or larger
- Food cards: 1200px wide or larger
- Event posters: 1200x900 or 1080x1350 depending on layout needs
- Use compressed WebP/JPEG for photos
- Keep descriptive alt text in `index.html`

## Fonts

Font files are not included. The CSS already references expected WOFF2 files in:

```txt
assets/fonts/
```

Expected filenames:

```txt
peignot.woff2
peignot-demi.woff2
peignot-bold.woff2
peignot-thin.woff2
honey-script-light.woff2
honey-script-semibold.woff2
```

If those files are missing, the site uses fallback fonts.

## Events

Current event cards are loaded from:

```txt
assets/data/events.json
```

For now, edit that JSON manually. Later, this same format can be generated from Eventbrite by GitHub Actions or a serverless proxy without changing the front-end card layout.

Eventbrite organizer page:

```txt
https://www.eventbrite.com/o/ray-leos-at-lamasco-121162835137
```

## Booking form

Because GitHub Pages is static hosting, the form currently opens a pre-filled email to:

```txt
Booking@rayleos.com
```

For production, replace the mailto behavior in `assets/js/main.js` with a secure form backend such as Netlify Forms, Formspree, Cloudflare Pages Functions, or a custom API endpoint.

## Main files

```txt
index.html
assets/css/styles.css
assets/js/main.js
assets/data/events.json
assets/img/ray-leos-circle-logo.svg
```
