[CmdletBinding()]
param(
  [ValidateSet("prod", "test", "both")]
  [string]$Environment = "both",

  [string]$Message,

  [switch]$NoPush,

  [switch]$IncludeArtifacts,

  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Label,

    [Parameter(Mandatory = $true)]
    [scriptblock]$Action
  )

  Write-Host ("==> {0}" -f $Label)
  & $Action
  if($LASTEXITCODE -ne 0){
    throw ("Step failed: {0}" -f $Label)
  }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
$commitMessage = if([string]::IsNullOrWhiteSpace($Message)){
  "Deploy $Environment update $timestamp"
}else{
  $Message.Trim()
}

$addArgs = @("add", "-A", "--", ".")
if(-not $IncludeArtifacts){
  $addArgs += @(
    ":(exclude)TEST/*.zip",
    ":(exclude)TEST/PATCH_NOTES*.md"
  )
}

Push-Location $root
try{
  if($DryRun){
    Write-Host "==> Dry run mode"
    Write-Host ("Would bump site version for: {0}" -f $Environment)
    Write-Host ("Would commit with message: {0}" -f $commitMessage)
    if($NoPush){
      Write-Host "Would stop after commit because -NoPush was provided."
    }else{
      Write-Host "Would push after commit."
    }
    Write-Host ""
    Write-Host "Git status preview:"
    & git status --short
    if($LASTEXITCODE -ne 0){
      throw "Could not read git status."
    }
    Write-Host ""
    Write-Host "Files that would be staged:"
    & git @("add", "-n", "-A", "--", ".") @($addArgs | Select-Object -Skip 4)
    if($LASTEXITCODE -ne 0){
      throw "Could not preview staged files."
    }
    return
  }

  Invoke-Checked -Label "Bump site version" -Action {
    & (Join-Path $root "bump-site-version.ps1") -Environment $Environment
  }

  Invoke-Checked -Label "Stage deploy files" -Action {
    & git @addArgs
  }

  $staged = @(& git diff --cached --name-only)
  if($LASTEXITCODE -ne 0){
    throw "Could not inspect staged files."
  }
  if(-not $staged -or $staged.Count -eq 0){
    throw "No staged changes to commit."
  }

  Write-Host "==> Staged files"
  $staged | ForEach-Object { Write-Host ("  {0}" -f $_) }

  Invoke-Checked -Label "Create commit" -Action {
    & git commit -m $commitMessage
  }

  if(-not $NoPush){
    Invoke-Checked -Label "Push branch" -Action {
      & git push
    }
  }else{
    Write-Host "==> Push skipped (-NoPush)"
  }

  Write-Host ""
  Write-Host "Deploy helper finished."
  Write-Host ("Commit message: {0}" -f $commitMessage)
}finally{
  Pop-Location
}
