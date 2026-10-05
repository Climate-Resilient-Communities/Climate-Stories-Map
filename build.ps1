$ErrorActionPreference = 'Stop'

$repoRoot = $PSScriptRoot

Write-Host 'Building frontend...' -ForegroundColor Cyan
Push-Location (Join-Path $repoRoot 'frontend')
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Error: 'npm install' failed with exit code $LASTEXITCODE"
    }

    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Error: 'npm run build' failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}

$distPath = Join-Path $repoRoot 'frontend\dist'
if (-not (Test-Path $distPath)) {
    throw "Error: Frontend build directory '$distPath' doesn't exist"
}

$distItems = Get-ChildItem -LiteralPath $distPath -Force -ErrorAction Stop
if (-not $distItems -or $distItems.Count -eq 0) {
    throw "Error: Frontend build directory '$distPath' is empty"
}

Write-Host 'Creating static directory in backend...' -ForegroundColor Cyan
$backendStatic = Join-Path $repoRoot 'backend\static'
New-Item -ItemType Directory -Force -Path $backendStatic | Out-Null

Write-Host 'Copying frontend build to backend\static...' -ForegroundColor Cyan
Copy-Item -Path (Join-Path $distPath '*') -Destination $backendStatic -Recurse -Force

Write-Host 'Build and copy complete!' -ForegroundColor Green
