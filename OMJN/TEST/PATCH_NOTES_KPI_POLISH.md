# Summary
Polished the Operator KPI bar to make Estimated End the primary schedule metric and to give all KPI items a cleaner, more professional card treatment.

# File list
- operator.html
- app.css

# Install steps
1. Replace `/operator.html` with the patched file.
2. Replace `/app.css` with the patched file.
3. Hard refresh the Operator page to ensure the updated KPI styles load.

# Smoke test checklist
- Confirm the Live Control KPI bar renders as five distinct cards.
- Confirm **Estimated End** is visually emphasized compared with the other KPIs.
- Confirm KPI values still update normally with no missing text.
- Check layout at narrow widths to confirm cards wrap cleanly.
- Confirm no other Live Control controls shifted or broke.

# Known risks / limitations
- This patch is presentation-only; it does not change ETA math or KPI data logic.
- Long performer names in Current/Next are still governed by the existing KPI content width; this patch only improves layout and emphasis.
