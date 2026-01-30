#!/usr/bin/env pwsh
# Script to create a ZIP package of the Mercenary System for GitHub releases
# Usage: .\build-release.ps1 -version "1.0.0"

param(
    [Parameter(Mandatory=$false)]
    [string]$version = "1.0.0"
)

# Get the directory of this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$systemDir = $scriptDir

# Define the output directory
$outputDir = Join-Path $scriptDir "releases"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Define the ZIP file name
$zipName = "merc-system-$version.zip"
$zipPath = Join-Path $outputDir $zipName

# Files and folders to include in the ZIP
$itemsToZip = @(
    "system.json",
    "template.json",
    "README.md",
    "INSTALLATION.md",
    "LICENSE",
    "scripts",
    "templates",
    "css",
    "lang"
)

# Create a temporary directory for staging
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) "merc-system-$version"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy files to temp directory
$stagingDir = Join-Path $tempDir "merc"
New-Item -ItemType Directory -Path $stagingDir | Out-Null

foreach ($item in $itemsToZip) {
    $sourcePath = Join-Path $systemDir $item
    $destPath = Join-Path $stagingDir $item
    
    if (Test-Path $sourcePath) {
        if ((Get-Item $sourcePath).PSIsContainer) {
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        } else {
            Copy-Item -Path $sourcePath -Destination $destPath -Force
        }
        Write-Host "✓ Added: $item"
    } else {
        Write-Host "✗ Warning: Not found: $item"
    }
}

# Create ZIP file
Write-Host "`nCreating ZIP file: $zipName..."
Compress-Archive -Path $stagingDir -DestinationPath $zipPath -Force

if (Test-Path $zipPath) {
    $size = (Get-Item $zipPath).Length / 1MB
    Write-Host "✓ ZIP created successfully!"
    Write-Host "  Path: $zipPath"
    Write-Host "  Size: $([Math]::Round($size, 2)) MB"
    Write-Host "`nNext steps:"
    Write-Host "1. Upload this ZIP to GitHub Releases for v$version"
    Write-Host "2. Update the download URL in system.json:"
    Write-Host "   https://github.com/nawack/merc2/releases/download/v$version/$zipName"
} else {
    Write-Host "✗ Error: Failed to create ZIP file"
    exit 1
}

# Cleanup temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "`n✓ Build complete!"
