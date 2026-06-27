param(
  [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

function Write-Section {
  param([string]$Message)
  Write-Host ""
  Write-Host "== $Message ==" -ForegroundColor Cyan
}

function Test-CommandExists {
  param([string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Invoke-CommandLine {
  param(
    [string]$Label,
    [string]$CommandLine,
    [int]$TimeoutSeconds = 0
  )

  Write-Section $Label
  Write-Host $CommandLine -ForegroundColor DarkGray

  if ($TimeoutSeconds -le 0) {
    cmd.exe /c $CommandLine
    if ($LASTEXITCODE -ne 0) {
      throw "$Label failed with exit code $LASTEXITCODE."
    }
    return
  }

  $process = Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", $CommandLine) -NoNewWindow -PassThru
  $completed = $process.WaitForExit($TimeoutSeconds * 1000)

  if (-not $completed) {
    try {
      Stop-Process -Id $process.Id -Force
    } catch {
      Write-Host "Could not stop timed out process $($process.Id)." -ForegroundColor Yellow
    }
    throw "$Label timed out after $TimeoutSeconds seconds."
  }

  if ($process.ExitCode -ne 0) {
    $process.Refresh()
  }

  if ($process.ExitCode -ne 0) {
    throw "$Label failed with exit code $($process.ExitCode)."
  }
}

function Ensure-Dependencies {
  if (-not (Test-CommandExists "node")) {
    throw "Node.js is not installed or not available in PATH."
  }

  if (-not (Test-CommandExists "npm")) {
    throw "npm is not installed or not available in PATH."
  }

  if (-not (Test-Path "node_modules")) {
    Invoke-CommandLine -Label "Installing npm dependencies" -CommandLine "npm install --ignore-scripts --no-audit --no-fund" -TimeoutSeconds 1200
    return
  }

  $requiredPaths = @(
    "node_modules\vite",
    "node_modules\react",
    "node_modules\typescript",
    "node_modules\electron"
  )

  $missing = $requiredPaths | Where-Object { -not (Test-Path $_) }
  if ($missing.Count -gt 0) {
    Invoke-CommandLine -Label "Repairing npm dependencies" -CommandLine "npm install --ignore-scripts --no-audit --no-fund" -TimeoutSeconds 1200
  } else {
    Write-Section "Dependencies"
    Write-Host "npm dependencies are already installed." -ForegroundColor Green
  }
}

function Ensure-ElectronRuntime {
  $electronExe = Join-Path $Root "node_modules\electron\dist\electron.exe"
  if (Test-Path $electronExe) {
    Write-Section "Electron runtime"
    Write-Host "Electron runtime is ready." -ForegroundColor Green
    return
  }

  Write-Section "Electron runtime"
  Write-Host "Electron runtime is missing. The runner will try to download it now." -ForegroundColor Yellow

  if (Test-CommandExists "curl.exe") {
    try {
      Install-ElectronRuntimeWithProgress
    } catch {
      Write-Host $_.Exception.Message -ForegroundColor Yellow
    }

    if (Test-Path $electronExe) {
      Write-Host "Electron runtime installed." -ForegroundColor Green
      return
    }
  }

  try {
    Invoke-CommandLine -Label "Installing Electron runtime from default source" -CommandLine "npm run electron:install" -TimeoutSeconds 900
  } catch {
    Write-Host $_.Exception.Message -ForegroundColor Yellow
  }

  if (Test-Path $electronExe) {
    Write-Host "Electron runtime installed." -ForegroundColor Green
    return
  }

  Write-Host "Default source did not finish. Trying Electron mirror..." -ForegroundColor Yellow
  $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
  $env:npm_config_electron_mirror = "https://npmmirror.com/mirrors/electron/"

  try {
    Invoke-CommandLine -Label "Installing Electron runtime from mirror" -CommandLine "npm run electron:install" -TimeoutSeconds 900
  } catch {
    Write-Host $_.Exception.Message -ForegroundColor Yellow
  } finally {
    Remove-Item Env:\ELECTRON_MIRROR -ErrorAction SilentlyContinue
    Remove-Item Env:\npm_config_electron_mirror -ErrorAction SilentlyContinue
  }

  if (-not (Test-Path $electronExe)) {
    throw "Electron runtime could not be downloaded. Check your network, then run RUN_CODEX_PHOTO.cmd again."
  }
}

function Install-ElectronRuntimeWithProgress {
  $electronPackagePath = Join-Path $Root "node_modules\electron"
  $packageJsonPath = Join-Path $electronPackagePath "package.json"
  if (-not (Test-Path $packageJsonPath)) {
    throw "Electron package is missing from node_modules."
  }

  $electronPackage = Get-Content -Raw -LiteralPath $packageJsonPath | ConvertFrom-Json
  $version = [string]$electronPackage.version
  $platform = "win32"
  $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "ia32" }
  $fileName = "electron-v$version-$platform-$arch.zip"
  $cacheDir = Join-Path $Root ".cache\electron"
  $zipPath = Join-Path $cacheDir $fileName
  $distPath = Join-Path $electronPackagePath "dist"
  $pathTxt = Join-Path $electronPackagePath "path.txt"
  $electronExe = Join-Path $distPath "electron.exe"

  New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null

  $downloadUrls = @(
    "https://github.com/electron/electron/releases/download/v$version/$fileName",
    "https://npmmirror.com/mirrors/electron/v$version/$fileName"
  )

  foreach ($url in $downloadUrls) {
    Write-Section "Downloading Electron runtime"
    Write-Host $url -ForegroundColor DarkGray
    Write-Host "This is a one-time download. A progress bar should appear below." -ForegroundColor Yellow

    Remove-Item -LiteralPath $zipPath -Force -ErrorAction SilentlyContinue

    $curlArgs = @(
      "--ssl-no-revoke",
      "--location",
      "--fail",
      "--retry", "3",
      "--retry-delay", "5",
      "--connect-timeout", "30",
      "--speed-limit", "1024",
      "--speed-time", "60",
      "--max-time", "1200",
      "--progress-bar",
      "--output", $zipPath,
      $url
    )

    & curl.exe @curlArgs
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Download failed from this source with exit code $LASTEXITCODE." -ForegroundColor Yellow
      continue
    }

    $zipItem = Get-Item -LiteralPath $zipPath -ErrorAction SilentlyContinue
    if ($null -eq $zipItem -or $zipItem.Length -lt 50000000) {
      Write-Host "Downloaded file is incomplete; trying next source." -ForegroundColor Yellow
      continue
    }

    Write-Section "Extracting Electron runtime"
    $resolvedPackage = Resolve-Path -LiteralPath $electronPackagePath
    $resolvedRoot = Resolve-Path -LiteralPath $Root
    if (-not $resolvedPackage.Path.StartsWith($resolvedRoot.Path, [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "Electron package path is outside the project root."
    }

    Remove-Item -LiteralPath $distPath -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force -Path $distPath | Out-Null
    Expand-Archive -LiteralPath $zipPath -DestinationPath $distPath -Force
    Set-Content -LiteralPath $pathTxt -Value "electron.exe" -NoNewline

    if (Test-Path $electronExe) {
      Remove-Item -LiteralPath $zipPath -Force -ErrorAction SilentlyContinue
      return
    }

    Write-Host "Extracted archive did not contain electron.exe; trying next source." -ForegroundColor Yellow
  }

  throw "Could not download a complete Electron runtime archive."
}

Write-Host "CodeX Photo one-click runner" -ForegroundColor Green
Write-Host "Project: $Root"

Ensure-Dependencies
Ensure-ElectronRuntime

if ($CheckOnly) {
  Write-Section "Check only"
  Write-Host "Runner checks passed." -ForegroundColor Green
  exit 0
}

Invoke-CommandLine -Label "Compiling and opening CodeX Photo" -CommandLine "npm run dev"
