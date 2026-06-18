param(
  [string]$TaskQueuePath = "",
  [int]$TaskIndex = 0
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
if ([string]::IsNullOrWhiteSpace($TaskQueuePath)) {
  $TaskQueuePath = Join-Path $repoRoot "tools\autodev\subagent-queue.sample.json"
}

$policy = Get-Content (Join-Path $repoRoot "tools\autodev\subagent-policy.json") -Raw | ConvertFrom-Json
$queue = Get-Content $TaskQueuePath -Raw | ConvertFrom-Json
$task = @($queue.tasks)[$TaskIndex]
if ($null -eq $task) { throw "No subagent task found at index $TaskIndex." }

$promptDir = Join-Path $repoRoot "tools\autodev\prompts"
New-Item -ItemType Directory -Force -Path $promptDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$safeId = ([string]$task.id) -replace '[^A-Za-z0-9_-]', '_'
$promptPath = Join-Path $promptDir "SUBAGENT_PROMPT_${safeId}_$timestamp.md"

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# ANKION SUBAGENT v1 Codex Task Prompt")
$lines.Add("")
$lines.Add("Task id: $($task.id)")
$lines.Add("Task title: $($task.title)")
$lines.Add("Agent type: $($task.agentType)")
$lines.Add("Risk level: $($task.riskLevel)")
$lines.Add("Human approval required: YES")
$lines.Add("")
$lines.Add("## Exact Scope")
$lines.Add($task.description)
$lines.Add("")
$lines.Add("## Allowed Files")
foreach ($item in @($task.allowedFiles)) { $lines.Add("- $item") }
$lines.Add("")
$lines.Add("## Forbidden Files")
foreach ($item in @($policy.forbiddenPathPatterns)) { $lines.Add("- $item") }
$lines.Add("")
$lines.Add("## ANKION Product Rules")
foreach ($item in @($policy.productRules)) { $lines.Add("- $item") }
$lines.Add("")
$lines.Add("## Validation Commands")
foreach ($item in @($policy.validationCommands)) { $lines.Add("- ``$item``") }
$lines.Add("")
$lines.Add("## Absolute No-Go Instructions")
$lines.Add("Do not push, deploy, publish, commit, release, build APKs, run Gradle, run adb, install packages, modify package files, modify Auth/RLS/Supabase, or modify ANKION app product source outside the allowed files.")
$lines.Add("Do not run Codex recursively. Stop and report on uncertainty.")
$lines.Add("Do not modify secrets, package files, native Android/iOS files, backend runtime logic, Supabase, Auth, RLS, storage, monetization, or production deployment settings.")
$lines.Add("")
$lines.Add("## Final Response Format")
$lines.Add("Include files changed, validation commands run, guard status, forbidden files touched, remaining risks, and HUMAN APPROVAL REQUIRED.")
Set-Content -Path $promptPath -Value $lines -Encoding UTF8
Write-Host "SubAgent prompt generated: YES"
Write-Host "Prompt path: $promptPath"
exit 0
