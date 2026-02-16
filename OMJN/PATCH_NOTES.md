# PATCH_NOTES

## Summary
- Quick Add Slot Type now defaults to a placeholder (“- CHOOSE A SLOT -”) on page load/refresh (no more auto-default to Musician).
- Prevents adding a performer unless a Slot Type is chosen; focuses the Slot Type dropdown and briefly highlights it.

## Files changed
- operator.js
- app.css

## Install steps
1. Replace these files in your OMJN directory (or TEST directory):
   - operator.js
   - app.css
2. Hard refresh the Operator page (Ctrl+F5) to clear cached JS/CSS.

## Smoke test checklist
- Load Operator → Slot Type shows “- CHOOSE A SLOT -”.
- Type a performer name and press Enter without selecting Slot Type → no slot added; Slot Type field highlights/focuses.
- Select “Comedian (5m)” (or any type) → add performer → correct type/minutes applied.
- Change state (start/pause/etc.) → Slot Type selection should not reset unexpectedly.
