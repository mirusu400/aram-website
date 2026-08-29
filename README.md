# ARAM website

Landing page for **ARAM, Archived Runtime for ARM Mobiles**, plus an
in-browser build of the emulator.

## Structure

| Path | Notes |
|---|---|
| `index.html` | Landing page. Self-contained: Pretendard via CDN, inline SVG icon sprite, ko/en + dark/light. |
| `assets/icon.png` | Brand icon (from `aram-frontend`). |
| `player/` | In-browser ARAM (Ebitengine → WebAssembly), including the checked-in permalink loader. |
| `player/aram.wasm`, `player/wasm_exec.js` | **Not committed**, ~52 MB runtime, fetched from the `aram-emu` **nightly** release at deploy time. |
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

Live at **https://aram.mir.sh/** (custom domain; the deploy writes `CNAME`).

One-time: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Every push to `main`, a `repository_dispatch` from `aram-emu` (sent right after it
publishes a new `nightly`), and a daily safety-net cron fetch the latest nightly
`aram.wasm` and deploy. No large binaries live in git history.

## Package permalinks

The player can download and open an authorized WIPI package directly:

```text
https://aram.mir.sh/player/?ch=nightly&app=<percent-encoded-HTTPS-URL>&sha256=<64-hex-digest>
```

Both `app` and `sha256` are required together. The player only accepts HTTPS,
omits credentials and referrer data, limits the response to 32 MiB, verifies
SHA-256 with Web Crypto, and then passes the bytes directly to the WebAssembly
frontend. The package is never uploaded to an ARAM application server. The
source host must allow a cross-origin browser request (CORS).

Run the permalink contract tests with:

```powershell
node --test player/permalink.test.js
```
