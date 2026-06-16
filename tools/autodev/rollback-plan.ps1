param()

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
$reportDir = Join-Path $repoRoot "tools\autodev\reports"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$reportPath = Join-Path $reportDir ("AUTODEV_ROLLBACK_PLAN_{0}.txt" -f (Get-Date -Format "yyyyMMdd_HHmmss"))
$gitCommand = Get-Command git -ErrorAction SilentlyContinue
$changed = @()
if ($null -ne $gitCommand) { $changed = @(& $gitCommand.Source diff --name-only 2>$null | Where-Object { $_ -and $_.Trim() }) }
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("AUTODEV ROLLBACK INSTRUCTION REPORT")
$lines.Add("Timestamp: $(Get-Date -Format o)")
$lines.Add("No rollback command was executed.")
$lines.Add("")
$lines.Add("Changed files list:")
foreach ($file in $changed) { $lines.Add("- $file") }
if ($changed.Count -eq 0) { $lines.Add("- UNKNOWN or none reported by git diff --name-only") }
$lines.Add("")
$lines.Add("Suggested manual review command examples:")
$lines.Add("git diff --name-only")
$lines.Add("git diff --stat")
$lines.Add("git diff")
$lines.Add("")
$lines.Add("Suggested manual restore command examples, only after user approval:")
$lines.Add("git restore -- <path>")
$lines.Add("git restore --staged -- <path>")
$lines.Add("")
$lines.Add("WARNING: User approval is required before any restore or rollback action.")
Set-Content -Path $reportPath -Value $lines -Encoding UTF8
Write-Host "Rollback plan report: $reportPath"
exit 0
