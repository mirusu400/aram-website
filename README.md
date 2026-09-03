# ARAM website

Landing page for **ARAM, Archived Runtime for ARM Mobiles**, plus an
in-browser build of the emulator.

## Structure

| Path | Notes |
|---|---|
| `site/index.template.html` | Landing-page template. The build emits static Korean `/` and English `/en/` variants. |
| `site/article.template.html` | Shared layout for the searchable guide, compatibility, FAQ, releases, and troubleshooting pages. |
| `site/pages.mjs` | Korean and English article metadata and content. |
| `scripts/build-site.mjs` | Generates localized HTML and `sitemap.xml` into the deploy directory. |
| `scripts/build-og-image.py` | Rebuilds the two 1200×630 social cards from the logo and real screenshots. |
| `assets/icon.png` | Brand icon (from `aram-frontend`). |
| `assets/og-{ko,en}.png` | Localized Open Graph and X/Twitter preview cards. |
| `assets/analytics.{js,css}` | Consent-first GA4 loader and privacy-preserving event allowlist. |
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
node scripts/build-site.mjs _site
Copy-Item robots.txt _site/
Copy-Item -Recurse assets,player _site/
python -m http.server 8000 -d _site
# open http://localhost:8000/
```

The player is intentionally `noindex`: searchable pages explain the product and
link to it, while channel and package query-string variants stay out of search
results.

Run the complete static SEO and player contract checks with:

```powershell
node --test player/permalink.test.js scripts/analytics.test.mjs scripts/seo.test.mjs
```

## Analytics

Analytics is optional at build time. The GitHub Actions repository secret
`GA_MEASUREMENT_ID` must be configured on **`mirusu400/aram-website`**. When it
contains a GA4 web-stream ID such as `G-XXXXXXXXXX`, the generated landing and
documentation pages include the consent UI. A missing value produces pages with
no analytics markup.

The Google script is not requested until the visitor opts in. Page locations
exclude query strings and fragments, external referrers are reduced to their
origin, event parameters come from a small allowlist, and `/player/` never
includes the analytics loader. The measurement ID is expected to be visible in
deployed HTML; never use a Measurement Protocol API secret in the client-side
build.

In the GA4 web stream settings, turn **Enhanced measurement** off. Otherwise
GA4 can independently emit download and outbound-click events containing link
URLs or filenames outside this site's event allowlist.

For a local consent-flow build:

```powershell
$env:GA_MEASUREMENT_ID = "G-XXXXXXXXXX"
node scripts/build-site.mjs _site
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

Run only the permalink contract tests with:

```powershell
node --test player/permalink.test.js
```
