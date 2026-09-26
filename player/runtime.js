(function (root) {
  "use strict";

  const versionPattern = /^[a-f0-9]{64}$/;
  let requestNumber = 0;

  function validChannel(channel) {
    if (channel !== "stable" && channel !== "nightly") {
      throw new Error("Unknown runtime channel");
    }
  }

  async function fetchVersion(channel, request = fetch) {
    validChannel(channel);
    // Pages gives static files a ten-minute cache lifetime. A unique URL also
    // bypasses intermediary caches that might ignore the request cache mode.
    const check = `${Date.now()}-${++requestNumber}`;
    const response = await request(`${channel}/runtime.json?check=${check}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Runtime metadata request failed (${response.status})`);
    }
    const manifest = await response.json();
    if (!manifest || !versionPattern.test(manifest.version)) {
      throw new Error("Invalid runtime version metadata");
    }
    return manifest.version;
  }

  function assetURL(channel, name, version) {
    validChannel(channel);
    if (name !== "aram.wasm" && name !== "wasm_exec.js") {
      throw new Error("Unknown runtime asset");
    }
    if (!versionPattern.test(version)) {
      throw new Error("Invalid runtime version");
    }
    return `${channel}/${name}?v=${version}`;
  }

  const runtime = { fetchVersion, assetURL };
  if (typeof module !== "undefined" && module.exports) module.exports = runtime;
  root.ARAMRuntime = runtime;
})(globalThis);
