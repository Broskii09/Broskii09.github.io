# REGRESSION_LEDGER.md

## Baseline features expected after this patch
- Combined **Pause / Resume** button with internal **Paused** badge
- Operator **Hide Viewer Timer** control
- Viewer timer and progress bar both obey `viewerPrefs.showTimer`
- Viewer **PAUSED** chip visibility
- 5-minute **changeover buffer** in queue ETA and Estimated End
- **Intermission** actions:
  - Splash: **Go Live Now** / **Add to Top**
  - Live or paused: **Arm Next** / **Add Next**
- **Crowd Prompt** main run console + **modal editor**
- Crowd Prompt **Save / Save & Close / Cancel** behavior
- **Jamaoke** slot type
- Adaptive Viewer **main-name fitting**
- Sponsor bug default path `./assets/InSeitz Media Logo.png`
- Viewer sponsor / crowd / ad overlay suppression logic
- Favicon links on all app entry pages

## Re-verified in code
- `operator.js`, `viewer.js`, `shared.js`, and `soundboard.js` all pass syntax check
- Missing DOM references removed for retired `crowdEditor`, `startBanner`, and `startBannerName`
- Operator DOM references align with the patched `operator.html`
- Viewer DOM references align with the patched `viewer.html`
- `toast()` helper exists for Intermission and related flows

## Browser checks still required
- Pause / Resume layout remains stable under live interaction
- Crowd Prompt modal open / save / save-and-close / cancel behavior
- Hide Viewer Timer sync between Operator and Viewer
- Sponsor bug default asset loads correctly from `./assets/InSeitz Media Logo.png`
- Ad transitions and Crowd Prompt overlay restore behavior during real playback
- Jamaoke presentation on Viewer with timer/progress suppressed
