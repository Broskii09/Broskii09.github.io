# PATCH NOTES - Version Bump Script

## Summary

Adds an automated version bump script so OMJN no longer requires manual edits to `site-version.json`.

The script updates the live/root `OMJN` version file and the `OMJN/TEST` version file by default. It writes a fresh ISO timestamp string to `version` and `updatedAt`, which is enough for the refresh prompt to detect that a newer build exists.

## File list

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\bump-site-version.ps1`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\VERSIONING.md`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\site-version.json`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\site-version.json`

## Install steps

1. Add these files to these exact paths:
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\bump-site-version.ps1`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\VERSIONING.md`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\site-version.json`
   - `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST\site-version.json`
2. Before each deploy/publish, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\bump-site-version.ps1
```

3. Publish the updated files as usual.

## Smoke test checklist

- Run the bump script once.
- Confirm both `site-version.json` files get a fresh timestamp version.
- Open the hosted site in a browser tab.
- Run the bump script again and publish the changed version file.
- Confirm the refresh prompt appears on already-open pages.

## Known risks / limitations

- This uses timestamp-based versions, not semantic versions.
- If you forget to run the bump script before publishing, already-open pages will not know a new build exists.
- The script is PowerShell-based, so it is intended for your current Windows workflow.

## Target environment

- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN`
- `c:\Users\brosk\Desktop\OMJN\github\Broskii09.github.io\OMJN\TEST`

## Rollback note

To roll back, delete `bump-site-version.ps1` and restore the previous `site-version.json` files.
