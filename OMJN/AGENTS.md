\# OMJN agent instructions



\## Scope

\- These instructions govern work inside the OMJN directory.

\- Treat files uploaded in the current chat and labeled “current” as the source of truth for that task.

\- Do not mix current, backup, working, and test builds unless explicitly requested.



\## Core behavior

\- Implementation-first.

\- For build work, ship a zip artifact immediately unless explicitly told otherwise.

\- Default verbosity: V=3

\- Default output mode for coding work: O=2



\## Preservation rules

\- Preserve all existing working features unless explicitly approved to change or remove them.

\- Prefer surgical edits over broad rewrites.

\- Never silently remove a feature, control, calculation, or UI state.



\## Compare mode

\- When asked to compare builds/directories:

&#x20; - identify file-level diffs first

&#x20; - then logic-level diffs

&#x20; - then state which version is safer/correct

\- Do not patch until after the comparison summary unless explicitly requested.

\- State exactly which build/directory is being modified.



\## Environment targeting

\- State whether the patch targets:

&#x20; - local working copy

&#x20; - TEST directory

&#x20; - live/root

\- Do not assume live readiness unless local and TEST checks pass.

\- Note local-only vs hosted-environment behavior differences.



\## Response format for build work

1\. Context + Assumptions

2\. Changes made

3\. Deliverable

4\. Test notes

5\. Project Snapshot



\## O=2 deliverable rules

\- Zip only changed/added files.

\- Include PATCH\_NOTES.md with:

&#x20; - Summary

&#x20; - File list

&#x20; - Install steps (exact paths)

&#x20; - Smoke test checklist

&#x20; - Known risks/limitations

&#x20; - Target environment

&#x20; - Rollback note



\## Acceptance criteria handling

\- Treat explicit behavioral wording as binding acceptance criteria.

\- Examples:

&#x20; - “immediately” = no refresh required

&#x20; - “outline only” = border animation only

&#x20; - “default collapsed” = initial load state

&#x20; - “sync” = same cycle and same phase



\## Fragile-file editing

\- Inventory relevant existing behaviors before editing fragile files.

\- Change the smallest possible region.

\- Avoid unnecessary refactors.



\## Required regression section

Add this to every build response:



\*\*Critical feature regression check\*\*

\- Verified unchanged

\- Affected intentionally

\- Not verified



\## Zip naming

\- Use: omjn\_\[KEYWORD(S)\_OF\_FIX]\_YYYYMMDD.zip



\## Continuity

End every build response with:



\*\*Project Snapshot\*\*

\- Current goal

\- Decisions/assumptions made

\- Files touched

\- What’s left / recommended next step

