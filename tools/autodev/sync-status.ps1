param()

$ErrorActionPreference = "Stop"

function Get-LatestFilePath {
  param([string]$Directory, [string]$Filter)
  if (-not (Test-Path $Directory)) { return "" }
  $item = Get-ChildItem -Path $Directory -Filter $Filter -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if ($null -eq $item) { return "" }
  return $item.FullName
}

function Get-ReportValue {
  param([string]$ReportText, [string]$Label, [string]$Default = "UNKNOWN")
  if ([string]::IsNullOrWhiteSpace($ReportText)) { return $Default }
  $pattern = "(?m)^" + [regex]::Escape($Label) + ":\s*(.+)$"
  $match = [regex]::Match($ReportText, $pattern)
  if ($match.Success) { return $match.Groups[1].Value.Trim() }
  return $Default
}


function Write-JsonArrayFile {
  param([string]$Path, [object]$Items)
  $array = @()
  foreach ($item in $Items) { $array += $item }
  if ($array.Count -eq 0) {
    Set-Content -Path $Path -Value "[]" -Encoding UTF8
  } elseif ($array.Count -eq 1) {
    $json = $array[0] | ConvertTo-Json -Depth 8
    Set-Content -Path $Path -Value ("[`r`n$json`r`n]") -Encoding UTF8
  } else {
    $array | ConvertTo-Json -Depth 8 | Set-Content -Path $Path -Encoding UTF8
  }
}
function Write-JsonFile {
  param([string]$Path, [object]$Value)
  $Value | ConvertTo-Json -Depth 8 | Set-Content -Path $Path -Encoding UTF8
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
$policyPath = Join-Path $repoRoot "tools\autodev\policy.json"
$reportsDir = Join-Path $repoRoot "tools\autodev\reports"
$promptsDir = Join-Path $repoRoot "tools\autodev\prompts"
$stateDir = Join-Path $repoRoot "tools\autodev\state"
New-Item -ItemType Directory -Force -Path $reportsDir,$promptsDir,$stateDir | Out-Null

$version = "UNKNOWN"
if (Test-Path $policyPath) {
  try { $version = (Get-Content $policyPath -Raw | ConvertFrom-Json).version } catch { $version = "UNKNOWN" }
}

$gitCommand = Get-Command git -ErrorAction SilentlyContinue
$gitAvailable = ($null -ne $gitCommand)
$latestRunReportPath = Get-LatestFilePath -Directory $reportsDir -Filter "AUTODEV_RUN_*.txt"
$latestValidationReportPath = Get-LatestFilePath -Directory $reportsDir -Filter "AUTODEV_VALIDATE_*.txt"
$latestPromptPath = Get-LatestFilePath -Directory $promptsDir -Filter "CODEX_PROMPT_*.md"
$runText = ""
if (-not [string]::IsNullOrWhiteSpace($latestRunReportPath)) { $runText = Get-Content $latestRunReportPath -Raw }

$validationResult = Get-ReportValue -ReportText $runText -Label "Validation result" -Default "UNKNOWN"
$guardResult = Get-ReportValue -ReportText $runText -Label "Guard result" -Default "UNKNOWN"
$diffReviewResult = Get-ReportValue -ReportText $runText -Label "Diff review result" -Default "UNKNOWN"
$forbiddenFilesTouched = Get-ReportValue -ReportText $runText -Label "Forbidden files touched" -Default "UNKNOWN"
$protectedFilesTouched = Get-ReportValue -ReportText $runText -Label "Package/lockfile/env/Supabase/Auth/RLS/APK/native touched" -Default "UNKNOWN"
$finalDecision = Get-ReportValue -ReportText $runText -Label "Final decision" -Default "UNKNOWN"

$currentMode = "SYNC_ONLY"
$currentStatus = if ($gitAvailable -and $finalDecision -eq "PASS") { "READY_FOR_HUMAN_REVIEW" } elseif ($gitAvailable) { "NEEDS_HUMAN_REVIEW" } else { "BLOCKED" }
$stopReason = if ($gitAvailable) { "HUMAN_APPROVAL_REQUIRED" } else { "Git unavailable on PATH" }
$safeNextAction = if ($gitAvailable) { "Review latest AUTODEV reports and approve or reject the next safe action." } else { "Install Git for Windows or add Git to PATH, then rerun preflight." }
$finalRecommendation = if ($gitAvailable) { "REVIEW REPORTS BEFORE ANY AUTONOMOUS CODING." } else { "DO NOT ENABLE AUTONOMOUS CODING. FIX GIT PATH FIRST." }
$appSourceModified = if ($gitAvailable) { "UNKNOWN" } else { "UNKNOWN" }
if (-not $gitAvailable) {
  $forbiddenFilesTouched = "UNKNOWN"
  $protectedFilesTouched = "UNKNOWN"
}

$heartbeat = [ordered]@{
  timestamp = (Get-Date -Format o)
  repoRoot = $repoRoot
  gitAvailable = $gitAvailable
  lastRunReportPath = $latestRunReportPath
  lastValidationReportPath = $latestValidationReportPath
  lastPromptPath = $latestPromptPath
  currentMode = $currentMode
  currentStatus = $currentStatus
  stopReason = $stopReason
  humanApprovalRequired = $true
}
Write-JsonFile -Path (Join-Path $stateDir "heartbeat.json") -Value $heartbeat

$questions = New-Object System.Collections.Generic.List[string]
if (-not $gitAvailable) {
  $questions.Add("Git is unavailable on PATH. Should AUTODEV remain blocked until Git is fixed?")
}
Write-JsonArrayFile -Path (Join-Path $stateDir "questions.json") -Items $questions

$blockers = New-Object System.Collections.Generic.List[object]
if (-not $gitAvailable) {
  $blockers.Add([ordered]@{
    code = "GIT_UNAVAILABLE"
    severity = "BLOCKER"
    message = "AUTODEV cannot verify diffs because git is unavailable on PATH."
    safeNextAction = "Install Git for Windows or add Git to PATH, then rerun preflight."
  })
}
Write-JsonArrayFile -Path (Join-Path $stateDir "blockers.json") -Items $blockers

$decisions = New-Object System.Collections.Generic.List[object]
$decisions.Add([ordered]@{
  id = "DECIDE-GIT-PATH-001"
  title = "Fix Git PATH before autonomous coding"
  status = "PENDING"
  requiredBefore = "REAL_AUTONOMOUS_CODING"
})
Write-JsonArrayFile -Path (Join-Path $stateDir "decisions.json") -Items $decisions

$handoffPath = Join-Path $stateDir "LATEST_HANDOFF.md"
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# ANKION AUTODEV v2.1 Latest Handoff")
$lines.Add("")
$lines.Add("AUTODEV version: $version")
$lines.Add("Timestamp: $(Get-Date -Format o)")
$lines.Add("Repo root: $repoRoot")
$lines.Add("")
$lines.Add("## Git Status")
$lines.Add("Git available: $(if ($gitAvailable) { 'YES' } else { 'NO' })")
$lines.Add("")
$lines.Add("## Latest Paths")
$lines.Add("Latest run report: $latestRunReportPath")
$lines.Add("Latest validation report: $latestValidationReportPath")
$lines.Add("Latest generated prompt: $latestPromptPath")
$lines.Add("")
$lines.Add("## Latest Results")
$lines.Add("Validation result: $validationResult")
$lines.Add("Guard result: $guardResult")
$lines.Add("Diff review result: $diffReviewResult")
$lines.Add("Forbidden files touched: $forbiddenFilesTouched")
$lines.Add("Package/lockfile/env/Supabase/Auth/RLS/APK/native touched: $protectedFilesTouched")
$lines.Add("App source modified: $appSourceModified")
$lines.Add("")
$lines.Add("## Blockers")
if ($blockers.Count -eq 0) { $lines.Add("- None recorded") } else { foreach ($b in $blockers) { $lines.Add("- [$($b.severity)] $($b.code): $($b.message) Safe next action: $($b.safeNextAction)") } }
$lines.Add("")
$lines.Add("## Questions")
if ($questions.Count -eq 0) { $lines.Add("- None") } else { foreach ($q in $questions) { $lines.Add("- $q") } }
$lines.Add("")
$lines.Add("## Decisions Needed")
foreach ($d in $decisions) { $lines.Add("- $($d.id): $($d.title) [$($d.status)] required before $($d.requiredBefore)") }
$lines.Add("")
$lines.Add("## Safe Next Action")
$lines.Add($safeNextAction)
$lines.Add("")
$lines.Add("## Final Recommendation")
$lines.Add($finalRecommendation)
$lines.Add("")
$lines.Add("Human approval required: YES")
Set-Content -Path $handoffPath -Value $lines -Encoding UTF8

Write-Host "SYNC STATUS RESULT: PASS"
Write-Host "Git available: $(if ($gitAvailable) { 'YES' } else { 'NO' })"
Write-Host "Heartbeat path: $(Join-Path $stateDir 'heartbeat.json')"
Write-Host "Latest handoff path: $handoffPath"
Write-Host "Forbidden files touched: $forbiddenFilesTouched"
Write-Host "Package/lockfile/env/Supabase/Auth/RLS/APK/native touched: $protectedFilesTouched"
Write-Host "Human approval required: YES"
exit 0



