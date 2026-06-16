param()

$ErrorActionPreference = "Stop"
function Convert-ToRelativeRepoPath { param([string]$PathValue) return ($PathValue -replace "\\", "/").TrimStart("/") }
function Test-PathPattern {
  param([string]$PathValue, [string]$Pattern)
  $path = Convert-ToRelativeRepoPath $PathValue
  $patternValue = Convert-ToRelativeRepoPath $Pattern
  if ($patternValue.StartsWith("**/")) { $suffix = $patternValue.Substring(3); return ($path -like $suffix -or $path -like "*/$suffix") }
  return ($path -like $patternValue)
}
function Get-FileClass {
  param([string]$PathValue, [object]$Policy)
  foreach ($pattern in $Policy.forbiddenPathPatterns) { if (Test-PathPattern -PathValue $PathValue -Pattern $pattern) { return "FORBIDDEN" } }
  $path = Convert-ToRelativeRepoPath $PathValue
  if ($path -like "tools/autodev/*" -or $path -eq "AGENTS.md") { return "SAFE_AUTODEV" }
  if ($path -like "apps/*" -or $path -like "packages/*" -or $path -like "supabase/*") { return "APP_SOURCE" }
  return "UNKNOWN"
}
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
$policy = Get-Content (Join-Path $repoRoot "tools\autodev\policy.json") -Raw | ConvertFrom-Json
$reportDir = Join-Path $repoRoot "tools\autodev\reports"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$reportPath = Join-Path $reportDir ("AUTODEV_DIFF_REVIEW_{0}.txt" -f (Get-Date -Format "yyyyMMdd_HHmmss"))
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("AUTODEV DIFF REVIEW REPORT")
$lines.Add("Timestamp: $(Get-Date -Format o)")
$gitCommand = Get-Command git -ErrorAction SilentlyContinue
if ($null -eq $gitCommand) {
  $lines.Add("Git available: NO")
  $lines.Add("Diff review result: FAIL")
  $lines.Add("Forbidden files touched: UNKNOWN")
  Set-Content -Path $reportPath -Value $lines -Encoding UTF8
  Write-Host "Diff review report: $reportPath"
  Write-Host "DIFF REVIEW RESULT: FAIL"
  Write-Host "Forbidden files touched: UNKNOWN"
  exit 1
}
$lines.Add("Git available: YES")
$nameOutput = @(& $gitCommand.Source diff --name-only 2>&1)
if ($LASTEXITCODE -ne 0) {
  $lines.Add("git diff --name-only: FAIL")
  foreach ($line in $nameOutput) { $lines.Add([string]$line) }
  $lines.Add("Diff review result: FAIL")
  $lines.Add("Forbidden files touched: UNKNOWN")
  Set-Content -Path $reportPath -Value $lines -Encoding UTF8
  Write-Host "Diff review report: $reportPath"
  Write-Host "DIFF REVIEW RESULT: FAIL"
  Write-Host "Forbidden files touched: UNKNOWN"
  exit 1
}
$statOutput = @(& $gitCommand.Source diff --stat 2>&1)
if ($LASTEXITCODE -ne 0) {
  $lines.Add("git diff --stat: FAIL")
  foreach ($line in $statOutput) { $lines.Add([string]$line) }
  $lines.Add("Diff review result: FAIL")
  $lines.Add("Forbidden files touched: UNKNOWN")
  Set-Content -Path $reportPath -Value $lines -Encoding UTF8
  Write-Host "Diff review report: $reportPath"
  Write-Host "DIFF REVIEW RESULT: FAIL"
  Write-Host "Forbidden files touched: UNKNOWN"
  exit 1
}
$hasForbidden = $false
$hasUnknown = $false
$lines.Add("Changed files:")
foreach ($file in @($nameOutput | Where-Object { $_ -and $_.Trim() })) {
  $class = Get-FileClass -PathValue $file -Policy $policy
  if ($class -eq "FORBIDDEN") { $hasForbidden = $true }
  if ($class -eq "UNKNOWN") { $hasUnknown = $true }
  $lines.Add("- [$class] $file")
}
$lines.Add("Diff stat:")
foreach ($line in $statOutput) { $lines.Add([string]$line) }
if ($hasForbidden -or $hasUnknown) {
  $lines.Add("Diff review result: FAIL")
  $lines.Add("Forbidden files touched: $(if ($hasForbidden) { 'YES' } else { 'NO' })")
  Set-Content -Path $reportPath -Value $lines -Encoding UTF8
  Write-Host "Diff review report: $reportPath"
  Write-Host "DIFF REVIEW RESULT: FAIL"
  Write-Host "Forbidden files touched: $(if ($hasForbidden) { 'YES' } else { 'NO' })"
  exit 1
}
$lines.Add("Diff review result: PASS")
$lines.Add("Forbidden files touched: NO")
Set-Content -Path $reportPath -Value $lines -Encoding UTF8
Write-Host "Diff review report: $reportPath"
Write-Host "DIFF REVIEW RESULT: PASS"
Write-Host "Forbidden files touched: NO"
exit 0
