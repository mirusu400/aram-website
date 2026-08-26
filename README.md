# ARAM website

Landing page for **ARAM — Archived Runtime for ARM Mobiles**, plus an
in-browser build of the emulator.

## Structure

| Path | Notes |
|---|---|
| `index.html` | Landing page. Self-contained: Pretendard via CDN, inline SVG icon sprite, ko/en + dark/light. |
| `assets/icon.png` | Brand icon (from `aram-frontend`). |
| `player/` | In-browser ARAM (Ebitengine → WebAssembly). `index.html` + `icon.png` are committed. |
| `player/aram.wasm`, `player/wasm_exec.js` | **Not committed** — ~52 MB runtime, fetched from the `aram-emu` **nightly** release at deploy time. |
| `scripts/sync-player.{ps1,sh}` | Download the runtime from the nightly release into `player/`. |
| `.github/workflows/deploy.yml` | GitHub Pages deploy: runs the sync, then deploys. |

Why the wasm isn't committed: GitHub release assets have no CORS headers (so the
browser can't fetch them cross-origin), and the file is too large / not tracked
to serve from a CDN. So it is pulled at build time and served same-origin.

## Local preview

```powershell
pwsh scripts/sync-player.ps1      # or: bash scripts/sync-player.sh
python -m http.server 8000
# open http://localhost:8000/
```

## Deploy (GitHub Pages)

One-time: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Then every push to `main` (and a daily schedule) fetches the latest nightly
`aram.wasm` and deploys. No large binaries live in git history.
