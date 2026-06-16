param(
  [string]$TaskQueuePath = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$expectedRoot = "C:\ankion"
$policyPath = Join-Path $repoRoot "tools\autodev\policy.json"
if ([string]::IsNullOrWhiteSpace($TaskQueuePath)) {
  $TaskQueuePath = Join-Path $repoRoot "tools\autodev\task-queue.json"
}
$reportsDir = Join-Path $repoRoot "tools\autodev\reports"
$promptsDir = Join-Path $repoRoot "tools\autodev\prompts"
$stateDir = Join-Path $repoRoot "tools\autodev\state"

$failures = New-Object System.Collections.Generic.List[string]
$gitAvailable = "NO"
$nameOnlyResult = "FAIL"
$statResult = "FAIL"

Write-Host "AUTODEV PREFLIGHT REPORT"
Write-Host "Repo root: $repoRoot"

if ($repoRoot -ne $expectedRoot) { $failures.Add("Script root is '$repoRoot', expected '$expectedRoot'.") }
if ((Get-Location).Path -ne $expectedRoot) { $failures.Add("Current directory is '$((Get-Location).Path)', expected '$expectedRoot'.") }

try {
  Get-Content $policyPath -Raw | ConvertFrom-Json | Out-Null
  Write-Host "Policy readable: YES"
} catch {
  Write-Host "Policy readable: NO"
  $failures.Add("PowerShell cannot read policy.json: $($_.Exception.Message)")
}

foreach ($requiredPath in @($TaskQueuePath, $reportsDir, $promptsDir, $stateDir)) {
  if (Test-Path $requiredPath) {
    Write-Host "Exists: $requiredPath"
  } else {
    Write-Host "Missing: $requiredPath"
    $failures.Add("Required path missing: $requiredPath")
  }
}

$gitCommand = Get-Command git -ErrorAction SilentlyContinue
if ($null -eq $gitCommand) {
  Write-Host "Git available: NO"
  $failures.Add("Git unavailable on PATH")
} else {
  $gitAvailable = "YES"
  Write-Host "Git available: YES"
  $nameOutput = @(& $gitCommand.Source diff --name-only 2>&1)
  if ($LASTEXITCODE -eq 0) {
    $nameOnlyResult = "PASS"
  } else {
    $failures.Add("git diff --name-only failed")
  }
  $statOutput = @(& $gitCommand.Source diff --stat 2>&1)
  if ($LASTEXITCODE -eq 0) {
    $statResult = "PASS"
  } else {
    $failures.Add("git diff --stat failed")
  }
}

Write-Host "Git diff name-only result: $nameOnlyResult"
Write-Host "Git diff stat result: $statResult"

if ($failures.Count -gt 0) {
  Write-Host "Forbidden files touched: UNKNOWN"
  Write-Host "PREFLIGHT RESULT: FAIL"
  Write-Host "Final decision: FAILED"
  Write-Host "Human approval required: YES"
  foreach ($failure in $failures) { Write-Host " - $failure" }
  exit 1
}

Write-Host "PREFLIGHT RESULT: PASS"
Write-Host "Human approval required: YES"
exit 0
