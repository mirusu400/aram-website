#!/usr/bin/env bash
# Populates player/ with the ARAM WebAssembly runtime from the aram-emu
# `nightly` release (aram-web.zip -> aram.wasm + wasm_exec.js).
# These files are gitignored; run this before serving or deploying the site.
#
#   bash scripts/sync-player.sh
#
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
url="https://github.com/mirusu400/aram-emu/releases/download/nightly/aram-web.zip"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Downloading $url"
curl -fsSL "$url" -o "$tmp/aram-web.zip"

echo "Extracting into $root/player"
unzip -o "$tmp/aram-web.zip" aram.wasm wasm_exec.js -d "$root/player"

echo "player/ is ready (nightly runtime)."
