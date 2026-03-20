# REGRESSION_LEDGER

Verified target baseline features
- Combined Pause/Resume button
- PAUSED badge inside the button
- Hide/Show Viewer Timer button
- Viewer timer + progress toggle wiring
- Viewer PAUSED chip
- 5-minute changeover buffer in ETA / Estimated End
- Jamaoke slot type
- Sponsor default logo URL
- Intermission live/top-next behavior
- Adaptive Viewer name fitting (preserved)
- Crowd Prompt editor Save & Close behavior

Browser-only checks to re-run
- Pause/Resume button does not shift surrounding controls
- Viewer timer/progress hide/show is immediate
- Jamaoke hides timer/progress on Viewer
- Intermission Go Live / Arm Next starts at the correct time
- Sponsor bug default asset loads from ./assets/InSeitz Media Logo.png

Known non-app console noise
- “A listener indicated an asynchronous response...” is most likely extension-related, not app logic.
