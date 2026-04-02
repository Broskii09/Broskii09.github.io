# Patch History

This file is the consolidated tracker for the patch-note files currently stored in `OMJN/TEST`.

Purpose:
- keep one readable history file in the repo
- preserve dates, scope, and high-level outcomes
- point back to the original patch-note files for full install steps and smoke-test details

Tracking note:
- this file intentionally uses the name `PATCH_HISTORY.md` instead of `PATCH_NOTES*.md`
- that keeps it out of the deploy helper's default skip pattern for `TEST/PATCH_NOTES*.md`

Original patch-note files are still retained for now.

## Legacy / Undated

### Operator UX Cleanup Bundle
- Source: `PATCH_NOTES.md`
- Target: TEST
- Summary:
  - completed performers collapse by default
  - House Band queue titles/customization persist more reliably
  - Soundboard search highlights use a more readable foreground

### ETA Live Refresh
- Source: `PATCH_NOTES_ETA_LIVE_REFRESH.md`
- Target: Working operator build
- Summary:
  - queue ETA and Estimated End were unified onto the same live-refresh forecast path
  - Estimated End moved to the UI tick so it updates continuously during the show
  - Jamaoke forecasting used planning minutes rather than timer remaining time in that working-build patch

### KPI Polish
- Source: `PATCH_NOTES_KPI_POLISH.md`
- Target: Operator
- Summary:
  - KPI bar was redesigned into clearer cards
  - Estimated End was visually emphasized as the primary schedule metric
  - this was a presentation-only change, not ETA math

## 2026-03-31

### Soundboard Cleanup
- Source: `PATCH_NOTES_SOUNDBOARD_CLEANUP_20260331.md`
- Target: TEST
- Summary:
  - fixed Soundboard label/attribute issues
  - improved modal keyboard and focus behavior
  - prevented background hotkeys while overlays/modals are active
  - made failed sound loads retry cleanly
  - removed stale Soundboard-only CSS selectors

### Soundboard Pause / Resume Match
- Source: `PATCH_NOTES_SOUNDBOARD_PAUSE_RESUME_MATCH_20260331.md`
- Target: TEST
- Summary:
  - replaced separate Soundboard `Pause` and `Resume` buttons with a combined control
  - aligned Soundboard pause/resume behavior and affordances with Operator

### Soundboard Pads Click / Layer Pass
- Source: `PATCH_NOTES_SOUNDBOARD_PADS_CLICK_LAYER_20260331.md`
- Target: TEST
- Summary:
  - made pad heights more uniform
  - changed same-pad repeat click to stop by default
  - preserved overlap across different pads
  - added a global `Repeat click layers` option
  - cleaned up per-pad control-strip layout

### Operator + Soundboard Border Active
- Source: `PATCH_NOTES_OPERATOR_SOUNDBOARD_BORDER_ACTIVE_20260331.md`
- Target: TEST
- Summary:
  - applied animated border styling to shared pause/resume controls
  - added active playing-pad treatment on Soundboard
  - removed the default always-selected first-pad look

### Pause / Resume Border Tune
- Source: `PATCH_NOTES_PAUSE_RESUME_BORDER_TUNE_20260331.md`
- Target: TEST
- Summary:
  - narrowed the pause/resume animation to the `Resume` state
  - changed the effect to border-only
  - fixed badge layout so surrounding controls do not shift

### Pause / Resume Effect Restore
- Source: `PATCH_NOTES_PAUSE_RESUME_EFFECT_RESTORE_20260331.md`
- Target: TEST
- Summary:
  - restored the visibility of the animated `Resume` border effect
  - kept it border-only and `Resume`-only
  - preserved stable button sizing in the paused state

### Pause / Resume Theme + Badge Remove
- Source: `PATCH_NOTES_PAUSE_RESUME_THEME_BADGE_REMOVE_20260331.md`
- Target: TEST
- Summary:
  - removed the `Paused` badge from Operator and Soundboard
  - retuned `Resume` styling toward OMJN blues and golds
  - kept the glow/border treatment focused on `Resume`

### Operator + Soundboard Final Polish
- Source: `PATCH_NOTES_OPERATOR_SOUNDBOARD_FINAL_POLISH_20260331.md`
- Target: TEST
- Summary:
  - rolled up Soundboard pad cleanup, active-state cleanup, and shared pause/resume polish
  - left `Resume` as the only animated shared transport state
  - finalized the shared blue/gold button treatment and pad behavior polish

## 2026-04-01

### Operator ETA Fix
- Source: `PATCH_NOTES_OPERATOR_ETA_FIX_20260401.md`
- Target: TEST
- Summary:
  - fixed the main ETA forecast path so live timed slots use actual remaining time
  - specifically corrected the current-slot forecast edge case affecting live Jamaoke timing

### Refresh Prompt
- Source: `PATCH_NOTES_REFRESH_PROMPT_20260401.md`
- Target: Root + TEST
- Summary:
  - added the shared refresh prompt driven by `site-version.json`
  - covered Operator, Viewer, Soundboard, and homepage
  - enabled already-open tabs to detect newer deployed builds

### Version Bump Script
- Source: `PATCH_NOTES_VERSION_BUMP_SCRIPT_20260401.md`
- Target: Root + TEST
- Summary:
  - added `bump-site-version.ps1`
  - automated timestamp-based version updates for `site-version.json`
  - removed the need to manually edit version fields

### Deploy Helper
- Source: `PATCH_NOTES_DEPLOY_HELPER_20260401.md`
- Target: Root
- Summary:
  - added `deploy-site.ps1`
  - combined bump, stage, commit, and push into one command
  - skipped Codex-style TEST zip and patch-note artifacts by default

## 2026-04-02

### Operator Version Header
- Source: `PATCH_NOTES_OPERATOR_VERSION_HEADER_20260402.md`
- Target: Root + TEST
- Summary:
  - added the current build/version badge next to `Operator - Queue`
  - wired the badge to the same `site-version.json` data used by the refresh prompt

### Viewer Layout Refinement
- Source: `PATCH_NOTES_VIEWER_LAYOUT_REFINEMENT_20260402.md`
- Target: TEST
- Summary:
  - optimized Viewer layout for 16:9 venue screens
  - improved long-name handling on Splash and LIVE
  - reduced dependence on browser zoom
  - made the media pane stretch more intelligently
  - added Viewer tuning controls for queue-card text, edge padding, and media-pane width

### Viewer Background / Timer Cleanup
- Source: `PATCH_NOTES_VIEWER_BACKGROUND_TIMER_CLEANUP_20260402.md`
- Target: TEST
- Summary:
  - removed the legacy custom Viewer background-image feature
  - removed the Operator-side `splashPath` input
  - kept the Viewer on the animated gradient only
  - pinned LIVE `Next Up / On Deck` to the bottom of the main card
  - reset `Hide Viewer Timer` when a new slot starts

## Suggested Next Step

If you want this tracker to become the canonical log, the next cleanup pass would be:
- keep `PATCH_HISTORY.md`
- keep long-term docs like `AUDIT_REPORT.md` and `REGRESSION_LEDGER.md`
- archive or remove the individual per-patch `PATCH_NOTES*.md` files after you confirm this tracker has the coverage you want
