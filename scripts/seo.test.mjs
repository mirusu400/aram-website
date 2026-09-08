import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildSite } from "./build-site.mjs";
import { loadBlog, parsePost } from "./blog.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugs = ["download", "press", "guide", "compatibility", "faq", "releases", "troubleshooting", "privacy", "blog"];
const blog = await loadBlog(path.join(projectRoot, "site", "blog"), (text) => text);
const storedReleases = JSON.parse(await readFile(path.join(projectRoot, "site", "releases.json"), "utf8"));
const releaseSlugs = storedReleases.map((release) => release.slug);

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
  for (const slug of releaseSlugs) {
    expected.push(`releases/${slug}/index.html`, `en/releases/${slug}/index.html`);
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

  const koDownload = await readFile(path.join(temporaryRoot, "download/index.html"), "utf8");
  assert.match(koDownload, /피처폰 게임 에뮬레이터 PC·안드로이드 다운로드/);
  assert.match(koDownload, /피쳐폰/);
  const koCompatibility = await readFile(path.join(temporaryRoot, "compatibility/index.html"), "utf8");
  assert.match(koCompatibility, /ARAM v0\.2\.0/);
  assert.match(koCompatibility, /2026-09-02/);
  assert.match(koCompatibility, /QCSBL→OEMSBL/);
  const koPress = await readFile(path.join(temporaryRoot, "press/index.html"), "utf8");
  assert.match(koPress, /ARAM Emulator 미디어 키트/);
  assert.match(koPress, /assets\/shots\/shot-06\.png/);

  if (releaseSlugs.includes("v0-2-0")) {
    const release = await readFile(path.join(temporaryRoot, "releases/v0-2-0/index.html"), "utf8");
    assert.match(release, /공식 릴리스 노트/);
    assert.match(release, /릴리스가 발표한 변경 사항/);
    assert.match(release, /GitHub Release/);
  }
});

test("sitemap contains every canonical page and no player variants", async (context) => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "aram-sitemap-"));
  context.after(async () => rm(temporaryRoot, { recursive: true, force: true }));
  await buildSite(temporaryRoot);
  const sitemap = await readFile(path.join(temporaryRoot, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedCount = (1 + slugs.length + releaseSlugs.length) * 2 + blog.posts.length;
  assert.equal(locations.length, expectedCount);
  assert.equal(new Set(locations).size, expectedCount);
  assert.ok(locations.includes("https://aram.mir.sh/"));
  assert.ok(locations.includes("https://aram.mir.sh/en/"));
  assert.ok(locations.every((location) => !location.includes("/player") && !location.includes("?")));
  for (const language of ["ko", "en"]) {
    const missing = blog.pages.filter((page) => !page.locales[language]).reduce((count, page) => count + Object.keys(page.locales).length, 0);
    assert.equal((sitemap.match(new RegExp(`hreflang="${language}"`, "g")) || []).length, expectedCount - missing);
  }
});

test("blog publishing keeps drafts private and only links real translations", async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "aram-blog-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const content = path.join(root, "content");
  await mkdir(content);
  const meta = { slug: "sample", lang: "ko", title: 'Test & "title"', description: "A useful description", author: "Writer & Co", published: "2026-01-01", modified: "2026-01-02" };
  const source = (data) => `---\n${JSON.stringify(data)}\n---\n## Heading\n\nFull RSS body with <script>alert(1)</script> and **emphasis**.\n\n[Guide](https://aram.mir.sh/guide/)`;
  await writeFile(path.join(content, "ko.md"), source(meta));
  await writeFile(path.join(content, "draft.md"), source({ ...meta, slug: "draft", draft: true }));
  await writeFile(path.join(content, "future.md"), source({ ...meta, slug: "future", published: "2999-01-01", modified: "2999-01-01" }));
  const output = path.join(root, "output");
  await buildSite(output, { blogDirectory: content, measurementId: "G-TEST12345" });
  const html = await readFile(path.join(output, "blog/sample/index.html"), "utf8");
  assert.equal(link(html, "canonical"), "https://aram.mir.sh/blog/sample/");
  assert.equal(link(html, "alternate", "en"), undefined);
  assert.doesNotMatch(html, /class="lang"|<script>alert/);
  assert.match(html, /&lt;script&gt;/);
  assert.equal(metadata(html, "og:type"), "article");
  assert.match(html, /data-measurement-id="G-TEST12345"/);
  const article = jsonLD(html).find((schema) => schema["@type"] === "BlogPosting");
  assert.equal(article.headline, meta.title);
  assert.equal(article.author.name, meta.author);
  assert.equal(article.dateModified, "2026-01-02T00:00:00+09:00");
  const webpage = jsonLD(html).find((schema) => schema["@type"] === "WebPage");
  assert.equal(webpage.workTranslation, undefined);
  assert.equal(webpage.breadcrumb.itemListElement.length, 3);
  const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");
  assert.match(sitemap, /blog\/sample\//);
  assert.doesNotMatch(sitemap, /blog\/(draft|future)\/|en\/blog\/sample/);
  const feed = await readFile(path.join(output, "blog/feed.xml"), "utf8");
  assert.match(feed, /Full RSS body/);
  assert.match(feed, /&lt;strong&gt;emphasis&lt;\/strong&gt;/);
  assert.doesNotMatch(feed, /blog\/(draft|future)\//);
  await assert.rejects(stat(path.join(output, "blog/draft/index.html")), { code: "ENOENT" });
  await writeFile(path.join(content, "en.md"), source({ ...meta, lang: "en" }));
  const translated = path.join(root, "translated");
  await buildSite(translated, { blogDirectory: content });
  const en = await readFile(path.join(translated, "en/blog/sample/index.html"), "utf8");
  assert.equal(link(en, "alternate", "ko"), "https://aram.mir.sh/blog/sample/");
  assert.equal(link(en, "alternate", "en"), "https://aram.mir.sh/en/blog/sample/");
  assert.throws(() => parsePost(source({ ...meta, slug: "../bad" }), "bad.md"), /invalid slug/);
  assert.throws(() => parsePost(source({ ...meta, modified: "2025-01-01" }), "bad.md"), /precedes/);
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
