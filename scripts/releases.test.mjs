import assert from "node:assert/strict";
import test from "node:test";

import { fetchPublishedReleases, normalizeRelease } from "./sync-releases.mjs";

function rawRelease(overrides = {}) {
  return {
    tag_name: "v0.2.0",
    name: "ARAM v0.2.0",
    published_at: "2026-09-02T15:10:18Z",
    prerelease: false,
    draft: false,
    html_url: "https://github.com/mirusu400/aram-emu/releases/tag/v0.2.0",
    body: "### Changes\n- Safe **release** note",
    assets: [{
      name: "aram-windows-amd64.zip",
      browser_download_url: "https://github.com/mirusu400/aram-emu/releases/download/v0.2.0/aram-windows-amd64.zip",
      size: 1024,
    }],
    ...overrides,
  };
}

test("normalizes a GitHub release into a stable article URL", () => {
  const release = normalizeRelease(rawRelease());
  assert.equal(release.slug, "v0-2-0");
  assert.equal(release.assets[0].size, 1024);
  assert.equal(release.publishedAt, "2026-09-02T15:10:18.000Z");
});

test("rejects release and asset URLs outside GitHub", () => {
  assert.throws(() => normalizeRelease(rawRelease({ html_url: "https://example.com/release" })), /Unexpected release URL/);
  assert.throws(() => normalizeRelease(rawRelease({
    assets: [{ name: "bad.zip", browser_download_url: "https://example.com/bad.zip", size: 10 }],
  })), /Unexpected release asset URL/);
});

test("fetch excludes drafts and the rolling nightly release", async () => {
  const fetchImpl = async (url, options) => {
    assert.match(url, /api\.github\.com/);
    assert.equal(options.headers.Authorization, "Bearer test-token");
    return {
      ok: true,
      status: 200,
      json: async () => [
        rawRelease(),
        rawRelease({ tag_name: "nightly", html_url: "https://github.com/mirusu400/aram-emu/releases/tag/nightly" }),
        rawRelease({ tag_name: "draft", draft: true, html_url: "https://github.com/mirusu400/aram-emu/releases/tag/draft" }),
      ],
    };
  };
  const releases = await fetchPublishedReleases({ fetchImpl, token: "test-token" });
  assert.deepEqual(releases.map((release) => release.tagName), ["v0.2.0"]);
});
