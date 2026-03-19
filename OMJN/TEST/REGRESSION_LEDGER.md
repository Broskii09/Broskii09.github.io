# Regression ledger

## Preserved / expected in this baseline
- Combined Pause/Resume button in Operator
- PAUSED badge inside Resume button without row shift
- Viewer timer/progress hide-show toggle
- Viewer PAUSED chip
- Adaptive Viewer main-name fitting
- Intermission Go Live / Arm Next
- Intermission Add to Top / Add Next
- 5-minute changeover buffer in ETA / Estimated End
- Sponsor bug hide/restore across crowd prompts and ads
- Crowd prompt suspension/restoration during ad mode
- Jamaoke slot type

## Re-verified in code
- operator.js syntax OK
- viewer.js syntax OK
- shared.js syntax OK
- soundboard.js syntax OK
- operator.html contains btnPauseResume
- viewer.html contains chipState
- shared.js contains viewerPrefs.showTimer and Jamaoke slot type

## UI polish pass (no logic changes)
- Operator live-control row spacing tightened
- Viewer chip row given reserved height to reduce layout jump
- Viewer timer toggle button given stable width and responsive wrap behavior
