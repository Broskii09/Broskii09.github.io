# Summary
Refined ETA and Estimated End logic in `operator-WORKING.js` so both values stay live and consistent during the show.

# Changes
- Added a shared forecast path for queue ETA and Estimated End.
- Estimated End now refreshes on the UI tick instead of waiting for a full render/state change.
- Queue ETA and Estimated End now use the same `Date.now()` snapshot on each tick.
- Current untimed Jamaoke slots now use planning minutes for forecasting instead of timer remaining time.
- Preserved the existing 5-minute changeover buffer logic between eligible slots.

# Files
- `operator-WORKING.js`

# Install
Replace your working copy of `operator.js` with the updated `operator-WORKING.js` from this package.

# Smoke test checklist
- Start a timed performer and watch queue ETA + Estimated End update live.
- Pause the show and verify Estimated End continues to reflect the real current clock time.
- Change the system clock forward/backward and confirm both queue ETA and Estimated End move together.
- Start a Jamaoke slot and confirm forecasting uses planned minutes while the Viewer remains untimed.
- Confirm ads still contribute zero planned duration to ETA.

# Known notes
- This patch changes only the Working operator ETA/KPI logic.
- Shared timer primitives were not changed.
