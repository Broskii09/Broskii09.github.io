# AUDIT_REPORT.md

## Audit scope
This was a static audit of the uploaded OMJN build plus a consolidation patch to remove mixed-branch regressions.

Audit methods used:
- file inventory and branch-drift comparison
- syntax checks on JavaScript entry files
- DOM/ID reference checks between HTML and JS
- targeted search for abandoned references, dead wiring, and stale selectors
- reconciliation against recent shipped features from the regression ledger

## High-risk issues found and fixed

### 1. Branch drift across Operator and Viewer
The uploaded build was a mixed baseline. Several recent features had reverted while other newer features were still present.

Fixed in this patch:
- combined Pause / Resume
- Hide Viewer Timer
- ETA buffer
- Intermission top/next/live flow
- Crowd Prompt modal editor
- Jamaoke
- Viewer PAUSED chip

### 2. Dead or abandoned references
Removed or corrected:
- `crowdEditor` inline editor reference in `operator.js`
- `startBanner` and `startBannerName` references in `viewer.js`
- stale CSS tied to the retired inline Crowd Prompt editor
- stale CSS tied to the removed `#startBanner` node

### 3. Runtime error potential
Fixed:
- missing `toast()` helper used by Intermission and related Operator flows
- Crowd Prompt save/close wiring standardized through `saveCrowdPreset(closeAfter=false)`

## Items preserved from the uploaded baseline
- Adaptive Viewer main-name fit logic
- Sponsor bug default path support in shared state
- Viewer overlay logic for sponsor/crowd/ad handling
- Soundboard structure and syntax

## Non-blocking observations
- The async listener console error is consistent with browser-extension noise rather than app code.
- There may still be harmless legacy styling in the CSS beyond the selectors removed here, but no remaining JS-to-missing-DOM mismatches were found in the audited entry points.

## Recommended validation order
1. Operator + Viewer startup with devtools open
2. start / pause / resume / end timed slot
3. Hide Viewer Timer toggle
4. Intermission modal actions in Splash and Live
5. Crowd Prompt modal flow
6. Jamaoke live presentation
7. sponsor bug default logo and overlay behavior
8. hosted `/TEST` smoke pass
