param(
  [string]$TaskQueuePath = ""
)

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

function Get-TaskRisk {
  param([object]$Task, [object]$Policy)
  $risk = ([string]$Task.riskLevel).ToUpperInvariant()
  if ($risk -in @("LOW", "MEDIUM", "HIGH")) { return $risk }
  $text = @([string]$Task.id, [string]$Task.title, [string]$Task.description, (@($Task.allowedFiles) -join " ")) -join "`n"
  foreach ($pattern in @($Policy.protectedTaskTextPatterns)) {
    if ($text -match "(?i)$([regex]::Escape($pattern))") { return "HIGH" }
  }
  if (@($Task.allowedFiles).Count -gt 1) { return "MEDIUM" }
  return "LOW"
}

function Get-TaskStatus {
  param([object]$Task)
  $status = ([string]$Task.status).ToUpperInvariant()
  if ([string]::IsNullOrWhiteSpace($status)) { return "PENDING" }
  return $status
}

function Get-LatestFilePath {
  param([string]$Directory, [string]$Filter)
  if (-not (Test-Path $Directory)) { return "" }
  $item = Get-ChildItem -Path $Directory -Filter $Filter -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if ($null -eq $item) { return "" }
  return $item.FullName
}

function Test-TaskBlocked {
  param([object]$Task, [object]$Policy)
  $risk = Get-TaskRisk -Task $Task -Policy $Policy
  if ($risk -eq "HIGH") { return "HIGH risk is blocked automatically." }
  foreach ($file in @($Task.allowedFiles)) {
    foreach ($pattern in @($Policy.forbiddenPathPatterns)) {
      if (Test-PathPattern -PathValue $file -Pattern $pattern) {
        return "$file matches forbidden pattern $pattern."
      }
    }
  }
  return ""
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
if ([string]::IsNullOrWhiteSpace($TaskQueuePath)) {
  $TaskQueuePath = Join-Path $repoRoot "tools\autodev\subagent-queue.sample.json"
}

$policy = Get-Content (Join-Path $repoRoot "tools\autodev\subagent-policy.json") -Raw | ConvertFrom-Json
$queue = Get-Content $TaskQueuePath -Raw | ConvertFrom-Json
$tasks = @($queue.tasks)

Write-Host "ANKION SUBAGENT v1 ROUTER"
Write-Host "Task queue: $TaskQueuePath"
Write-Host "Real autonomous coding enabled: $($policy.realAutonomousCodingEnabled)"
Write-Host "Recursive Codex enabled: $($policy.recursiveCodexEnabled)"
Write-Host "Human approval required: YES"

$gateOutput = & (Join-Path $PSScriptRoot "subagent-risk-gate.ps1") -TaskQueuePath $TaskQueuePath 2>&1
$gateExit = $LASTEXITCODE
foreach ($line in $gateOutput) { Write-Host ([string]$line) }
if ($gateExit -ne 0) {
  & (Join-Path $PSScriptRoot "subagent-report.ps1") -RiskGateResult "FAIL" -BlockedReason "Risk gate failed."
  exit 1
}

$selectedIndex = -1
$selectedTask = $null
$blockedHigh = New-Object System.Collections.Generic.List[string]

for ($i = 0; $i -lt $tasks.Count; $i++) {
  $task = $tasks[$i]
  if ((Get-TaskStatus -Task $task) -ne "PENDING") { continue }
  $blockedReason = Test-TaskBlocked -Task $task -Policy $policy
  if (-not [string]::IsNullOrWhiteSpace($blockedReason)) {
    if ((Get-TaskRisk -Task $task -Policy $policy) -eq "HIGH") {
      $blockedHigh.Add("$($task.id): $blockedReason")
    }
    continue
  }
  $selectedIndex = $i
  $selectedTask = $task
  break
}

foreach ($item in $blockedHigh) { Write-Host "Blocked HIGH sample: $item" }

if ($null -eq $selectedTask) {
  & (Join-Path $PSScriptRoot "subagent-report.ps1") -SelectedTask "NONE" -SelectedAgent "NONE" -RiskLevel "NONE" -RiskGateResult "PASS" -GeneratedPromptPath "" -BlockedReason "No eligible pending LOW/MEDIUM task."
  Write-Host "Selected task: NONE"
  Write-Host "SUBAGENT ROUTER RESULT: PASS"
  Write-Host "Human approval required: YES"
  exit 0
}

$risk = Get-TaskRisk -Task $selectedTask -Policy $policy
$agentType = [string]$selectedTask.agentType
Write-Host "Selected task: $($selectedTask.id)"
Write-Host "Selected agent: $agentType"
Write-Host "Risk level: $risk"

if ($risk -eq "MEDIUM" -and $selectedTask.approvedByHuman -ne $true) {
  & (Join-Path $PSScriptRoot "subagent-report.ps1") -SelectedTask $selectedTask.id -SelectedAgent $agentType -RiskLevel $risk -RiskGateResult "PASS" -GeneratedPromptPath "" -BlockedReason "MEDIUM risk requires approvedByHuman: true before prompt generation."
  Write-Host "Prompt generated: NO"
  Write-Host "SUBAGENT ROUTER RESULT: PASS"
  Write-Host "Human approval required: YES"
  exit 0
}

$promptOutput = & (Join-Path $PSScriptRoot "subagent-generate-prompt.ps1") -TaskQueuePath $TaskQueuePath -TaskIndex $selectedIndex 2>&1
$promptExit = $LASTEXITCODE
$promptPath = ""
foreach ($line in $promptOutput) {
  $lineText = [string]$line
  Write-Host $lineText
  if ($lineText -match "Prompt path: (.+)$") { $promptPath = $Matches[1] }
}
if ($promptExit -ne 0) {
  & (Join-Path $PSScriptRoot "subagent-report.ps1") -SelectedTask $selectedTask.id -SelectedAgent $agentType -RiskLevel $risk -RiskGateResult "PASS" -GeneratedPromptPath "" -BlockedReason "Prompt generation failed."
  exit 1
}
if ([string]::IsNullOrWhiteSpace($promptPath)) {
  $safeTaskId = ([string]$selectedTask.id) -replace '[^A-Za-z0-9_-]', '_'
  $promptPath = Get-LatestFilePath -Directory (Join-Path $repoRoot "tools\autodev\prompts") -Filter "SUBAGENT_PROMPT_${safeTaskId}_*.md"
}

& (Join-Path $PSScriptRoot "subagent-report.ps1") -SelectedTask $selectedTask.id -SelectedAgent $agentType -RiskLevel $risk -RiskGateResult "PASS" -GeneratedPromptPath $promptPath
Write-Host "SUBAGENT ROUTER RESULT: PASS"
Write-Host "Human approval required: YES"
exit 0
