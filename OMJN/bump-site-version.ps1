param(
  [ValidateSet("prod", "test", "both")]
  [string]$Environment = "both",

  [string]$Version
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-IsoTimestamp {
  $now = Get-Date
  return $now.ToString("yyyy-MM-ddTHH:mm:ssK")
}

function Write-Utf8NoBomJson {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $true)]
    [object]$Data
  )

  $lines = @(
    "{"
    "  ""version"": ""$($Data.version)"","
    "  ""updatedAt"": ""$($Data.updatedAt)"","
    "  ""environment"": ""$($Data.environment)"""
    "}"
  )
  $json = ($lines -join [Environment]::NewLine) + [Environment]::NewLine
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $json, $utf8NoBom)
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$timestamp = Get-IsoTimestamp
$resolvedVersion = if([string]::IsNullOrWhiteSpace($Version)){ $timestamp } else { $Version.Trim() }

$targets = @()
if($Environment -eq "prod" -or $Environment -eq "both"){
  $targets += @{
    Path = Join-Path $root "site-version.json"
    Name = "prod"
  }
}
if($Environment -eq "test" -or $Environment -eq "both"){
  $targets += @{
    Path = Join-Path (Join-Path $root "TEST") "site-version.json"
    Name = "test"
  }
}

foreach($target in $targets){
  $payload = [pscustomobject][ordered]@{
    version = $resolvedVersion
    updatedAt = $timestamp
    environment = $target.Name
  }

  Write-Utf8NoBomJson -Path $target.Path -Data $payload
  Write-Host ("Updated {0} -> version {1}" -f $target.Path, $resolvedVersion)
}
