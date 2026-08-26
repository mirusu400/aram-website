# Populates player/ with the ARAM WebAssembly runtime from the aram-emu
# `nightly` release (aram-web.zip -> aram.wasm + wasm_exec.js).
# These files are gitignored; run this before serving or deploying the site.
#
#   pwsh scripts/sync-player.ps1
#
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root   = Split-Path -Parent $PSScriptRoot
$player = Join-Path $root "player"
$url    = "https://github.com/mirusu400/aram-emu/releases/download/nightly/aram-web.zip"
$tmp    = Join-Path ([System.IO.Path]::GetTempPath()) "aram-web.zip"

Write-Host "Downloading $url"
Invoke-WebRequest -Uri $url -OutFile $tmp

Write-Host "Extracting into $player"
$zip = [System.IO.Compression.ZipFile]::OpenRead($tmp)
try {
    foreach ($name in @("aram.wasm", "wasm_exec.js")) {
        $entry = $zip.Entries | Where-Object { $_.FullName -eq $name } | Select-Object -First 1
        if ($null -eq $entry) { throw "entry '$name' not found in aram-web.zip" }
        $dest = Join-Path $player $name
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $dest, $true)
        Write-Host "  $name  ($([math]::Round($entry.Length/1MB,1)) MB)"
    }
} finally {
    $zip.Dispose()
}
Remove-Item $tmp -Force
Write-Host "player/ is ready (nightly runtime)."
