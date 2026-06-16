param(
  [string]$RunId,
  [string]$TaskId = "NONE",
  [string]$TaskTitle = "NONE",
  [string]$GitAvailable = "NO",
  [string]$PreflightResult = "FAIL",
  [string]$PromptGenerated = "NO",
  [string]$PromptPath = "",
  [string]$ValidationResult = "NOT RUN",
  [string]$GuardResult = "NOT RUN",
  [string]$DiffReviewResult = "NOT RUN",
  [string]$ForbiddenFilesTouched = "UNKNOWN",
  [string]$ProtectedFilesTouched = "UNKNOWN",
  [string]$FinalDecision = "FAILED"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$reportDir = Join-Path $repoRoot "tools\autodev\reports"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
if ([string]::IsNullOrWhiteSpace($RunId)) { $RunId = "AUTODEV_RUN_$(Get-Date -Format 'yyyyMMdd_HHmmss')" }
$reportPath = Join-Path $reportDir "$RunId.txt"
$lines = @(
  "AUTODEV v2 FINAL REPORT",
  "Run id: $RunId",
  "Timestamp: $(Get-Date -Format o)",
  "Git available: $GitAvailable",
  "Task id: $TaskId",
  "Task title: $TaskTitle",
  "Preflight result: $PreflightResult",
  "Prompt generated: $PromptGenerated",
  "Prompt path: $PromptPath",
  "Validation result: $ValidationResult",
  "Guard result: $GuardResult",
  "Diff review result: $DiffReviewResult",
  "Forbidden files touched: $ForbiddenFilesTouched",
  "Package/lockfile/env/Supabase/Auth/RLS/APK/native touched: $ProtectedFilesTouched",
  "Human approval required: YES",
  "Final decision: $FinalDecision",
  "HUMAN APPROVAL REQUIRED"
)
Set-Content -Path $reportPath -Value $lines -Encoding UTF8
Write-Host "Final report: $reportPath"
exit 0
