# Populates player/stable/ and player/nightly/ with the ARAM WebAssembly runtime
# (aram-web.zip -> aram.wasm + wasm_exec.js) from the aram-emu releases.
# These files are gitignored; run this before serving or deploying the site.
#
#   pwsh scripts/sync-player.ps1
#
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot

function Sync-Channel([string]$ch, [string]$url) {
    $dir = Join-Path $root "player/$ch"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $tmp = Join-Path ([System.IO.Path]::GetTempPath()) "aram-web-$ch.zip"
    Write-Host "[$ch] downloading $url"
    Invoke-WebRequest -Uri $url -OutFile $tmp
    $zip = [System.IO.Compression.ZipFile]::OpenRead($tmp)
    try {
        foreach ($name in @("aram.wasm", "wasm_exec.js")) {
            $entry = $zip.Entries | Where-Object { $_.FullName -eq $name } | Select-Object -First 1
            if ($null -eq $entry) { throw "entry '$name' not found in aram-web.zip ($ch)" }
            [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, (Join-Path $dir $name), $true)
        }
    } finally { $zip.Dispose() }
    Remove-Item $tmp -Force
    Write-Host "[$ch] ready"
}

Sync-Channel "stable"  "https://github.com/mirusu400/aram-emu/releases/latest/download/aram-web.zip"
Sync-Channel "nightly" "https://github.com/mirusu400/aram-emu/releases/download/nightly/aram-web.zip"

Write-Host "player/ is ready (stable + nightly runtimes)."
