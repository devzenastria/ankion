param()

$ErrorActionPreference = "Stop"

function Invoke-AllowedValidationCommand {
  param([string]$CommandLine)
  if ($CommandLine -match "(?i)(gradle|gradlew|adb|emulator|apk|install|add|push|deploy|publish|release)") {
    throw "Blocked unsafe validation command: $CommandLine"
  }
  $parts = $CommandLine -split " " | Where-Object { $_ -ne "" }
  if ($parts.Count -eq 0) { throw "Empty validation command." }
  $exe = $parts[0]
  $args = @()
  if ($parts.Count -gt 1) { $args = $parts[1..($parts.Count - 1)] }
  Get-Command $exe -ErrorAction Stop | Out-Null
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = & $exe @args 2>&1
    $script:AutodevLastOutput = @($output)
    return $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot
$policy = Get-Content (Join-Path $repoRoot "tools\autodev\policy.json") -Raw | ConvertFrom-Json
$reportDir = Join-Path $repoRoot "tools\autodev\reports"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$reportPath = Join-Path $reportDir ("AUTODEV_VALIDATE_{0}.txt" -f (Get-Date -Format "yyyyMMdd_HHmmss"))
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("AUTODEV VALIDATION REPORT")
$lines.Add("Timestamp: $(Get-Date -Format o)")
$lines.Add("Repo root: $repoRoot")
$lines.Add("APK/Gradle/emulator/adb validation: disabled")
$lines.Add("")
$failed = $false
foreach ($command in $policy.allowedValidationCommands) {
  $lines.Add("COMMAND: $command")
  try {
    $exitCode = Invoke-AllowedValidationCommand -CommandLine $command
    foreach ($line in @($script:AutodevLastOutput)) { $lines.Add([string]$line) }
    $lines.Add("EXIT_CODE: $exitCode")
    $lines.Add("")
    if ($exitCode -ne 0) { $failed = $true; break }
  } catch {
    $lines.Add("ERROR: $($_.Exception.Message)")
    $lines.Add("EXIT_CODE: 1")
    $failed = $true
    break
  }
}
Set-Content -Path $reportPath -Value $lines -Encoding UTF8
Write-Host "Validation report: $reportPath"
if ($failed) { Write-Host "VALIDATION RESULT: FAIL"; exit 1 }
Write-Host "VALIDATION RESULT: PASS"
exit 0
