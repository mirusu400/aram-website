import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

import { pages } from "../site/pages.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseURL = "https://aram.mir.sh";

const localeConfig = {
  ko: {
    title: "ARAM - 한국 피처폰·WIPI 게임 에뮬레이터",
    description: "ARAM은 2000년대 한국 피처폰의 WIPI·SKVM·Raptor 게임과 앱을 Windows, macOS, Linux, Android 및 브라우저에서 실행하는 무료 오픈소스 에뮬레이터입니다.",
    canonical: `${baseURL}/`,
    homePath: "/",
    localePrefix: "/",
    alternateURL: `${baseURL}/en/`,
    alternateLang: "en",
    languageLabel: "English",
    languageTitle: "View this page in English",
    ogLocale: "ko_KR",
    ogAlternateLocale: "en_US",
    ogImage: `${baseURL}/assets/og-ko.png`,
    ogImageAlt: "ARAM 한국 피처폰·WIPI 에뮬레이터 화면",
    resourcesLabel: "ARAM 문서",
  },
  en: {
    title: "ARAM - Korean Feature-Phone (WIPI) Emulator",
    description: "ARAM is a free, open-source emulator for Korean feature-phone WIPI, SKVM, and Raptor games and apps on Windows, macOS, Linux, Android, and modern web browsers.",
    canonical: `${baseURL}/en/`,
    homePath: "/en/",
    localePrefix: "/en/",
    alternateURL: `${baseURL}/`,
    alternateLang: "ko",
    languageLabel: "한국어",
    languageTitle: "한국어로 보기",
    ogLocale: "en_US",
    ogAlternateLocale: "ko_KR",
    ogImage: `${baseURL}/assets/og-en.png`,
    ogImageAlt: "ARAM Korean feature-phone WIPI emulator interface",
    resourcesLabel: "ARAM documentation",
  },
};

const articleLabels = {
  ko: {
    navLabel: "주요 메뉴",
    breadcrumbLabel: "현재 위치",
    relatedLabel: "관련 문서",
    guideLabel: "사용법",
    compatibilityLabel: "호환성",
    downloadLabel: "다운로드",
    releasesLabel: "릴리스",
    pressLabel: "보도자료",
    troubleshootingLabel: "문제 해결",
    privacyLabel: "개인정보",
    footerText: "© 2026 ARAM · ARAM은 상용 게임이나 펌웨어를 배포하지 않습니다. 사용 권한이 있는 자료만 직접 제공하세요.",
  },
  en: {
    navLabel: "Primary navigation",
    breadcrumbLabel: "Breadcrumb",
    relatedLabel: "Related documentation",
    guideLabel: "Guide",
    compatibilityLabel: "Compatibility",
    downloadLabel: "Download",
    releasesLabel: "Releases",
    pressLabel: "Press",
    troubleshootingLabel: "Troubleshooting",
    privacyLabel: "Privacy",
    footerText: "© 2026 ARAM · ARAM does not distribute commercial games or firmware. Provide only material you are authorized to use.",
  },
};

function analyticsMarkup(rawMeasurementId, language, localePrefix) {
  const measurementId = rawMeasurementId.trim();
  if (!measurementId) return { head: "", body: "" };
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
    throw new Error("GA_MEASUREMENT_ID must look like G-XXXXXXXXXX.");
  }
  const copy = language === "ko"
    ? {
        message: "ARAM은 동의한 경우에만 Google Analytics로 쿼리를 제외한 페이지 경로와 다운로드·링크 클릭을 집계합니다. 파일명, 게임명, 패키지 URL과 해시는 수집하지 않습니다.",
        privacy: "개인정보 안내",
        accept: "분석 허용",
        decline: "거부",
        later: "나중에",
        settings: "분석 설정",
      }
    : {
        message: "ARAM uses Google Analytics only after consent to count query-free page paths and download or link clicks. It does not collect filenames, game names, package URLs, or hashes.",
        privacy: "Privacy notice",
        accept: "Allow analytics",
        decline: "Decline",
        later: "Later",
        settings: "Analytics settings",
      };
  const body = `<aside class="analytics-consent" id="analyticsConsent" role="dialog" aria-labelledby="analyticsConsentText" hidden>
  <p id="analyticsConsentText">${copy.message} <a href="${localePrefix}privacy/">${copy.privacy}</a></p>
  <div class="analytics-consent-actions">
    <button type="button" id="analyticsAccept">${copy.accept}</button>
    <button type="button" id="analyticsDecline">${copy.decline}</button>
    <button type="button" id="analyticsLater">${copy.later}</button>
  </div>
</aside>
<button class="analytics-settings" type="button" id="analyticsSettings" hidden>${copy.settings}</button>
<script src="/assets/analytics.js" data-measurement-id="${measurementId}"></script>`;
  return { head: '<link rel="stylesheet" href="/assets/analytics.css">', body };
}

