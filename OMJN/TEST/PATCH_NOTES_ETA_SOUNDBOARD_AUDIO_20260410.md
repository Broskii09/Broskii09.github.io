# ETA + Soundboard Audio Patch Notes

## Summary
- Keeps the active changeover/transitional gap counted in queue ETA forecasts after a performer is ended and the show returns to SPLASH.
- Makes queue forecast detail text separate "current transition" time from future queued transition math.
- Hardens soundboard pad playback by retrying cached Google Drive audio blobs with a fresh download when a cached blob cannot decode.
- Improves soundboard audio unlock behavior for Chrome/Safari and reports clearer status messages for blocked audio, 0% master volume, 0% pad volume, missing URLs, fetch failures, and decode failures.

## File list
- `operator.js`
- `soundboard.js`
- `PATCH_NOTES_ETA_SOUNDBOARD_AUDIO_20260410.md`

## Install steps
1. Copy `operator.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\operator.js`.
2. Copy `soundboard.js` to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\soundboard.js`.
3. Copy this patch note to `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\PATCH_NOTES_ETA_SOUNDBOARD_AUDIO_20260410.md`.
4. Hard refresh the TEST operator and soundboard pages before smoke testing.

## Smoke test checklist
- Start a performer, then use `End -> Splash`.
- Confirm the operator estimated end time still includes the current transition while waiting for the next performer.
- Confirm queue forecast helper text can show current transition time separately from future transition math.
- Start the next performer and confirm the transition average can learn from the observed gap.
- Open the TEST soundboard page, click `Enable Audio`, then click a sound pad.
- If no sound is heard, check the soundboard status text for blocked audio, volume, download, or decode diagnostics.
- Lower master volume to 0%, click a pad, and confirm the status warns that master volume is muted.

## Known risks/limitations
- Browser autoplay rules still require a user gesture before audio can play.
- Google Drive file permissions or network failures can still prevent sounds from loading.
- The patch improves cached audio recovery, but it cannot repair an inaccessible or unsupported audio source.
- No live browser/audio-device smoke test was performed by Codex.

## Target environment
- TEST directory only: `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST`.

## Rollback note
- Restore the previous versions of `operator.js` and `soundboard.js` from git or from the last known-good zip.
