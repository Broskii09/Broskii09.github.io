# PATCH NOTES - Deploy Helper

## Summary

Adds a one-command deploy helper for OMJN.

The helper:

- bumps the site version automatically
- stages repo changes
- skips Codex zip artifacts and `TEST/PATCH_NOTES*.md` by default
- commits the changes
- pushes the current branch

It also supports:

- `-DryRun` to preview
- `-NoPush` to stop after commit
- `-Message` for a custom commit message

## File list

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\deploy-site.ps1`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\VERSIONING.md`

## Install steps

1. Add these files to these exact paths:
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\deploy-site.ps1`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\VERSIONING.md`
2. Confirm the existing dependency is present:
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\bump-site-version.ps1`
3. From the `OMJN` folder, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-site.ps1
```

## Smoke test checklist

- Run `powershell -ExecutionPolicy Bypass -File .\deploy-site.ps1 -DryRun`
- Confirm the preview shows the intended commit/push workflow.
- Run `powershell -ExecutionPolicy Bypass -File .\deploy-site.ps1 -NoPush`
- Confirm a commit is created locally and the version file was bumped.
- Confirm `TEST/*.zip` and `TEST/PATCH_NOTES*.md` were not staged unless explicitly wanted.

## Known risks / limitations

- By default it stages current repo changes, so if you have unrelated edits in the repo they may be included.
- It intentionally excludes `TEST/*.zip` and `TEST/PATCH_NOTES*.md` because those are usually agent artifacts, not deployable site files.
- The helper assumes your normal workflow is to deploy from the current branch.

## Target environment

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN`

## Rollback note

Delete `deploy-site.ps1` and remove the new VERSIONING doc section if you no longer want the helper.
