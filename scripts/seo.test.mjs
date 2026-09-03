import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildSite } from "./build-site.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugs = ["guide", "compatibility", "faq", "releases", "troubleshooting", "privacy"];

function metadata(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<meta (?:name|property)="${escaped}" content="([^"]+)"`))?.[1];
}

function link(html, relation, hreflang = null) {
  const languagePart = hreflang ? ` hreflang="${hreflang}"` : "";
  return html.match(new RegExp(`<link rel="${relation}"${languagePart} href="([^"]+)"`))?.[1];
}

function jsonLD(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
}

test("localized build emits distinct, indexable Korean and English pages", async (context) => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "aram-seo-"));
  context.after(async () => rm(temporaryRoot, { recursive: true, force: true }));
  await buildSite(temporaryRoot);

  const expected = ["index.html", "en/index.html"];
  for (const slug of slugs) {
    expected.push(`${slug}/index.html`, `en/${slug}/index.html`);
  }

  const canonicals = new Set();
  for (const relativePath of expected) {
    const html = await readFile(path.join(temporaryRoot, relativePath), "utf8");
    const language = relativePath.startsWith("en/") ? "en" : "ko";
    assert.match(html, new RegExp(`<html lang="${language}">`), relativePath);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${relativePath} should have exactly one h1`);
    assert.ok(metadata(html, "description"), `${relativePath} needs a description`);
    assert.equal(metadata(html, "robots"), "index, follow, max-image-preview:large");
    assert.ok(metadata(html, "og:image")?.endsWith(language === "ko" ? "/assets/og-ko.png" : "/assets/og-en.png"));
    assert.equal(metadata(html, "twitter:card"), "summary_large_image");
    assert.ok(link(html, "alternate", "ko"), `${relativePath} needs Korean hreflang`);
    assert.ok(link(html, "alternate", "en"), `${relativePath} needs English hreflang`);
    assert.ok(link(html, "alternate", "x-default"), `${relativePath} needs x-default hreflang`);
    const canonical = link(html, "canonical");
    assert.ok(canonical, `${relativePath} needs a canonical URL`);
    assert.ok(!canonicals.has(canonical), `duplicate canonical URL: ${canonical}`);
    canonicals.add(canonical);
    assert.doesNotMatch(html, /<meta name="keywords"/);
    assert.doesNotMatch(html, /navigator\.language|applyLang\(/);
    assert.doesNotMatch(html, /assets\/analytics\.js/);
    assert.doesNotThrow(() => jsonLD(html), `${relativePath} contains invalid JSON-LD`);
  }

  const koHome = await readFile(path.join(temporaryRoot, "index.html"), "utf8");
  const enHome = await readFile(path.join(temporaryRoot, "en/index.html"), "utf8");
  assert.match(koHome, /한국 피처폰 소프트웨어를 다시 켜다/);
  assert.match(enHome, /Bring Korean feature-phone software back to life/);
  for (const slug of slugs) {
    assert.match(koHome, new RegExp(`href="/${slug}/"`));
    assert.match(enHome, new RegExp(`href="/en/${slug}/"`));
  }

  const koFAQ = await readFile(path.join(temporaryRoot, "faq/index.html"), "utf8");
  const schemas = jsonLD(koFAQ);
  assert.ok(schemas.some((schema) => schema["@type"] === "FAQPage"));
});

test("sitemap contains every canonical page and no player variants", async (context) => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "aram-sitemap-"));
  context.after(async () => rm(temporaryRoot, { recursive: true, force: true }));
  await buildSite(temporaryRoot);
  const sitemap = await readFile(path.join(temporaryRoot, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(locations.length, 14);
  assert.equal(new Set(locations).size, 14);
  assert.ok(locations.includes("https://aram.mir.sh/"));
  assert.ok(locations.includes("https://aram.mir.sh/en/"));
  assert.ok(locations.every((location) => !location.includes("/player") && !location.includes("?")));
  assert.equal((sitemap.match(/hreflang="ko"/g) || []).length, 14);
  assert.equal((sitemap.match(/hreflang="en"/g) || []).length, 14);
});

test("analytics is opt-in, query-free, and excluded from the player", async (context) => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "aram-analytics-"));
  context.after(async () => rm(temporaryRoot, { recursive: true, force: true }));
  await buildSite(temporaryRoot, { measurementId: "G-TEST12345" });

  for (const relativePath of ["index.html", "en/index.html", "privacy/index.html", "en/guide/index.html"]) {
    const html = await readFile(path.join(temporaryRoot, relativePath), "utf8");
    assert.match(html, /data-measurement-id="G-TEST12345"/);
    assert.match(html, /<link rel="stylesheet" href="\/assets\/analytics\.css">/);
    assert.match(html, /id="analyticsAccept"/);
    assert.match(html, /id="analyticsDecline"/);
  }

  const runtime = await readFile(path.join(projectRoot, "assets", "analytics.js"), "utf8");
  assert.match(runtime, /return `\$\{location\.origin\}\$\{location\.pathname\}`/);
  assert.doesNotMatch(runtime, /page_location:\s*location\.href/);
  assert.match(runtime, /send_page_view: false/);
  assert.match(runtime, /page_referrer: pageReferrer\(\)/);
  assert.match(runtime, /ad_storage: "denied"/);
  assert.match(runtime, /allow_google_signals: false/);
  assert.match(runtime, /cookie_domain: "aram\.mir\.sh"/);
  for (const eventName of ["web_player_launch", "download_click", "language_switch", "github_click"]) {
    assert.match(runtime, new RegExp(`"${eventName}"`));
  }

  const player = await readFile(path.join(projectRoot, "player", "index.html"), "utf8");
  assert.doesNotMatch(player, /analytics|googletagmanager|gtag/i);
  await assert.rejects(
    buildSite(path.join(temporaryRoot, "invalid"), { measurementId: "UA-NOT-GA4" }),
    /GA_MEASUREMENT_ID/,
  );
});

test("social cards have the declared dimensions and player stays out of search", async () => {
  for (const filename of ["og-ko.png", "og-en.png"]) {
    const imagePath = path.join(projectRoot, "assets", filename);
    const info = await stat(imagePath);
    assert.ok(info.size > 10_000, `${filename} should not be an empty placeholder`);
    const png = await readFile(imagePath);
    assert.equal(png.toString("ascii", 1, 4), "PNG");
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
  }
  const player = await readFile(path.join(projectRoot, "player", "index.html"), "utf8");
  assert.match(player, /<meta name="robots" content="noindex, follow">/);
});
