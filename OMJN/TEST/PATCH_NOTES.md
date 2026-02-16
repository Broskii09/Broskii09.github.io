# PATCH_NOTES

## Summary
- Quick Add no longer silently defaults slot type to **Musician**.
- Added a placeholder “Select slot type…” and a gentle prompt (focus + nudge + hint) when attempting to Quick Add without choosing a type.
- Added an optional **Sticky** toggle to keep your last slot type selection for rapid entry.
- Profile defaults still apply for media, but **won’t overwrite an explicit operator slot type selection** during Quick Add.

## File list
- operator.html
- operator.js

## Install steps (exact paths)
Replace these files in your project with the versions from this zip:
- `/operator.html`
- `/operator.js`

## Smoke test checklist
Local test:
1. Operator → Quick Add: type a name, press Enter with Slot Type unselected → should prompt to select a slot type (no performer added).
2. Select a type (e.g., Comedian 10m), Quick Add a performer → performer added with that type.
3. Sticky OFF: after adding, Slot Type should reset back to placeholder.
4. Sticky ON: select a type, add multiple performers → Slot Type should remain selected.
5. Existing performer profile: select a different type than their profile default → added slot should respect the operator’s selected type.

Internet-side test (TEST dir):
1. Repeat the above with your TEST deployment to confirm no path/BASE_PATH differences affect Quick Add behavior.

## Known risks / limitations
- Native `<select>` elements cannot be reliably “auto-opened” by script across browsers; the prompt focuses and nudges the control instead.