function replaceTokens(source, values, sourceName) {
  let result = source;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, String(value));
  }
  const missing = [...new Set([...result.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((match) => match[1]))];
  if (missing.length) {
    throw new Error(`${sourceName} has unresolved tokens: ${missing.join(", ")}`);
  }
  return result;
}

function extractDictionary(template) {
  const match = template.match(/const I18N=(\{[\s\S]*?\n\});\nconst LS_THEME/);
  if (!match) throw new Error("Could not find the landing-page translation dictionary.");
  return vm.runInNewContext(`(${match[1]})`, Object.create(null), { timeout: 1000 });
}

function localizeDataElements(source, language, dictionary) {
  const elementPattern = /<([a-z][a-z0-9-]*)([^>]*\bdata-k="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi;
  return source.replace(elementPattern, (whole, tag, attributes, key) => {
    const translation = dictionary[key]?.[language];
    if (typeof translation !== "string") {
      throw new Error(`Missing ${language} translation for data-k=${key}`);
    }
    return `<${tag}${attributes}>${translation}</${tag}>`;
  });
}

function prettyJSON(value) {
  return JSON.stringify(value, null, 2).replaceAll("</", "<\\/");
}

function webpageSchema(page, language, canonical, koURL, enURL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: page.title,
    description: page.description,
    inLanguage: language,
    isPartOf: { "@id": `${baseURL}/#website` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ARAM", item: language === "ko" ? `${baseURL}/` : `${baseURL}/en/` },
        { "@type": "ListItem", position: 2, name: page.heading, item: canonical },
      ],
    },
    translationOfWork: language === "en" ? { "@id": `${koURL}#webpage` } : undefined,
    workTranslation: language === "ko" ? { "@id": `${enURL}#webpage` } : undefined,
  };
}

function faqSchema(items, language, canonical) {
  if (!items) return "";
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    inLanguage: language,
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return `<script type="application/ld+json">${prettyJSON(schema)}</script>`;
}

function sourceLastModified(paths) {
  try {
    const value = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...paths], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  } catch {
    // A source file is uncommitted during local development; use today's date.
  }
  return new Date().toISOString().slice(0, 10);
}

