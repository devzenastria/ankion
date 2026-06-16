param(
  [string]$TaskQueuePath = ""
)

$ErrorActionPreference = "Stop"

function Convert-ToRelativeRepoPath { param([string]$PathValue) return ($PathValue -replace "\\", "/").TrimStart("/") }
function Test-PathPattern {
  param([string]$PathValue, [string]$Pattern)
  $path = Convert-ToRelativeRepoPath $PathValue
  $patternValue = Convert-ToRelativeRepoPath $Pattern
  if ($patternValue.StartsWith("**/")) { $suffix = $patternValue.Substring(3); return ($path -like $suffix -or $path -like "*/$suffix") }
  return ($path -like $patternValue)
}
function Test-ForbiddenTaskText {
  param([object]$Task)
  $requestText = @([string]$Task.id, [string]$Task.title, [string]$Task.mode, [string]$Task.description, [string]$Task.expectedOutcome) -join "`n"
  return ($requestText -match "(?i)(apk|gradle|emulator|adb|supabase|auth|rls|package\.json|pnpm-lock|deploy|push|release|publish|commit|eas|android|ios|payment|monetization|storage|dependencies|production deployment)")
}
function Test-ProtectedOutput {
  param([string]$TextValue)
  if ($TextValue -match "Forbidden files touched: (YES|NO|UNKNOWN)") { return $Matches[1] }
  return $null
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
$policyPath = Join-Path $repoRoot "tools\autodev\policy.json"
$policy = Get-Content $policyPath -Raw | ConvertFrom-Json
if ([string]::IsNullOrWhiteSpace($TaskQueuePath)) { $TaskQueuePath = Join-Path $repoRoot "tools\autodev\task-queue.json" }
$runId = "AUTODEV_RUN_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

$gitAvailable = "NO"
$preflightResult = "FAIL"
$promptGenerated = "NO"
$promptPath = ""
$validationResult = "NOT RUN"
$guardResult = "NOT RUN"
$diffReviewResult = "NOT RUN"
$forbiddenFilesTouched = "UNKNOWN"
$protectedFilesTouched = "UNKNOWN"
$finalDecision = "FAILED"
$taskId = "NONE"
$taskTitle = "NONE"
$failed = $false

$preflightOutput = & (Join-Path $PSScriptRoot "preflight.ps1") -TaskQueuePath $TaskQueuePath 2>&1
$preflightExit = $LASTEXITCODE
foreach ($line in $preflightOutput) {
  $lineText = [string]$line
  Write-Host $lineText
  if ($lineText -match "Git available: YES") { $gitAvailable = "YES" }
  if ($lineText -match "Git available: NO") { $gitAvailable = "NO" }
  $forbiddenValue = Test-ProtectedOutput -TextValue $lineText
  if ($null -ne $forbiddenValue) { $forbiddenFilesTouched = $forbiddenValue }
}
if ($preflightExit -eq 0) { $preflightResult = "PASS" } else { $failed = $true }

try {
  $queue = Get-Content $TaskQueuePath -Raw | ConvertFrom-Json
  $tasks = @($queue.tasks)
} catch {
  $tasks = @()
  $failed = $true
}

if ($tasks.Count -eq 0) {
  $failed = $true
} else {
  $task = $tasks[0]
  $taskId = [string]$task.id
  $taskTitle = [string]$task.title
  if ($task.riskLevel -eq "HIGH") { $failed = $true }
  if ($task.riskLevel -eq "MEDIUM") { $failed = $true }
  if (@($policy.allowedRiskLevels) -notcontains $task.riskLevel) { $failed = $true }
  foreach ($allowedFile in @($task.allowedFiles)) {
    foreach ($forbiddenPattern in $policy.forbiddenPathPatterns) {
      if (Test-PathPattern -PathValue $allowedFile -Pattern $forbiddenPattern) { $failed = $true }
    }
  }
  if (Test-ForbiddenTaskText -Task $task) { $failed = $true }
  if ((@($task.validation) -join "`n") -ne (@($policy.allowedValidationCommands) -join "`n")) { $failed = $true }
  if ($task.requiresHumanApproval -ne $true -or $policy.requireHumanApproval -ne $true) { $failed = $true }

  if (-not $failed -and $preflightResult -eq "PASS") {
    $promptOutput = & (Join-Path $PSScriptRoot "generate-codex-prompt.ps1") -TaskQueuePath $TaskQueuePath -TaskIndex 0 2>&1
    $promptExit = $LASTEXITCODE
    foreach ($line in $promptOutput) {
      $lineText = [string]$line
      Write-Host $lineText
      if ($lineText -match "Prompt generated: YES") { $promptGenerated = "YES" }
      if ($lineText -match "Prompt path: (.+)$") { $promptPath = $Matches[1] }
    }
    if ($promptExit -ne 0) { $failed = $true }
  }
}

if (-not $failed -and $preflightResult -eq "PASS") {
  $validateOutput = & (Join-Path $PSScriptRoot "validate.ps1") 2>&1
  $validateExit = $LASTEXITCODE
  foreach ($line in $validateOutput) { Write-Host ([string]$line) }
  $validationResult = if ($validateExit -eq 0) { "PASS" } else { "FAIL" }
  if ($validateExit -ne 0) { $failed = $true }
} elseif ($preflightResult -eq "FAIL") {
  $validationResult = "FAIL"
  Write-Host "Validation skipped: Git diff verification is unavailable or preflight failed."
}

$guardOutput = & (Join-Path $PSScriptRoot "guard.ps1") 2>&1
$guardExit = $LASTEXITCODE
foreach ($line in $guardOutput) {
  $lineText = [string]$line
  Write-Host $lineText
  $forbiddenValue = Test-ProtectedOutput -TextValue $lineText
  if ($null -ne $forbiddenValue) { $forbiddenFilesTouched = $forbiddenValue }
}
$guardResult = if ($guardExit -eq 0) { "PASS" } else { "FAIL" }
if ($guardExit -ne 0) { $failed = $true }

$diffOutput = & (Join-Path $PSScriptRoot "review-diff.ps1") 2>&1
$diffExit = $LASTEXITCODE
foreach ($line in $diffOutput) {
  $lineText = [string]$line
  Write-Host $lineText
  $forbiddenValue = Test-ProtectedOutput -TextValue $lineText
  if ($null -ne $forbiddenValue) { $forbiddenFilesTouched = $forbiddenValue }
}
$diffReviewResult = if ($diffExit -eq 0) { "PASS" } else { "FAIL" }
if ($diffExit -ne 0) { $failed = $true }

if ($forbiddenFilesTouched -eq "YES") { $protectedFilesTouched = "YES" }
elseif ($forbiddenFilesTouched -eq "NO") { $protectedFilesTouched = "NO" }
else { $protectedFilesTouched = "UNKNOWN" }

if (-not $failed -and $preflightResult -eq "PASS" -and $promptGenerated -eq "YES" -and $validationResult -eq "PASS" -and $guardResult -eq "PASS" -and $diffReviewResult -eq "PASS" -and $forbiddenFilesTouched -eq "NO") {
  $finalDecision = "PASS"
} else {
  $finalDecision = "FAILED"
}

$reportOutput = & (Join-Path $PSScriptRoot "report.ps1") -RunId $runId -TaskId $taskId -TaskTitle $taskTitle -GitAvailable $gitAvailable -PreflightResult $preflightResult -PromptGenerated $promptGenerated -PromptPath $promptPath -ValidationResult $validationResult -GuardResult $guardResult -DiffReviewResult $diffReviewResult -ForbiddenFilesTouched $forbiddenFilesTouched -ProtectedFilesTouched $protectedFilesTouched -FinalDecision $finalDecision 2>&1
foreach ($line in $reportOutput) { Write-Host ([string]$line) }
Write-Host "HUMAN APPROVAL REQUIRED"
$syncOutput = & (Join-Path $PSScriptRoot "sync-status.ps1") 2>&1
foreach ($line in $syncOutput) { Write-Host ([string]$line) }
if ($finalDecision -ne "PASS") { exit 1 }
exit 0



