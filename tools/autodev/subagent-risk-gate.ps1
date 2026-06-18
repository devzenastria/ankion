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
  $explicitRisk = ([string]$Task.riskLevel).ToUpperInvariant()
  if ($explicitRisk -in @("LOW", "MEDIUM", "HIGH")) { return $explicitRisk }

  $text = @([string]$Task.id, [string]$Task.title, [string]$Task.description, (@($Task.allowedFiles) -join " ")) -join "`n"
  foreach ($pattern in @($Policy.protectedTaskTextPatterns)) {
    if ($text -match "(?i)$([regex]::Escape($pattern))") { return "HIGH" }
  }
  if (@($Task.allowedFiles).Count -gt 1) { return "MEDIUM" }
  return "LOW"
}

function Get-AgentPolicy {
  param([object]$Policy, [string]$AgentType)
  foreach ($agent in @($Policy.allowedAgents)) {
    if ([string]$agent.type -eq $AgentType) { return $agent }
  }
  return $null
}

function Get-TaskGate {
  param([object]$Task, [object]$Policy)
  $reasons = New-Object System.Collections.Generic.List[string]
  $agentType = [string]$Task.agentType
  $risk = Get-TaskRisk -Task $Task -Policy $Policy
  $agent = Get-AgentPolicy -Policy $Policy -AgentType $agentType

  if ($null -eq $agent) {
    $reasons.Add("Unknown agent type: $agentType")
  } else {
    if (@($agent.allowedRiskLevels) -notcontains $risk) {
      $reasons.Add("$agentType does not allow $risk risk.")
    }
    if (@($Task.allowedFiles).Count -gt [int]$agent.maxFiles) {
      $reasons.Add("Allowed file count exceeds agent maxFiles $($agent.maxFiles).")
    }
  }

  foreach ($file in @($Task.allowedFiles)) {
    foreach ($pattern in @($Policy.forbiddenPathPatterns)) {
      if (Test-PathPattern -PathValue $file -Pattern $pattern) {
        $reasons.Add("$file matches forbidden pattern $pattern.")
      }
    }
  }

  $text = @([string]$Task.id, [string]$Task.title, [string]$Task.description, (@($Task.allowedFiles) -join " ")) -join "`n"
  foreach ($pattern in @($Policy.protectedTaskTextPatterns)) {
    if ($text -match "(?i)$([regex]::Escape($pattern))") {
      $reasons.Add("Task text includes protected category: $pattern.")
    }
  }

  if ($risk -eq "HIGH" -and $Policy.highRiskBlocked -eq $true) {
    $reasons.Add("HIGH risk is blocked automatically.")
  }

  $result = if ($risk -eq "HIGH" -or $reasons.Count -gt 0) { "BLOCKED" } else { "PASS" }
  return [ordered]@{
    id = [string]$Task.id
    agentType = $agentType
    riskLevel = $risk
    result = $result
    reasons = @($reasons)
  }
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
if ([string]::IsNullOrWhiteSpace($TaskQueuePath)) {
  $TaskQueuePath = Join-Path $repoRoot "tools\autodev\subagent-queue.sample.json"
}

$policy = Get-Content (Join-Path $repoRoot "tools\autodev\subagent-policy.json") -Raw | ConvertFrom-Json
$queue = Get-Content $TaskQueuePath -Raw | ConvertFrom-Json
$reportsDir = Join-Path $repoRoot "tools\autodev\reports"
New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null
$reportPath = Join-Path $reportsDir ("SUBAGENT_RISK_GATE_{0}.txt" -f (Get-Date -Format "yyyyMMdd_HHmmss"))

$gateResults = New-Object System.Collections.Generic.List[object]
$hardFail = $false
foreach ($task in @($queue.tasks)) {
  $gate = Get-TaskGate -Task $task -Policy $policy
  $gateResults.Add($gate)
  if ($gate.result -eq "BLOCKED" -and $gate.riskLevel -ne "HIGH") { $hardFail = $true }
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("ANKION SUBAGENT v1 RISK GATE REPORT")
$lines.Add("Timestamp: $(Get-Date -Format o)")
$lines.Add("Task queue: $TaskQueuePath")
$lines.Add("")
foreach ($gate in $gateResults) {
  $lines.Add("Task id: $($gate.id)")
  $lines.Add("Agent: $($gate.agentType)")
  $lines.Add("Risk level: $($gate.riskLevel)")
  $lines.Add("Gate result: $($gate.result)")
  if (@($gate.reasons).Count -eq 0) {
    $lines.Add("Reasons: None")
  } else {
    $lines.Add("Reasons:")
    foreach ($reason in @($gate.reasons)) { $lines.Add("- $reason") }
  }
  $lines.Add("")
}
$lines.Add("Human approval required: YES")
$lines.Add("RISK GATE RESULT: $(if ($hardFail) { 'FAIL' } else { 'PASS' })")
Set-Content -Path $reportPath -Value $lines -Encoding UTF8

foreach ($line in $lines) { Write-Host $line }
Write-Host "Risk gate report: $reportPath"
if ($hardFail) { exit 1 }
exit 0
