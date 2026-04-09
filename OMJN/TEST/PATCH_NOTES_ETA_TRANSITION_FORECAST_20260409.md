## Summary

- Replaced the fixed 5-minute ETA transition assumption with a per-show transition forecast model.
- Added Timer settings for default transition time, a per-show adjustment, auto-learning from real act-to-act gaps, and a reset button for learned gaps.
- Added a new `Transition Avg` KPI plus an ETA hint line so the operator can see what the forecast is based on.
- Updated queue forecasting so future slot durations include nonzero ad durations when configured.

## File list

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Install steps

1. Copy `operator.html` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.html`
2. Copy `operator.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`
3. Copy `shared.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\shared.js`
4. Copy `app.css` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\app.css`

## Smoke test checklist

- Open TEST Operator and confirm the new `Transition Avg` KPI appears next to `Estimated End`.
- Open Settings → `Timer` and confirm the ETA forecast controls render with current values.
- Change `Default transition (sec)` and confirm `Transition Avg` and `Estimated End` update.
- Change `Tonight adjustment (sec)` and confirm the KPI/meta text updates.
- Toggle `Auto-learn` off/on and confirm the meta text changes.
- End one act, wait a short gap, then start the next act and confirm the learned status reports observed gaps.
- Click `Reset Learned Gaps` and confirm the observed gap count clears.
- Queue an ad with a nonzero duration override and confirm the ETA forecast reflects it.

## Known risks/limitations

- This pass was validated with static checks only; it was not smoke-tested in a live browser during a full show flow here.
- Current live ads still do not forecast a running remaining time, because ads are not using the same live timer path as performer slots.
- Transition learning currently records the real gap between one ended act and the next started act when both slots qualify for transition buffering.

## Target environment

- `OMJN/TEST` only

## Rollback note

- Restore the previous versions of `operator.html`, `operator.js`, `shared.js`, and `app.css` from Git if you want to return to the fixed-buffer ETA model.
