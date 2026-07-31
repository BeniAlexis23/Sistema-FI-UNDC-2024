[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$')]
    [string]$ReleaseId
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$releaseRoot = Join-Path $projectRoot '.release'
$releaseDirectory = Join-Path $releaseRoot $ReleaseId
$archiveName = "fi-undc-$ReleaseId.tar.gz"
$archivePath = Join-Path $releaseRoot $archiveName
$checksumPath = Join-Path $releaseRoot "fi-undc-$ReleaseId.sha256"
$npmCommand = if (Get-Command 'npm.cmd' -ErrorAction SilentlyContinue) { 'npm.cmd' } else { 'npm' }

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter()]
        [string[]]$Arguments = @(),

        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory
    )

    Push-Location $WorkingDirectory
    try {
        & $Command @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Command failed with exit code ${LASTEXITCODE}: $Command $($Arguments -join ' ')"
        }
    }
    finally {
        Pop-Location
    }
}

function Assert-SafeReleasePath {
    param([Parameter(Mandatory = $true)][string]$Path)

    $fullReleaseRoot = [System.IO.Path]::GetFullPath($releaseRoot).TrimEnd('\', '/')
    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $expectedPrefix = "$fullReleaseRoot$([System.IO.Path]::DirectorySeparatorChar)"

    if (-not $fullPath.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to modify a path outside the release directory: $fullPath"
    }
}

Write-Host "Preparing release '$ReleaseId' from $projectRoot" -ForegroundColor Cyan

$nodeVersionText = (& node --version).Trim()
if ($LASTEXITCODE -ne 0 -or $nodeVersionText -notmatch '^v(?<major>\d+)\.') {
    throw 'Node.js is unavailable or returned an invalid version.'
}
if ([int]$Matches.major -lt 22) {
    throw "Node.js 22 or newer is required. Current version: $nodeVersionText"
}

$commit = (& git -C $projectRoot rev-parse --short HEAD).Trim()
if ($LASTEXITCODE -ne 0) {
    throw 'Unable to determine the current Git commit.'
}

Write-Host 'Running backend tests...' -ForegroundColor Cyan
Invoke-CheckedCommand -Command $npmCommand -Arguments @('test') -WorkingDirectory (Join-Path $projectRoot 'backend')

Write-Host 'Running frontend lint...' -ForegroundColor Cyan
Invoke-CheckedCommand -Command $npmCommand -Arguments @('run', 'lint') -WorkingDirectory (Join-Path $projectRoot 'client')

Write-Host 'Building frontend for same-origin production...' -ForegroundColor Cyan
$previousApiUrl = $env:VITE_API_URL
$previousAssetBaseUrl = $env:VITE_ASSET_BASE_URL
try {
    $env:VITE_API_URL = '/api'
    $env:VITE_ASSET_BASE_URL = ''
    Invoke-CheckedCommand -Command $npmCommand -Arguments @('run', 'build') -WorkingDirectory (Join-Path $projectRoot 'client')
}
finally {
    $env:VITE_API_URL = $previousApiUrl
    $env:VITE_ASSET_BASE_URL = $previousAssetBaseUrl
}

New-Item -ItemType Directory -Path $releaseRoot -Force | Out-Null
Assert-SafeReleasePath -Path $releaseDirectory

if (Test-Path -LiteralPath $releaseDirectory) {
    Remove-Item -LiteralPath $releaseDirectory -Recurse -Force
}
foreach ($artifact in @($archivePath, $checksumPath)) {
    Assert-SafeReleasePath -Path $artifact
    if (Test-Path -LiteralPath $artifact) {
        Remove-Item -LiteralPath $artifact -Force
    }
}

New-Item -ItemType Directory -Path $releaseDirectory -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'backend/src') -Destination (Join-Path $releaseDirectory 'src') -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot 'backend/scripts') -Destination (Join-Path $releaseDirectory 'scripts') -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot 'backend/package.json') -Destination $releaseDirectory
Copy-Item -LiteralPath (Join-Path $projectRoot 'backend/package-lock.json') -Destination $releaseDirectory
Copy-Item -LiteralPath (Join-Path $projectRoot 'client/dist') -Destination (Join-Path $releaseDirectory 'dist') -Recurse

