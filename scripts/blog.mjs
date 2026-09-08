import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = "https://aram.mir.sh";
export const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const prefix = (lang) => lang === "ko" ? "" : "/en";
export function parsePost(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  if (!match) throw new Error(`${filename}: expected JSON metadata between --- lines`);
  const meta = JSON.parse(match[1]);
  for (const key of ["slug", "lang", "title", "description", "author", "published", "modified"]) {
    if (typeof meta[key] !== "string" || !meta[key].trim()) throw new Error(`${filename}: missing ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug) || !["ko", "en"].includes(meta.lang)) throw new Error(`${filename}: invalid slug or language`);
  for (const key of ["published", "modified"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta[key]) || new Date(meta[key]).toISOString().slice(0, 10) !== meta[key]) throw new Error(`${filename}: invalid ${key}`);
  }
  if (meta.modified < meta.published) throw new Error(`${filename}: modified precedes published`);
  if (meta.draft !== undefined && typeof meta.draft !== "boolean") throw new Error(`${filename}: draft must be boolean`);
  if (meta.image && !/^\/assets\/[a-zA-Z0-9/_.-]+\.(png|jpg|jpeg|webp)$/.test(meta.image)) throw new Error(`${filename}: invalid image`);
  return { ...meta, markdown: match[2], url: `${base}${prefix(meta.lang)}/blog/${meta.slug}/` };
}

export async function loadBlog(directory, renderMarkdown) {
  const posts = [];
  const seen = new Set();
  for (const filename of (await readdir(directory)).filter((name) => name.endsWith(".md")).sort()) {
    const post = parsePost(await readFile(path.join(directory, filename), "utf8"), filename);
    const key = `${post.lang}/${post.slug}`;
    if (seen.has(key)) throw new Error(`Duplicate blog post: ${key}`);
    seen.add(key);
    if (post.draft || post.published > new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)) continue;
    posts.push({ ...post, html: renderMarkdown(post.markdown, post.lang) });
  }
  posts.sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug));
  const index = { slug: "blog", blog: true, locales: {} };
  const definitions = new Map();
  for (const lang of ["ko", "en"]) {
    const local = posts.filter((post) => post.lang === lang);
    index.locales[lang] = {
      title: lang === "ko" ? "ARAM 블로그 - 피처폰 에뮬레이터 이야기" : "ARAM Blog - Feature-phone emulation",
      description: lang === "ko" ? "ARAM 사용 팁, 호환성 기록과 피처폰 에뮬레이터 개발 이야기를 읽어보세요." : "Read ARAM usage tips, compatibility records, and feature-phone emulator development stories.",
      heading: lang === "ko" ? "ARAM 블로그" : "ARAM Blog", eyebrow: "ARAM JOURNAL",
      lead: lang === "ko" ? "피처폰 소프트웨어를 다시 만나는 과정과 기록." : "Notes on bringing feature-phone software back to life.",
      body: `<p><a href="${prefix(lang)}/blog/feed.xml">RSS</a></p><div class="release-list">${local.map((post) => `<section class="release-card"><time datetime="${post.published}">${post.published}</time><h2><a href="${prefix(lang)}/blog/${post.slug}/">${escape(post.title)}</a></h2><p>${escape(post.description)}</p><p>${escape(post.author)}</p></section>`).join("")}</div>${local.length ? "" : `<p>${lang === "ko" ? "첫 글을 준비하고 있습니다." : "Our first English article is on its way."}</p>`}`,
      lastmod: local.reduce((date, post) => post.modified > date ? post.modified : date, "2026-09-06"),
    };
  }
  for (const post of posts) {
    const slug = `blog/${post.slug}`;
    if (!definitions.has(slug)) definitions.set(slug, { slug, blog: true, locales: {} });
    const image = `${base}${post.image || `/assets/og-${post.lang}.png`}`;
    definitions.get(slug).locales[post.lang] = {
      title: `${escape(post.title)} - ARAM ${post.lang === "ko" ? "블로그" : "Blog"}`, description: escape(post.description), heading: escape(post.title),
      eyebrow: "ARAM JOURNAL", lead: escape(post.description), lastmod: post.modified, image,
      body: `<p class="release-meta">${escape(post.author)} · <time datetime="${post.published}">${post.published}</time> · ${post.lang === "ko" ? "수정" : "Updated"}: <time datetime="${post.modified}">${post.modified}</time></p>\n${post.html}\n<p><a href="${prefix(post.lang)}/blog/">${post.lang === "ko" ? "블로그 글 목록" : "All posts"}</a></p>`,
      post,
      schema: { "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${post.url}#article`, mainEntityOfPage: { "@id": `${post.url}#webpage` }, headline: post.title, description: post.description, image: [image], datePublished: `${post.published}T00:00:00+09:00`, dateModified: `${post.modified}T00:00:00+09:00`, author: { "@type": "Person", name: post.author }, publisher: { "@type": "Organization", name: "ARAM", url: base }, inLanguage: post.lang },
    };
  }
  return { posts, pages: [index, ...definitions.values()] };
}

export async function writeFeeds(destination, posts) {
  for (const lang of ["ko", "en"]) {
    const url = `${base}${prefix(lang)}/blog/`;
    const items = posts.filter((post) => post.lang === lang).slice(0, 30).map((post) => `<item><title>${escape(post.title)}</title><link>${post.url}</link><guid isPermaLink="true">${post.url}</guid><pubDate>${new Date(`${post.published}T00:00:00+09:00`).toUTCString()}</pubDate><description>${escape(post.html)}</description></item>`).join("\n");
    const directory = path.join(destination, lang === "ko" ? "blog" : "en/blog");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>ARAM Blog</title><link>${url}</link><description>ARAM emulator stories</description><language>${lang}</language><atom:link href="${url}feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, "utf8");
  }
}
