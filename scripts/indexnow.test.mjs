import assert from "node:assert/strict";
import test from "node:test";

import { indexNowPayload, sitemapURLs } from "./submit-indexnow.mjs";

const key = "6c4e0a03d58b41e7a9f2c0bd7835e146";

test("extracts and deduplicates ARAM sitemap URLs", () => {
  const xml = `<?xml version="1.0"?><urlset>
    <url><loc>https://aram.mir.sh/</loc></url>
    <url><loc>https://aram.mir.sh/guide/</loc></url>
    <url><loc>https://aram.mir.sh/guide/</loc></url>
  </urlset>`;
  assert.deepEqual(sitemapURLs(xml), ["https://aram.mir.sh/", "https://aram.mir.sh/guide/"]);
});

test("refuses to submit URLs for another host", () => {
  assert.throws(() => sitemapURLs("<url><loc>https://example.com/</loc></url>"), /unexpected sitemap URL/);
});

test("builds an IndexNow payload whose public key filename matches", () => {
  const payload = indexNowPayload(["https://aram.mir.sh/"], key, `${key}.txt`);
  assert.equal(payload.host, "aram.mir.sh");
  assert.equal(payload.keyLocation, `https://aram.mir.sh/${key}.txt`);
  assert.throws(() => indexNowPayload(payload.urlList, key, "indexnow.txt"), /filename must match/);
});