$packagedUploads = Join-Path $releaseDirectory 'src/uploads'
if (Test-Path -LiteralPath $packagedUploads) {
    Assert-SafeReleasePath -Path $packagedUploads
    Remove-Item -LiteralPath $packagedUploads -Recurse -Force
}

$environmentExample = @'
NODE_ENV=production
PORT=3001
MONGODB_URI=COPIAR_DESDE_EL_ENV_ACTUAL
JWT_SECRET=GENERAR_EN_EL_SERVIDOR
APP_ORIGIN=https://fi.undc.edu.pe
COOKIE_SECURE=true
ADMIN_EMAIL=bluyo@undc.edu.pe
UPLOAD_DIR=/root/app/src/uploads
MAX_UPLOAD_SIZE_MB=5
'@
Set-Content -LiteralPath (Join-Path $releaseDirectory '.env.production.example') -Value $environmentExample -Encoding utf8

$releaseInfo = @"
Release: $ReleaseId
Git commit: $commit
Generated at UTC: $([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
Build Node.js: $nodeVersionText
Production Node.js required: 22.23.1
Backend tests: passed
Frontend lint: passed
Frontend build: passed
Deployment status: prepared only; not activated
"@
Set-Content -LiteralPath (Join-Path $releaseDirectory 'RELEASE_INFO.txt') -Value $releaseInfo -Encoding utf8

$requiredFiles = @(
    'dist/index.html',
    'src/index.js',
    'scripts/migrate-user-roles.js',
    'scripts/rollback-user-roles.js',
    'package.json',
    'package-lock.json',
    '.env.production.example',
    'RELEASE_INFO.txt'
)
foreach ($relativePath in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $releaseDirectory $relativePath) -PathType Leaf)) {
        throw "Required release file is missing: $relativePath"
    }
}

$forbiddenDirectories = Get-ChildItem -LiteralPath $releaseDirectory -Directory -Recurse |
    Where-Object { $_.Name -in @('node_modules', 'uploads', 'test', 'tests') }
if ($forbiddenDirectories) {
    throw "Forbidden directories found in release: $($forbiddenDirectories.FullName -join ', ')"
}

$secretFiles = Get-ChildItem -LiteralPath $releaseDirectory -File -Recurse -Force |
    Where-Object { $_.Name -eq '.env' }
if ($secretFiles) {
    throw "Secret .env files found in release: $($secretFiles.FullName -join ', ')"
}

$dockerFiles = Get-ChildItem -LiteralPath $releaseDirectory -File -Recurse |
    Where-Object { $_.Name -match '^(?i:dockerfile|docker-compose.*|\.dockerignore)$' }
if ($dockerFiles) {
    throw "Docker files found in runtime release: $($dockerFiles.FullName -join ', ')"
}

$searchableFiles = Get-ChildItem -Path (Join-Path $releaseDirectory 'src'), (Join-Path $releaseDirectory 'dist') -File -Recurse |
    Where-Object { $_.Extension -in @('.js', '.jsx', '.json', '.html', '.css', '.map', '.txt') }
$removedModuleReferences = $searchableFiles | Select-String -Pattern '(?i)\bdecretos?\b'
if ($removedModuleReferences) {
    $locations = $removedModuleReferences | ForEach-Object { "$($_.Path):$($_.LineNumber)" }
    throw "Removed module references found in release: $($locations -join ', ')"
}

Write-Host 'Creating compressed archive...' -ForegroundColor Cyan
Invoke-CheckedCommand -Command 'tar' -Arguments @('-czf', $archivePath, '-C', $releaseDirectory, '.') -WorkingDirectory $projectRoot

$hash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath $checksumPath -Value "$hash  $archiveName" -Encoding ascii

Write-Host ''
Write-Host 'Release prepared successfully.' -ForegroundColor Green
Write-Host "Directory: $releaseDirectory"
Write-Host "Archive:   $archivePath"
Write-Host "SHA-256:   $hash"
