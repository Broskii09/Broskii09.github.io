# Ray Leo's Website Agent Guide

## Scope

This guide applies to the `RayLeos/` static website in this GitHub Pages user-site repository. Keep work scoped to Ray Leo's unless the user explicitly asks for broader repository changes.

## Site Constraints

- Preserve the `/RayLeos/` base path for local and GitHub Pages URLs.
- Keep the site static HTML, CSS, JavaScript, and JSON for now.
- Do not convert the site to Astro yet.
- Do not redesign the website unless the user specifically requests design work.
- Prefer surgical edits that preserve existing behavior and content.
- Do not add or commit font files.
- Do not add ZIP artifacts.

## Features To Preserve

- Home, Shows, Food & Bar, Booking, Visit, and About pages.
- Primary nav and mobile nav.
- Shows page rendering from public event JSON.
- Booking page rendering from availability JSON.
- Booking form validation.
- Booking request generation as a copyable/email-ready draft.
- Booking submit must not immediately force-open an email app.
- Availability inquiry buttons should autofill the booking form.
- Booking email belongs in `RayLeos/assets/js/site-config.js`.
- Food & Bar page should embed or link to the Google Drive menu.

## Privacy Rules

Never expose private Google Calendar details, payment terms, guarantees, door splits, internal booking notes, promoter notes, or staffing notes.

Public Shows data should include only confirmed, public-safe events.

Booking availability may display only these public-safe statuses:

- Available
- Booked
- Hold
- Needs Support
- Unavailable

Preferred future calendar title format:

`[Artist/Event Name] - [STATUS]`

Supported statuses:

- CONFIRMED
- HOLD
- HOLD 1
- HOLD 2
- HOLD 3
- NEEDS OPENER
- NEEDS BANDS
- PRIVATE
- BLACKOUT
- CANCELLED
- NO SHOW

Keep parsing forgiving for older titles such as `HOLD - Artist`, `Artist -confirmed`, `HOLD1 - Artist`, and `NEED OPENER - Artist`.

## Testing Expectations

- Use the repo-root local server so `/RayLeos/` paths work locally.
- Local preview URL: `http://127.0.0.1:3000/RayLeos/`.
- Run `npm run check` before handoff when dependencies and browsers are available.
- Add or update Playwright coverage when changing navigation, shows rendering, availability, or booking behavior.
- Do not commit generated Playwright reports, traces, screenshots, test results, logs, `node_modules/`, or ZIP files.

## Reporting Preference

In handoffs, summarize:

- Files added or changed.
- Tests created or updated.
- Commands run and results.
- Website issues discovered but not patched.
- Risks and recommended next steps.
