$ErrorActionPreference = 'Stop'

$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Get-Location

$required = @(
  'components\uploadBoxV2\logic.ts',
  'components\uploadBoxV2\index.ts',
  'src\photo-engine\client-script\index.ts',
  'src\photo-engine\client-script\uploadBoxPhotoEngine.ts'
)

foreach ($relative in $required) {
  $source = Join-Path $patchRoot $relative
  $target = Join-Path $projectRoot $relative
  if (-not (Test-Path $source)) { throw "Patch file missing: $source" }
  if (-not (Test-Path (Split-Path -Parent $target))) { throw "Project path missing: $target" }
  Copy-Item $source $target -Force
  Write-Host "Restored $relative"
}

$correctionFolder = Join-Path $projectRoot 'src\photo-engine\client-script\correction'
if (Test-Path $correctionFolder) {
  Remove-Item $correctionFolder -Recurse -Force
  Write-Host 'Removed src\photo-engine\client-script\correction'
}

Write-Host ''
Write-Host 'Alignment rollback complete.' -ForegroundColor Green
Write-Host 'Now run: npm run dev'
