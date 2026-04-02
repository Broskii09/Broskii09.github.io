# OMJN Versioning

## What this is for

The refresh prompt does not need a traditional app version like `1.2.3`.

It only needs a value that changes whenever you publish a new build, so already-open pages can detect:

- "this is the same build"
- or
- "a newer build was deployed"

That means a timestamp is simpler and safer here than manually tracking semantic versions.

## Why not `0.0.0`?

`0.0.0` is part of **semantic versioning**:

- `major.minor.patch`
- Example: `4.2.1`

That style is useful when you are publishing software packages and want humans to understand release significance:

- `major`: breaking changes
- `minor`: new backward-compatible features
- `patch`: bug fixes

For OMJN's refresh prompt, none of that logic is required. The site code is only checking whether the value changed.

So instead of forcing you to manage:

- `4.0.0`
- `4.0.1`
- `4.1.0`
- `5.0.0`

we use a timestamp version automatically.

## Version format used here

The bump script writes a version like:

`2026-04-01T22:45:10-05:00`

That is just an ISO-style timestamp string.

It works well because it is:

- unique enough for each deploy
- easy to read
- automatically generated
- not dependent on you remembering semver rules

## How to use it

Run the bump script before you publish a change.

From the `OMJN` folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\bump-site-version.ps1
```

That updates both:

- `site-version.json`
- `TEST\site-version.json`

If you only want one environment:

```powershell
powershell -ExecutionPolicy Bypass -File .\bump-site-version.ps1 -Environment prod
```

```powershell
powershell -ExecutionPolicy Bypass -File .\bump-site-version.ps1 -Environment test
```

## Optional manual override

If you ever really want to force a custom version string, you can:

```powershell
powershell -ExecutionPolicy Bypass -File .\bump-site-version.ps1 -Version "spring-show-hotfix"
```

That is optional. The normal workflow is to let the script generate the version for you.

## One-command deploy helper

If you want the common workflow handled in one command, use:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-site.ps1
```

That helper will:

- bump the site version
- stage repo changes
- skip Codex zip artifacts and `TEST/PATCH_NOTES*.md` by default
- create a git commit
- push the current branch

If you want to preview without committing or pushing:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-site.ps1 -DryRun
```

If you want it to commit but not push:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-site.ps1 -NoPush
```

If you want a custom commit message:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-site.ps1 -Message "Soundboard polish"
```
