import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { optimizeAssets } from "./optimize-assets.mjs";

test("copied CSS, JavaScript, and player HTML are minified", async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "aram-optimize-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "assets"), { recursive: true });
  await mkdir(path.join(root, "player"), { recursive: true });

  const fixtures = {
    "assets/analytics.js": "// comment\nconst value = 1 + 2;\nwindow.value = value;\n",
    "assets/analytics.css": ".banner { color: red; padding: 0 0 0 0; }\n",
    "player/permalink.js": "// comment\nwindow.helper = function () { return true; };\n",
    "player/index.html": "<!doctype html><html><head><style>body { margin: 0; }</style></head><body> <p>Player</p> <script>window.ready = true;</script></body></html>",
  };
  for (const [relativePath, source] of Object.entries(fixtures)) {
    await writeFile(path.join(root, relativePath), source);
  }

  await optimizeAssets(root);

  for (const [relativePath, source] of Object.entries(fixtures)) {
    const optimized = await readFile(path.join(root, relativePath), "utf8");
    assert.ok(optimized.length < source.length, `${relativePath} should get smaller`);
    assert.doesNotMatch(optimized, /\/\/ comment|padding: 0 0 0 0/);
  }
});
