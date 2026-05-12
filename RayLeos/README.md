# Ray Leo’s at Lamasco — Static GitHub Pages v4.1

Target URL:

https://broskii09.github.io/RayLeos/

Deploy folder:

C:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\RayLeos

## v4.1 direction

- Static HTML/CSS/JS for now
- Astro later after layout/features are approved
- Live-music-venue-first homepage
- Home nav item added
- Shows page displays up to 12 months from `assets/data/shows.json`
- Homepage previews the next 4–6 public confirmed shows
- Booking page includes public-safe availability from `assets/data/availability.json`
- Availability buttons can auto-fill selected date/time/status/request type into the booking form
- URL parameters can prefill the booking form, e.g. `/RayLeos/booking/?date=2026-06-14&status=Needs+Support&type=Opening%2Fsupport+slot+inquiry#booking-form`
- Booking form generates a copyable email request instead of submitting to a backend
- Active test booking email is controlled by `assets/js/site-config.js`

## Change booking email

Edit one line:

```js
// assets/js/site-config.js
bookingEmail: "inseitzmediaads@gmail.com",
```

Later change it to:

```js
bookingEmail: "Booking@rayleos.com",
```

## Calendar-ready data model

For now, JSON is manually edited.
Later, a GitHub Action can generate these files from Google Calendar:

```txt
RayLeos/assets/data/shows.json
RayLeos/assets/data/availability.json
```

Suggested calendar title format:

```txt
Artist/Event Name - STATUS
```

Examples:

```txt
Bedford - CONFIRMED
See This Through - HOLD 1
The Saint Cecilia - HOLD 2
Sydney Adams - NEEDS OPENER
Rigometrics - NEEDS BANDS
Birthday Party - PRIVATE
Closed - BLACKOUT
Band Name - CANCELLED
Trivia - NO SHOW
```

The parser in `assets/js/main.js` is intentionally forgiving and also handles older formats like:

```txt
HOLD - Jeff Hardy
Impera -confirmed
HOLD1 - the saint cc
NEED OPENER - Sydney Adams
```

## Public display rules

Shows page:

- Shows `CONFIRMED` events only.
- Hides holds, blackouts, private events, cancelled events, and no-show notes.

Booking availability page:

- `CONFIRMED` → Booked
- `HOLD`, `HOLD 1`, `HOLD 2`, `HOLD 3` → Hold
- `NEEDS OPENER`, `NEEDS BANDS` → Needs Support
- `PRIVATE`, `BLACKOUT` → Unavailable
- `CANCELLED`, `NO SHOW` → Hidden

## Menu PDF

The Food & Bar page embeds:

https://drive.google.com/file/d/1n41yPAIqVjPfgOIHtGbTl2mWDkZQUNWE/preview

If the owner replaces the menu, try to replace the existing Google Drive file contents rather than creating a new file ID.

## Local test

Run from repo root:

```bash
cd C:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io
npx http-server -p 8000
```

Open:

http://localhost:8000/RayLeos/

Do not test by opening `index.html` directly with `file://`; absolute `/RayLeos/...` paths will not behave like GitHub Pages.
