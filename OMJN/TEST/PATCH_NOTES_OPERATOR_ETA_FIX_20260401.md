Summary

- Fixed the main Operator ETA forecast so a live timed slot uses its actual remaining timer value instead of falling back to a fresh nominal duration in forecast edge cases.
- This specifically corrects the current-slot forecast path that could make the Estimated End KPI run late for live `Jamaoke` slots.

File list

- `operator.js`
- `PATCH_NOTES_OPERATOR_ETA_FIX_20260401.md`

Install steps (exact paths)

1. Copy `operator.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
2. Keep this patch note file with the TEST artifact for reference.

Smoke test checklist

- Start a timed slot and confirm the Estimated End KPI updates normally.
- Start a `Jamaoke` slot, let some time elapse, and confirm the main ETA reflects the actual remaining timer instead of the full slot duration.
- Pause and resume the current slot and confirm the main ETA continues to update sensibly.
- Confirm queue ETA chips still render for normal queued performer slots.

Known risks / limitations

- This patch fixes the current-slot remaining-time path only.
- Queued ads are still forecast as zero time because the current ad data model stores them as untimed queue blocks.
- Changeover is still a fixed 5-minute forecast assumption, so real-world host chatter/setup can still make the live ETA drift.

Target environment

- `OMJN/TEST`

Rollback note

- Restore the previous version of `operator.js` from your last known-good TEST copy or Git history if you want to undo this patch.
