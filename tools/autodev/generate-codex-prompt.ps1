param(
  [string]$TaskQueuePath = "",
  [int]$TaskIndex = 0
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
$policy = Get-Content (Join-Path $repoRoot "tools\autodev\policy.json") -Raw | ConvertFrom-Json
if ([string]::IsNullOrWhiteSpace($TaskQueuePath)) {
  $TaskQueuePath = Join-Path $repoRoot "tools\autodev\task-queue.json"
}
$queue = Get-Content $TaskQueuePath -Raw | ConvertFrom-Json
$task = @($queue.tasks)[$TaskIndex]
if ($null -eq $task) { throw "No task found at index $TaskIndex." }
$promptDir = Join-Path $repoRoot "tools\autodev\prompts"
New-Item -ItemType Directory -Force -Path $promptDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$safeId = ([string]$task.id) -replace '[^A-Za-z0-9_-]', '_'
$promptPath = Join-Path $promptDir "CODEX_PROMPT_${safeId}_$timestamp.md"

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# ANKION AUTODEV v2 Codex Task Prompt")
$lines.Add("")
$lines.Add("Task id: $($task.id)")
$lines.Add("Task title: $($task.title)")
$lines.Add("Mode: $($task.mode)")
$lines.Add("Risk level: $($task.riskLevel)")
$lines.Add("")
$lines.Add("## Exact Scope")
$lines.Add($task.description)
$lines.Add("")
$lines.Add("## Allowed Files")
foreach ($item in @($task.allowedFiles)) { $lines.Add("- $item") }
$lines.Add("")
$lines.Add("## Forbidden Files")
foreach ($item in @($task.forbiddenFiles)) { $lines.Add("- $item") }
$lines.Add("")
$lines.Add("## ANKION Product Rules")
foreach ($item in @($policy.protectedProductRules)) { $lines.Add("- $item") }
$lines.Add("")
$lines.Add("## Validation Commands")
foreach ($item in @($policy.allowedValidationCommands)) { $lines.Add("- ``$item``") }
$lines.Add("")
$lines.Add("## Absolute No-Go Instructions")
$lines.Add("Do not push, deploy, publish, commit, release, build APKs, run Gradle, run adb, install packages, modify package files, modify Auth/RLS/Supabase, or modify ANKION app product source outside the allowed files.")
$lines.Add("Do not run Codex recursively. Stop and report on uncertainty.")
$lines.Add("")
$lines.Add("## Final Response Format")
$lines.Add("Include files changed, validation commands run, guard status, forbidden files touched, remaining risks, and HUMAN APPROVAL REQUIRED.")
Set-Content -Path $promptPath -Value $lines -Encoding UTF8
Write-Host "Prompt generated: YES"
Write-Host "Prompt path: $promptPath"
exit 0
