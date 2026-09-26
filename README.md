# ARAM website

Landing page for **ARAM, Archived Runtime for ARM Mobiles**, plus an
in-browser build of the emulator.

## Structure

| Path | Notes |
|---|---|
| `site/index.template.html` | Landing-page template. The build emits static Korean `/` and English `/en/` variants. |
| `site/article.template.html` | Shared layout for the searchable guide, compatibility, FAQ, releases, and troubleshooting pages. |
| `site/pages.mjs` | Korean and English article metadata and content. |
| `site/extra-pages.mjs` | Dedicated Korean and English download and press-kit pages. |
| `site/releases.json` | Offline snapshot of public Stable release metadata; refreshed from GitHub during deployment. |
| `scripts/build-site.mjs` | Generates localized HTML and `sitemap.xml` into the deploy directory. |
| `scripts/sync-releases.mjs` | Fetches non-draft, non-Nightly `aram-emu` releases for versioned HTML articles. |
| `scripts/submit-indexnow.mjs` | Submits the deployed canonical URLs to IndexNow. |
| `scripts/build-og-image.py` | Rebuilds the two 1200×630 social cards from the logo and real screenshots. |
| `assets/icon.png` | Brand icon (from `aram-frontend`). |
| `assets/og-{ko,en}.png` | Localized Open Graph and X/Twitter preview cards. |
| `assets/analytics.{js,css}` | Consent-first GA4 loader and privacy-preserving event allowlist. |
| `player/` | In-browser ARAM (Ebitengine → WebAssembly), including the checked-in permalink loader. |
| `player/{stable,nightly}/aram.wasm`, `wasm_exec.js`, `runtime.json` | **Not committed**; release runtimes and a version digest fetched at deploy time. |
| `scripts/sync-player.{ps1,sh}` | Download the Stable and Nightly runtimes and write each channel's version digest. |
| `.github/workflows/deploy.yml` | GitHub Pages deploy: runs the sync, then deploys. |

Why the wasm isn't committed: GitHub release assets have no CORS headers (so the
browser can't fetch them cross-origin), and the file is too large / not tracked
to serve from a CDN. So it is pulled at build time and served same-origin.
The player checks `runtime.json` without cache on load and uses its digest in
the runtime asset URLs. An open tab checks again every five minutes and when
it regains focus, then offers a reload if a newer build has been deployed.

## Local preview

```powershell
npm ci
pwsh scripts/sync-player.ps1      # or: bash scripts/sync-player.sh
npm run build
Copy-Item robots.txt _site/
Copy-Item -Recurse assets,player _site/
npm run optimize
python -m http.server 8000 -d _site
# open http://localhost:8000/
```

The player is intentionally `noindex`: searchable pages explain the product and
link to it, while channel and package query-string variants stay out of search
results.

Run the complete static SEO and player contract checks with:

```powershell
npm test
```

## Blog authoring

### Write in a browser

After this branch is deployed, open [Pages CMS](https://app.pagescms.org), sign
in with GitHub, and install its GitHub App only for `mirusu400/aram-website`.
Choose **블로그 글**, then create or edit a post. Saving creates a regular Git
commit; the existing GitHub Pages workflow deploys it automatically. Pages CMS
has no separate content database: GitHub remains the source of truth.

Pages CMS writes the JSON metadata automatically; do not add `---` delimiter
lines in its editor. The build accepts both its format and the delimiter-based
format used for manual Markdown files.

Use the image button in the **본문** editor to upload `.jpg`, `.jpeg`, `.png`,
or `.webp` files. They are stored in `assets/blog/` and inserted into the body.
Set **대표 이미지** only when you want a custom search and social preview card.
Keep screenshots reasonably compressed; WebP is preferred for screenshots.

### Write in VS Code

Add a UTF-8 `.md` file to `site/blog/`, using `reading-compatibility.ko.md` as
the example. Each file starts with JSON metadata between two `---` lines:
`slug`, `lang` (`ko` or `en`), `title`, `description`, `author`, `published`,
and `modified` (YYYY-MM-DD). Optional `draft: true` excludes a post from the
build; future publication dates are also excluded. Use the same slug for a
translation. Only published translations receive alternate-language links.

The lightweight Markdown renderer supports headings, paragraphs, unordered
lists, bold, inline code, fenced code blocks, local blog images, and absolute
HTTPS links. Use `![설명](/assets/blog/image.webp)` for a body image. Raw HTML
is escaped. Use full `https://aram.mir.sh/.../` links so they also work in RSS.
An optional `image` can point to a local `/assets/...png`, `.jpg`, `.jpeg`, or
`.webp` social card; otherwise the localized ARAM card is used.

Run `node scripts/build-site.mjs _site` to generate `/blog/`, `/en/blog/`, post
pages, and localized `blog/feed.xml` feeds with full article bodies. The existing
deployment automatically includes the feeds and submits blog URLs through the
sitemap/IndexNow workflow. Submit `/blog/feed.xml` in Naver Search Advisor after
deployment; do not submit an empty language feed. Set `modified` only when the
article changes substantively. Preview a clean build when removing published
posts, because the build does not remove old output files.

## Analytics configuration

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

Every push to `main`, a `repository_dispatch` from `aram-emu`, and a daily
safety-net cron rebuild the site. Nightly dispatches refresh the web runtime.
Stable-release dispatches fetch GitHub release metadata and automatically publish
searchable `/releases/<version>/` and `/en/releases/<version>/` articles after the
release assets are attached. No large binaries live in git history.

After GitHub Pages reports a successful deployment, the workflow submits every
canonical URL in the generated sitemap to IndexNow. The public verification key
is deployed at `/6c4e0a03d58b41e7a9f2c0bd7835e146.txt`; it is intentionally public
and is not a credential. Google Search Console and Naver Search Advisor ownership,
sitemap submission, and priority URL requests still require their respective
account consoles.

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
