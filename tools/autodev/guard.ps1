param()

$ErrorActionPreference = "Stop"

function Convert-ToRelativeRepoPath {
  param([string]$PathValue)
  return ($PathValue -replace "\\", "/").TrimStart("/")
}

function Test-PathPattern {
  param([string]$PathValue, [string]$Pattern)
  $path = Convert-ToRelativeRepoPath $PathValue
  $patternValue = Convert-ToRelativeRepoPath $Pattern
  if ($patternValue.StartsWith("**/")) {
    $suffix = $patternValue.Substring(3)
    return ($path -like $suffix -or $path -like "*/$suffix")
  }
  return ($path -like $patternValue)
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
$policy = Get-Content (Join-Path $repoRoot "tools\autodev\policy.json") -Raw | ConvertFrom-Json
$changedFiles = @()
$violations = @()
$gitCommand = Get-Command git -ErrorAction SilentlyContinue

Write-Host "AUTODEV GUARD REPORT"
Write-Host "Repo root: $repoRoot"

if ($null -eq $gitCommand) {
  Write-Host "Git available: NO"
  Write-Host "Git diff name-only result: FAIL"
  Write-Host "Git diff stat result: FAIL"
  Write-Host "Forbidden files touched: UNKNOWN"
  Write-Host "GUARD RESULT: FAIL"
  Write-Host "Independent diff verification is unavailable: Git unavailable on PATH."
  exit 1
}

Write-Host "Git available: YES"
$diffNameOutput = @(& $gitCommand.Source diff --name-only 2>&1)
$diffNameExit = $LASTEXITCODE
if ($diffNameExit -ne 0) {
  Write-Host "Git diff name-only result: FAIL"
  Write-Host "Git diff stat result: FAIL"
  Write-Host "Forbidden files touched: UNKNOWN"
  Write-Host "GUARD RESULT: FAIL"
  Write-Host "Independent diff verification is unavailable: git diff --name-only failed with exit code $diffNameExit."
  foreach ($line in $diffNameOutput) { Write-Host $line }
  exit 1
}
Write-Host "Git diff name-only result: PASS"
$changedFiles = @($diffNameOutput | Where-Object { $_ -and $_.Trim() })

$diffStatOutput = @(& $gitCommand.Source diff --stat 2>&1)
$diffStatExit = $LASTEXITCODE
if ($diffStatExit -ne 0) {
  Write-Host "Git diff stat result: FAIL"
  Write-Host "Forbidden files touched: UNKNOWN"
  Write-Host "GUARD RESULT: FAIL"
  Write-Host "Independent diff verification is unavailable: git diff --stat failed with exit code $diffStatExit."
  foreach ($line in $diffStatOutput) { Write-Host $line }
  exit 1
}
Write-Host "Git diff stat result: PASS"
Write-Host "Changed files: $($changedFiles.Count)"
foreach ($file in $changedFiles) { Write-Host " - $file" }

foreach ($file in $changedFiles) {
  foreach ($pattern in $policy.forbiddenPathPatterns) {
    if (Test-PathPattern -PathValue $file -Pattern $pattern) { $violations += "$file matches $pattern" }
  }
}
if ($changedFiles.Count -gt [int]$policy.maxFilesChanged) {
  $violations += "Changed file count $($changedFiles.Count) exceeds maxFilesChanged $($policy.maxFilesChanged)."
}
if ($violations.Count -gt 0) {
  Write-Host "Forbidden files touched: YES"
  Write-Host "GUARD RESULT: FAIL"
  foreach ($violation in $violations) { Write-Host " - $violation" }
  exit 1
}
Write-Host "Forbidden files touched: NO"
Write-Host "GUARD RESULT: PASS"
exit 0