function xmlEscape(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function sitemapXML(entries) {
  const items = entries.map(({ canonical, koURL, enURL, lastmod }) => `  <url>
    <loc>${xmlEscape(canonical)}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="ko" href="${xmlEscape(koURL)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(enURL)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(koURL)}"/>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${items}
</urlset>
`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function storedRelease(value) {
  if (!value || typeof value !== "object") throw new Error("Invalid stored release entry.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug || "")) throw new Error(`Invalid release slug: ${value.slug}`);
  if (!value.tagName || !value.name || Number.isNaN(Date.parse(value.publishedAt))) {
    throw new Error(`Release ${value.slug} is missing required metadata.`);
  }
  const releaseURL = new URL(value.url);
  if (releaseURL.protocol !== "https:" || releaseURL.hostname !== "github.com") {
    throw new Error(`Invalid release URL for ${value.slug}.`);
  }
  const assets = (Array.isArray(value.assets) ? value.assets : []).map((asset) => {
    const assetURL = new URL(asset.url);
    if (assetURL.protocol !== "https:" || assetURL.hostname !== "github.com") {
      throw new Error(`Invalid asset URL for ${value.slug}.`);
    }
    return {
      name: String(asset.name || ""),
      url: assetURL.href,
      size: Number.isSafeInteger(asset.size) && asset.size >= 0 ? asset.size : 0,
    };
  }).filter((asset) => asset.name);
  return {
    tagName: String(value.tagName),
    slug: value.slug,
    name: String(value.name),
    publishedAt: new Date(value.publishedAt).toISOString(),
    prerelease: Boolean(value.prerelease),
    url: releaseURL.href,
    body: String(value.body || ""),
    assets,
  };
}

async function loadStoredReleases() {
  const source = await readFile(path.join(projectRoot, "site", "releases.json"), "utf8");
  const payload = JSON.parse(source);
  if (!Array.isArray(payload)) throw new Error("site/releases.json must contain an array.");
  return payload.map(storedRelease).sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

function renderInlineMarkdown(value) {
  const links = [];
  const tokenized = String(value).replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, (whole, label, href) => {
    const url = new URL(href);
    if (url.protocol !== "https:") return whole;
    const token = `\u0001ARAM-LINK-${links.length}\u0001`;
    links.push(`<a href="${escapeHTML(url.href)}" rel="noopener">${escapeHTML(label)}</a>`);
    return token;
  });
  let output = escapeHTML(tokenized)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
  for (let index = 0; index < links.length; index += 1) {
    output = output.replace(`\u0001ARAM-LINK-${index}\u0001`, links[index]);
  }
  return output;
}

function renderReleaseMarkdown(markdown, language) {
  if (!markdown.trim()) {
    return language === "ko"
      ? "<p>별도의 릴리스 노트가 제공되지 않았습니다.</p>"
      : "<p>No additional release notes were provided.</p>";
  }
  const output = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let inCode = false;
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) output.push(`<ul>${list.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushCode = () => {
    if (code.length) output.push(`<pre><code>${escapeHTML(code.join("\n"))}</code></pre>`);
    code = [];
  };

  for (const line of markdown.replaceAll("\r\n", "\n").split("\n")) {
    if (/^```/.test(line)) {
      flushParagraph();
      flushList();
      if (inCode) flushCode();
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length <= 3 ? 2 : 3;
      output.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const item = line.match(/^[-*]\s+(.+)$/);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (list.length) list[list.length - 1] += ` ${line.trim()}`;
    else paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  if (inCode || code.length) flushCode();
  return output.join("\n");
}

function formattedDate(value, language) {
  return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: language === "ko" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formattedSize(bytes) {
  if (!bytes) return "";
  const units = ["B", "KiB", "MiB", "GiB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

function releaseListHTML(releases, language) {
  const prefix = language === "ko" ? "" : "/en";
  const labels = language === "ko"
    ? { heading: "버전별 릴리스 글", empty: "아직 게시된 안정판 릴리스가 없습니다.", stable: "안정판", prerelease: "시험판", notes: "릴리스 노트 보기" }
    : { heading: "Release articles by version", empty: "No published Stable releases are available yet.", stable: "Stable", prerelease: "Pre-release", notes: "Read release notes" };
  if (!releases.length) return `<h2>${labels.heading}</h2><p>${labels.empty}</p>`;
  const cards = releases.map((release) => `<section class="release-card">
      <div class="release-meta"><span>${release.prerelease ? labels.prerelease : labels.stable}</span><time datetime="${escapeHTML(release.publishedAt)}">${escapeHTML(formattedDate(release.publishedAt, language))}</time></div>
      <h3>${escapeHTML(release.name)}</h3>
      <p><code>${escapeHTML(release.tagName)}</code></p>
      <a href="${prefix}/releases/${release.slug}/">${labels.notes}</a>
    </section>`).join("\n");
  return `<h2>${labels.heading}</h2><div class="release-list">${cards}</div>`;
}

function releasePage(release, language) {
  const isKorean = language === "ko";
  const date = formattedDate(release.publishedAt, language);
  const assetRows = release.assets.length
    ? release.assets.map((asset) => `<tr><td><a href="${escapeHTML(asset.url)}">${escapeHTML(asset.name)}</a></td><td>${escapeHTML(formattedSize(asset.size))}</td></tr>`).join("\n")
    : `<tr><td colspan="2">${isKorean ? "공개된 첨부 파일이 없습니다." : "No public assets are attached."}</td></tr>`;
  const channel = release.prerelease ? (isKorean ? "시험판" : "Pre-release") : (isKorean ? "안정판" : "Stable");
  return {
    title: isKorean
      ? `${release.name} 릴리스 노트 - ARAM Emulator`
      : `${release.name} Release Notes - ARAM Emulator`,
    description: isKorean
      ? `${release.name}의 공개일, 다운로드 파일과 공식 GitHub 릴리스 노트를 확인하세요. 개별 게임 호환성은 별도의 검증 기록을 기준으로 합니다.`
      : `See the publication date, downloads, and official GitHub notes for ${release.name}. Per-title compatibility requires a separate verified record.`,
    eyebrow: "RELEASE NOTES",
    heading: release.name,
    lead: isKorean
      ? `${date}에 공개된 ${channel}입니다. 이 페이지는 공식 GitHub 릴리스 정보를 검색 가능한 HTML로 다시 제공하며, 지원 범위는 정확한 버전과 검증 기록을 함께 확인해야 합니다.`
      : `Published ${date} as a ${channel}. This page republishes the official GitHub release information as searchable HTML; verify support against an exact version and compatibility record.`,
    body: `
    <div class="table-wrap"><table><tbody>
      <tr><th>${isKorean ? "버전" : "Version"}</th><td><code>${escapeHTML(release.tagName)}</code></td></tr>
      <tr><th>${isKorean ? "공개일" : "Published"}</th><td><time datetime="${escapeHTML(release.publishedAt)}">${escapeHTML(date)}</time></td></tr>
      <tr><th>${isKorean ? "채널" : "Channel"}</th><td>${channel}</td></tr>
      <tr><th>${isKorean ? "원문" : "Source"}</th><td><a href="${escapeHTML(release.url)}">GitHub Release</a></td></tr>
    </tbody></table></div>
    <div class="callout">${isKorean ? "아래 내용은 해당 릴리스가 발표한 변경 사항입니다. 특정 게임·펌웨어가 끝까지 동작한다는 일반 보장이 아니며, 호환성 페이지의 단계별 검증 범위가 우선합니다." : "The notes below describe changes announced for this release. They are not a blanket promise that every game or firmware works end to end; the milestone-based compatibility record takes precedence."}</div>
    <h2>${isKorean ? "다운로드 파일" : "Downloads"}</h2>
    <div class="table-wrap"><table><thead><tr><th>${isKorean ? "파일" : "File"}</th><th>${isKorean ? "크기" : "Size"}</th></tr></thead><tbody>${assetRows}</tbody></table></div>
    <h2>${isKorean ? "공식 릴리스 노트" : "Official release notes"}</h2>
    <div class="release-notes">${renderReleaseMarkdown(release.body, language)}</div>
    <div class="actions"><a class="button primary" href="${language === "ko" ? "/download/" : "/en/download/"}">${isKorean ? "다운로드 안내" : "Download guide"}</a><a class="button" href="${language === "ko" ? "/compatibility/" : "/en/compatibility/"}">${isKorean ? "검증된 호환성 기준" : "Verified compatibility criteria"}</a></div>`,
  };
}

export async function buildSite(outputDirectory, { measurementId = "", releases = null } = {}) {
  const destination = path.resolve(outputDirectory);
  const [landingTemplate, articleTemplate, storedReleases] = await Promise.all([
    readFile(path.join(projectRoot, "site", "index.template.html"), "utf8"),
    readFile(path.join(projectRoot, "site", "article.template.html"), "utf8"),
    releases === null ? loadStoredReleases() : Promise.resolve(releases.map(storedRelease)),
  ]);
  const dictionary = extractDictionary(landingTemplate);
  const sitemapEntries = [];
  const landingLastmod = sourceLastModified(["site/index.template.html", "scripts/build-site.mjs"]);

  for (const language of ["ko", "en"]) {
    const locale = localeConfig[language];
    const analytics = analyticsMarkup(measurementId, language, locale.localePrefix);
    const values = {
      LANG: language,
      TITLE: locale.title,
      DESCRIPTION: locale.description,
      CANONICAL: locale.canonical,
      HOME_PATH: locale.homePath,
      LOCALE_PREFIX: locale.localePrefix,
      ALTERNATE_URL: locale.alternateURL,
      ALTERNATE_LANG: locale.alternateLang,
      LANGUAGE_LABEL: locale.languageLabel,
      LANGUAGE_TITLE: locale.languageTitle,
      OG_LOCALE: locale.ogLocale,
      OG_ALTERNATE_LOCALE: locale.ogAlternateLocale,
      OG_IMAGE: locale.ogImage,
      OG_IMAGE_ALT: locale.ogImageAlt,
      RESOURCES_LABEL: locale.resourcesLabel,
      DOWNLOAD_URL: language === "ko" ? `${baseURL}/download/` : `${baseURL}/en/download/`,
      ANALYTICS_HEAD: analytics.head,
      ANALYTICS_BODY: analytics.body,
    };
    const localized = localizeDataElements(landingTemplate, language, dictionary);
    const rendered = replaceTokens(localized, values, "landing page");
    const outputPath = language === "ko" ? path.join(destination, "index.html") : path.join(destination, "en", "index.html");
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, rendered, "utf8");
    sitemapEntries.push({
      canonical: locale.canonical,
      koURL: `${baseURL}/`,
      enURL: `${baseURL}/en/`,
      lastmod: landingLastmod,
    });
  }

  const articleLastmod = sourceLastModified(["site/article.template.html", "site/pages.mjs", "scripts/build-site.mjs"]);
  for (const pageDefinition of pages) {
    const koURL = `${baseURL}/${pageDefinition.slug}/`;
    const enURL = `${baseURL}/en/${pageDefinition.slug}/`;
    for (const language of ["ko", "en"]) {
      const page = pageDefinition.locales[language];
      const locale = localeConfig[language];
      const labels = articleLabels[language];
      const analytics = analyticsMarkup(measurementId, language, locale.localePrefix);
      const canonical = language === "ko" ? koURL : enURL;
      const alternateURL = language === "ko" ? enURL : koURL;
      const body = pageDefinition.slug === "releases"
        ? `${page.body.trim()}\n${releaseListHTML(storedReleases, language)}`
        : page.body.trim();
      const rendered = replaceTokens(articleTemplate, {
        LANG: language,
        TITLE: page.title,
        DESCRIPTION: page.description,
        CANONICAL: canonical,
        KO_URL: koURL,
        EN_URL: enURL,
        HOME_PATH: locale.homePath,
        LOCALE_PREFIX: locale.localePrefix,
        ALTERNATE_URL: alternateURL,
        ALTERNATE_LANG: locale.alternateLang,
        LANGUAGE_LABEL: locale.languageLabel,
        OG_LOCALE: locale.ogLocale,
        OG_ALTERNATE_LOCALE: locale.ogAlternateLocale,
        OG_IMAGE: locale.ogImage,
        OG_IMAGE_ALT: locale.ogImageAlt,
        WEBPAGE_SCHEMA: prettyJSON(webpageSchema(page, language, canonical, koURL, enURL)),
        EXTRA_SCHEMA: faqSchema(page.faq, language, canonical),
        NAV_LABEL: labels.navLabel,
        BREADCRUMB_LABEL: labels.breadcrumbLabel,
        BREADCRUMB_CURRENT: page.heading,
        RELATED_LABEL: labels.relatedLabel,
        GUIDE_LABEL: labels.guideLabel,
        COMPATIBILITY_LABEL: labels.compatibilityLabel,
        DOWNLOAD_LABEL: labels.downloadLabel,
        RELEASES_LABEL: labels.releasesLabel,
        PRESS_LABEL: labels.pressLabel,
        TROUBLESHOOTING_LABEL: labels.troubleshootingLabel,
        PRIVACY_LABEL: labels.privacyLabel,
        FOOTER_TEXT: labels.footerText,
        EYEBROW: page.eyebrow,
        HEADING: page.heading,
        LEAD: page.lead,
        BODY: body,
        ANALYTICS_HEAD: analytics.head,
        ANALYTICS_BODY: analytics.body,
      }, `${language}/${pageDefinition.slug}`);
      const relativeParts = language === "ko" ? [pageDefinition.slug, "index.html"] : ["en", pageDefinition.slug, "index.html"];
      const outputPath = path.join(destination, ...relativeParts);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, rendered, "utf8");
      sitemapEntries.push({ canonical, koURL, enURL, lastmod: articleLastmod });
    }
  }

  for (const release of storedReleases) {
    const koURL = `${baseURL}/releases/${release.slug}/`;
    const enURL = `${baseURL}/en/releases/${release.slug}/`;
    for (const language of ["ko", "en"]) {
      const page = releasePage(release, language);
      const locale = localeConfig[language];
      const labels = articleLabels[language];
      const analytics = analyticsMarkup(measurementId, language, locale.localePrefix);
      const canonical = language === "ko" ? koURL : enURL;
      const alternateURL = language === "ko" ? enURL : koURL;
      const rendered = replaceTokens(articleTemplate, {
        LANG: language,
        TITLE: page.title,
        DESCRIPTION: page.description,
        CANONICAL: canonical,
        KO_URL: koURL,
        EN_URL: enURL,
        HOME_PATH: locale.homePath,
        LOCALE_PREFIX: locale.localePrefix,
        ALTERNATE_URL: alternateURL,
        ALTERNATE_LANG: locale.alternateLang,
        LANGUAGE_LABEL: locale.languageLabel,
        OG_LOCALE: locale.ogLocale,
        OG_ALTERNATE_LOCALE: locale.ogAlternateLocale,
        OG_IMAGE: locale.ogImage,
        OG_IMAGE_ALT: locale.ogImageAlt,
        WEBPAGE_SCHEMA: prettyJSON(webpageSchema(page, language, canonical, koURL, enURL)),
        EXTRA_SCHEMA: "",
        NAV_LABEL: labels.navLabel,
        BREADCRUMB_LABEL: labels.breadcrumbLabel,
        BREADCRUMB_CURRENT: page.heading,
        RELATED_LABEL: labels.relatedLabel,
        GUIDE_LABEL: labels.guideLabel,
        COMPATIBILITY_LABEL: labels.compatibilityLabel,
        DOWNLOAD_LABEL: labels.downloadLabel,
        RELEASES_LABEL: labels.releasesLabel,
        PRESS_LABEL: labels.pressLabel,
        TROUBLESHOOTING_LABEL: labels.troubleshootingLabel,
        PRIVACY_LABEL: labels.privacyLabel,
        FOOTER_TEXT: labels.footerText,
        EYEBROW: page.eyebrow,
        HEADING: page.heading,
        LEAD: page.lead,
        BODY: page.body.trim(),
        ANALYTICS_HEAD: analytics.head,
        ANALYTICS_BODY: analytics.body,
      }, `${language}/releases/${release.slug}`);
      const relativeParts = language === "ko"
        ? ["releases", release.slug, "index.html"]
        : ["en", "releases", release.slug, "index.html"];
      const outputPath = path.join(destination, ...relativeParts);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, rendered, "utf8");
      sitemapEntries.push({ canonical, koURL, enURL, lastmod: release.publishedAt.slice(0, 10) });
    }
  }

  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "sitemap.xml"), sitemapXML(sitemapEntries), "utf8");
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const destination = process.argv[2] || path.join(projectRoot, "_site");
  await buildSite(destination, { measurementId: process.env.GA_MEASUREMENT_ID || "" });
  console.log(`Built localized site in ${path.resolve(destination)}`);
}
