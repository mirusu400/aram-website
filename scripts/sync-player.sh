#!/usr/bin/env bash
# Populates player/stable/ and player/nightly/ with the ARAM WebAssembly runtime
# (aram-web.zip -> aram.wasm + wasm_exec.js) from the aram-emu releases.
# These files are gitignored; run this before serving or deploying the site.
#
#   bash scripts/sync-player.sh
#
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"

fetch() { # $1 = channel dir, $2 = aram-web.zip url
  local ch="$1" url="$2" tmp
  tmp="$(mktemp -d)"
  echo "[$ch] downloading $url"
  curl -fsSL "$url" -o "$tmp/aram-web.zip"
  mkdir -p "$root/player/$ch"
  unzip -o "$tmp/aram-web.zip" aram.wasm wasm_exec.js -d "$root/player/$ch"
  rm -rf "$tmp"
}

fetch stable  "https://github.com/mirusu400/aram-emu/releases/latest/download/aram-web.zip"
fetch nightly "https://github.com/mirusu400/aram-emu/releases/download/nightly/aram-web.zip"

echo "player/ is ready (stable + nightly runtimes)."
