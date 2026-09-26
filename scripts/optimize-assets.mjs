import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { minify } from "html-minifier-terser";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function minifyJavaScript(source) {
  const wrapped = await minify(`<script>${source}</script>`, { minifyJS: true });
  return wrapped.slice("<script>".length, -"</script>".length);
}

async function minifyCSS(source) {
  const wrapped = await minify(`<style>${source}</style>`, { minifyCSS: true });
  return wrapped.slice("<style>".length, -"</style>".length);
}

async function optimizeFile(root, relativePath, transform) {
  const filename = path.join(root, relativePath);
  try {
    const source = await readFile(filename, "utf8");
    await writeFile(filename, await transform(source), "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

export async function optimizeAssets(root) {
  await Promise.all([
    optimizeFile(root, "assets/analytics.js", minifyJavaScript),
    optimizeFile(root, "assets/analytics.css", minifyCSS),
    optimizeFile(root, "player/permalink.js", minifyJavaScript),
    optimizeFile(root, "player/runtime.js", minifyJavaScript),
    optimizeFile(root, "player/index.html", (source) => minify(source, {
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
    })),
  ]);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const destination = path.resolve(process.argv[2] || path.join(projectRoot, "_site"));
  await optimizeAssets(destination);
  console.log(`Optimized static assets in ${destination}`);
}
