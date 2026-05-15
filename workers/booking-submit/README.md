# Ray Leo's Booking Submit Worker

This is a future booking-submission backend scaffold. It is not deployed yet, and the public booking form is still configured with live submission disabled by default.

The current Ray Leo's booking page continues to:

- validate in the browser
- generate a copyable booking request
- provide the mailto fallback
- avoid depending on this worker until it is deployed and enabled

## Intended Stack

- Cloudflare Worker endpoint
- Resend for email delivery
- Static Ray Leo's site on GitHub Pages staging, later `https://rayleos.com/`

Turnstile, honeypot checks, and rate limiting are intentionally left for a later phase.

## Required Environment Variables

Set these in Cloudflare/Wrangler. Do not commit secrets.

- `RESEND_API_KEY`: Resend API key, stored as a Worker secret.
- `BOOKING_TO_EMAIL`: recipient for booking requests. Start with `inseitzmediaads@gmail.com` for testing.
- `BOOKING_CC_EMAILS`: optional comma-separated server-side CC list. If no CC is needed, omit it or set it to `none`. Do not set it to the same value as `BOOKING_TO_EMAIL`; duplicate, matching, empty, and invalid entries are removed server-side.
- `BOOKING_FROM_EMAIL`: verified sender address in Resend, such as `booking@rayleos.com`.
- `BOOKING_CONFIRMATION_FROM_EMAIL`: optional sender for submitter confirmations.
- `BOOKING_SEND_CONFIRMATION`: `true` only when confirmation emails should be sent.
- `ALLOWED_ORIGINS`: comma-separated list, for example `https://rayleos.com,https://broskii09.github.io`.

Later, switch `BOOKING_TO_EMAIL` from the test recipient to `Booking@rayleos.com` after the address and mail routing are ready.

## Resend Setup

1. Create or use a Resend account.
2. Verify the sending domain or sender address.
3. Create an API key.
4. Store the key with:

```powershell
wrangler secret put RESEND_API_KEY
```

## Cloudflare Setup

Cloudflare dashboard deploy settings:

- Project name: `rayleos-booking-submit`
- Build command: `npm install`
- Deploy command: `npx wrangler deploy --config workers/booking-submit/wrangler.toml`

The committed `wrangler.toml` contains only production-safe deploy metadata. It does not include secrets or live environment values.

Before live email sending:

1. Add the required Worker secrets and environment variables in Cloudflare.
2. Confirm Resend sender/domain verification.
3. Confirm allowed origins.
4. Deploy only after testing locally and confirming configuration.

Do not deploy from this scaffold pass.

## Frontend Enablement

The site config currently keeps submission disabled:

```js
bookingSubmission: {
  enabled: false,
  endpoint: "",
  timeoutMs: 12000
}
```

After the Worker is deployed and tested, set `enabled: true` and set `endpoint` to the Worker URL. The copy and mailto fallback should remain visible even when real submission is enabled.

## Security Notes

- Never put `RESEND_API_KEY` or other secrets in browser JavaScript.
- Do not allow the client to choose recipient emails.
- CC recipients are controlled server-side only and cannot be supplied by the browser.
- The Worker validates required fields, email, URLs, and EPK status.
- User input is escaped before being inserted into HTML email.
- Avoid file uploads for now; collect links instead.
- Add Turnstile, honeypot, and rate limiting before public launch of live submission.
