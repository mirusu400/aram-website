const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { webcrypto } = require("node:crypto");
const { join } = require("node:path");
const test = require("node:test");

const permalink = require("./permalink.js");

const digest = "0123456789abcdef".repeat(4);

test("parse requires an HTTPS app URL and a SHA-256 digest", () => {
  assert.equal(permalink.parse("?ch=nightly", "https://aram.mir.sh/player/"), null);

  const parsed = permalink.parse(
    `?ch=nightly&app=${encodeURIComponent("https://example.invalid/apps/demo.zip")}` +
      `&sha256=${digest.toUpperCase()}`,
    "https://aram.mir.sh/player/",
  );
  assert.equal(parsed.url, "https://example.invalid/apps/demo.zip");
  assert.equal(parsed.name, "demo.zip");
  assert.equal(parsed.sha256, digest);

  assert.throws(
    () =>
      permalink.parse(
        `?app=${encodeURIComponent("http://example.invalid/demo.zip")}&sha256=${digest}`,
        "https://aram.mir.sh/player/",
      ),
    /HTTPS/,
  );
  assert.throws(
    () =>
      permalink.parse(
        `?app=${encodeURIComponent("https://example.invalid/demo.zip")}`,
        "https://aram.mir.sh/player/",
      ),
    /sha256/,
  );
  assert.throws(
    () =>
      permalink.parse(
        `?app=${encodeURIComponent("https://user@example.invalid/demo.zip")}` +
          `&sha256=${digest}`,
        "https://aram.mir.sh/player/",
      ),
    /credentials/,
  );
});

test("channel links preserve the complete app permalink", () => {
  const current =
    "https://aram.mir.sh/player/?ch=nightly" +
    `&app=${encodeURIComponent("https://example.invalid/demo.zip")}` +
    `&sha256=${digest}`;
  const stable = new URL(permalink.withChannel(current, "stable"));
  assert.equal(stable.searchParams.get("ch"), "stable");
  assert.equal(stable.searchParams.get("app"), "https://example.invalid/demo.zip");
  assert.equal(stable.searchParams.get("sha256"), digest);
});

test("fetchPackage downloads bounded bytes without credentials and verifies SHA-256", async () => {
  const bytes = Uint8Array.from([0x50, 0x4b, 0x03, 0x04]);
  const expected = Buffer.from(
    await webcrypto.subtle.digest("SHA-256", bytes),
  ).toString("hex");
  const calls = [];
  const result = await permalink.fetchPackage(
    {
      url: "https://example.invalid/demo.zip",
      name: "demo.zip",
      sha256: expected,
    },
    {
      fetchImpl: async (...args) => {
        calls.push(args);
        return new Response(bytes, {
          status: 200,
          headers: { "content-length": String(bytes.byteLength) },
        });
      },
      subtle: webcrypto.subtle,
    },
  );

  assert.deepEqual(Array.from(result.data), Array.from(bytes));
  assert.equal(result.name, "demo.zip");
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].credentials, "omit");
  assert.equal(calls[0][1].mode, "cors");
  assert.equal(calls[0][1].referrerPolicy, "no-referrer");
});

test("fetchPackage rejects oversized and digest-mismatched responses", async () => {
  const spec = {
    url: "https://example.invalid/demo.zip",
    name: "demo.zip",
    sha256: digest,
  };
  await assert.rejects(
    permalink.fetchPackage(spec, {
      fetchImpl: async () =>
        new Response(new Uint8Array(), {
          status: 200,
          headers: {
            "content-length": String(permalink.MAX_PACKAGE_BYTES + 1),
          },
        }),
      subtle: webcrypto.subtle,
    }),
    /too large/,
  );
  await assert.rejects(
    permalink.fetchPackage(spec, {
      fetchImpl: async () => new Response(Uint8Array.from([1, 2, 3])),
      subtle: webcrypto.subtle,
    }),
    /SHA-256 mismatch/,
  );
});

test("the player loads the permalink helper and hands bytes to the WASM bridge", () => {
  const html = readFileSync(join(__dirname, "index.html"), "utf8");
  assert.match(html, /<script src="permalink\.js"><\/script>/);
  assert.match(html, /globalThis\.__aramInitialPackage\s*=/);
});
