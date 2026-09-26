const assert = require("node:assert/strict");
const test = require("node:test");

const runtime = require("./runtime.js");

const oldVersion = "a".repeat(64);
const newVersion = "b".repeat(64);

test("checks the selected channel on every visit without reusing cached metadata", async () => {
  const requests = [];
  const versions = [oldVersion, newVersion];
  const request = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => ({ version: versions.shift() }) };
  };

  assert.equal(await runtime.fetchVersion("nightly", request), oldVersion);
  assert.equal(await runtime.fetchVersion("nightly", request), newVersion);
  assert.notEqual(requests[0].url, requests[1].url);
  for (const { url, options } of requests) {
    assert.match(url, /^nightly\/runtime\.json\?check=/);
    assert.deepEqual(options, { cache: "no-store" });
  }
  assert.equal(runtime.assetURL("nightly", "aram.wasm", oldVersion),
    `nightly/aram.wasm?v=${oldVersion}`);
  assert.equal(runtime.assetURL("nightly", "aram.wasm", newVersion),
    `nightly/aram.wasm?v=${newVersion}`);
  assert.equal(runtime.assetURL("nightly", "wasm_exec.js", newVersion),
    `nightly/wasm_exec.js?v=${newVersion}`);
});

test("refuses absent or malformed metadata instead of silently loading an old core", async () => {
  await assert.rejects(runtime.fetchVersion("stable", async () => ({ ok: false, status: 404 })), /404/);
  await assert.rejects(runtime.fetchVersion("stable", async () => ({
    ok: true,
    json: async () => ({ version: "old" }),
  })), /version/);
  assert.throws(() => runtime.assetURL("nightly", "aram.wasm", "old"), /version/);
});
