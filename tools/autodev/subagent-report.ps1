param(
  [string]$SelectedTask = "NONE",
  [string]$SelectedAgent = "NONE",
  [string]$RiskLevel = "UNKNOWN",
  [string]$RiskGateResult = "UNKNOWN",
  [string]$GeneratedPromptPath = "",
  [string]$BlockedReason = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$reportsDir = Join-Path $repoRoot "tools\autodev\reports"
New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null
$reportPath = Join-Path $reportsDir ("SUBAGENT_RUN_{0}.txt" -f (Get-Date -Format "yyyyMMdd_HHmmss"))

$lines = @(
  "ANKION SUBAGENT v1 REPORT",
  "Timestamp: $(Get-Date -Format o)",
  "Selected task: $SelectedTask",
  "Selected agent: $SelectedAgent",
  "Risk level: $RiskLevel",
  "Risk gate result: $RiskGateResult",
  "Generated prompt path: $GeneratedPromptPath",
  "Blocked reason: $(if ([string]::IsNullOrWhiteSpace($BlockedReason)) { 'None' } else { $BlockedReason })",
  "Human approval required: YES"
)

Set-Content -Path $reportPath -Value $lines -Encoding UTF8
foreach ($line in $lines) { Write-Host $line }
Write-Host "SubAgent report path: $reportPath"
exit 0
