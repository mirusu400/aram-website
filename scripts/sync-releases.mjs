import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const repository = "mirusu400/aram-emu";
const releasesAPI = `https://api.github.com/repos/${repository}/releases?per_page=100`;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultDestination = path.join(projectRoot, "site", "releases.json");

function releaseSlug(tagName) {
  const slug = tagName
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error(`Release tag cannot produce a URL slug: ${tagName}`);
  return slug;
}

function trustedGitHubURL(value, kind) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "github.com") {
    throw new Error(`Unexpected ${kind} URL: ${value}`);
  }
  return url.href;
}

export function normalizeRelease(raw) {
  if (!raw || typeof raw !== "object") throw new Error("GitHub returned an invalid release record.");
  if (typeof raw.tag_name !== "string" || !raw.tag_name.trim()) throw new Error("A release is missing tag_name.");
  if (typeof raw.published_at !== "string" || Number.isNaN(Date.parse(raw.published_at))) {
    throw new Error(`Release ${raw.tag_name} has an invalid published_at value.`);
  }

  const tagName = raw.tag_name.trim();
  const assets = Array.isArray(raw.assets)
    ? raw.assets.map((asset) => ({
        name: String(asset.name || "").trim(),
        url: trustedGitHubURL(String(asset.browser_download_url || ""), "release asset"),
        size: Number.isSafeInteger(asset.size) && asset.size >= 0 ? asset.size : 0,
      })).filter((asset) => asset.name)
    : [];

  return {
    tagName,
    slug: releaseSlug(tagName),
    name: String(raw.name || tagName).trim() || tagName,
    publishedAt: new Date(raw.published_at).toISOString(),
    prerelease: Boolean(raw.prerelease),
    url: trustedGitHubURL(String(raw.html_url || ""), "release"),
    body: typeof raw.body === "string" ? raw.body.trim() : "",
    assets,
  };
}

export async function fetchPublishedReleases({ fetchImpl = globalThis.fetch, token = "" } = {}) {
  if (typeof fetchImpl !== "function") throw new Error("A Fetch API implementation is required.");
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "aram-website-release-sync",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetchImpl(releasesAPI, { headers });
  if (!response.ok) throw new Error(`GitHub releases request failed with HTTP ${response.status}.`);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error("GitHub releases response was not an array.");

  const releases = payload
    .filter((release) => !release.draft && release.tag_name !== "nightly")
    .map(normalizeRelease)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
  const slugs = new Set();
  for (const release of releases) {
    if (slugs.has(release.slug)) throw new Error(`Duplicate release URL slug: ${release.slug}`);
    slugs.add(release.slug);
  }
  return releases;
}

export async function syncReleases(destination = defaultDestination, options = {}) {
  const releases = await fetchPublishedReleases(options);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(releases, null, 2)}\n`, "utf8");
  return releases;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const destination = process.argv[2] ? path.resolve(process.argv[2]) : defaultDestination;
  const releases = await syncReleases(destination, {
    token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "",
  });
  console.log(`Synced ${releases.length} published ARAM releases to ${destination}`);
}
