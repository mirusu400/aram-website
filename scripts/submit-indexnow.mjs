import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const endpoint = "https://api.indexnow.org/indexnow";
const siteHost = "aram.mir.sh";

export function sitemapURLs(xml) {
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  if (!urls.length) throw new Error("The sitemap does not contain any <loc> entries.");
  for (const value of urls) {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== siteHost) {
      throw new Error(`Refusing to submit an unexpected sitemap URL: ${value}`);
    }
  }
  return [...new Set(urls)];
}

export function indexNowPayload(urlList, key, keyFilename) {
  const normalizedKey = key.trim();
  if (!/^[a-f0-9]{8,128}$/i.test(normalizedKey)) throw new Error("IndexNow key must be 8-128 hexadecimal characters.");
  if (path.basename(keyFilename) !== `${normalizedKey}.txt`) {
    throw new Error("The IndexNow key filename must match the key value.");
  }
  return {
    host: siteHost,
    key: normalizedKey,
    keyLocation: `https://${siteHost}/${normalizedKey}.txt`,
    urlList,
  };
}

export async function submitIndexNow(sitemapPath, keyPath, { fetchImpl = globalThis.fetch } = {}) {
  const [xml, key] = await Promise.all([
    readFile(sitemapPath, "utf8"),
    readFile(keyPath, "utf8"),
  ]);
  const payload = indexNowPayload(sitemapURLs(xml), key, keyPath);
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`IndexNow submission failed with HTTP ${response.status}.`);
  return { status: response.status, submitted: payload.urlList.length };
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const [, , sitemapPath, keyPath] = process.argv;
  if (!sitemapPath || !keyPath) throw new Error("Usage: node scripts/submit-indexnow.mjs <sitemap.xml> <key.txt>");
  const result = await submitIndexNow(path.resolve(sitemapPath), path.resolve(keyPath));
  console.log(`IndexNow accepted ${result.submitted} URLs with HTTP ${result.status}.`);
}
