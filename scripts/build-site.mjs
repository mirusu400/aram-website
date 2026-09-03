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
    description: "ARAM은 2000년대 한국 피처폰의 WIPI 게임과 앱을 Windows, macOS, Linux, Android 및 브라우저에서 실행하는 무료 오픈소스 에뮬레이터입니다.",
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
    description: "ARAM is a free, open-source emulator for Korean feature-phone WIPI games and apps on Windows, macOS, Linux, Android, and modern web browsers.",
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

export async function buildSite(outputDirectory, { measurementId = "" } = {}) {
  const destination = path.resolve(outputDirectory);
  const [landingTemplate, articleTemplate] = await Promise.all([
    readFile(path.join(projectRoot, "site", "index.template.html"), "utf8"),
    readFile(path.join(projectRoot, "site", "article.template.html"), "utf8"),
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
      DOWNLOAD_URL: `${locale.canonical}#download`,
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
        TROUBLESHOOTING_LABEL: labels.troubleshootingLabel,
        PRIVACY_LABEL: labels.privacyLabel,
        FOOTER_TEXT: labels.footerText,
        EYEBROW: page.eyebrow,
        HEADING: page.heading,
        LEAD: page.lead,
        BODY: page.body.trim(),
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

  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "sitemap.xml"), sitemapXML(sitemapEntries), "utf8");
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const destination = process.argv[2] || path.join(projectRoot, "_site");
  await buildSite(destination, { measurementId: process.env.GA_MEASUREMENT_ID || "" });
  console.log(`Built localized site in ${path.resolve(destination)}`);
}
