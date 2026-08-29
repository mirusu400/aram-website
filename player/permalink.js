(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ARAMPermalink = api;
})(typeof globalThis === "object" ? globalThis : window, function (root) {
  "use strict";

  const MAX_PACKAGE_BYTES = 32 * 1024 * 1024;
  const SHA256_RE = /^[0-9a-f]{64}$/;

  function singleParameter(params, name, required) {
    const values = params.getAll(name);
    if (values.length > 1) throw new Error(`Duplicate ${name} parameter.`);
    if (required && values.length !== 1) {
      throw new Error(`The ${name} parameter is required.`);
    }
    return values.length === 1 ? values[0].trim() : "";
  }

  function packageName(url) {
    const encoded = url.pathname.split("/").filter(Boolean).pop() || "application.zip";
    let decoded = encoded;
    try {
      decoded = decodeURIComponent(encoded);
    } catch (_) {
      // Keep the safe encoded path segment when it is not valid UTF-8.
    }
    const cleaned = decoded
      .replace(/[\\/]/g, "_")
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, 128);
    return cleaned || "application.zip";
  }

  function parse(search, baseURL) {
    const params = new URLSearchParams(search || "");
    const app = singleParameter(params, "app", false);
    if (!app) {
      if (params.has("sha256")) {
        throw new Error("The app parameter is required when sha256 is present.");
      }
      return null;
    }

    const digest = singleParameter(params, "sha256", true).toLowerCase();
    if (!SHA256_RE.test(digest)) {
      throw new Error("The sha256 parameter must be 64 hexadecimal characters.");
    }

    let url;
    try {
      url = new URL(app, baseURL);
    } catch (_) {
      throw new Error("The app parameter is not a valid URL.");
    }
    if (url.protocol !== "https:") {
      throw new Error("The app URL must use HTTPS.");
    }
    if (url.username || url.password) {
      throw new Error("The app URL must not contain credentials.");
    }
    url.hash = "";

    return {
      url: url.toString(),
      name: packageName(url),
      sha256: digest,
    };
  }

  function withChannel(currentURL, channel) {
    if (channel !== "stable" && channel !== "nightly") {
      throw new Error("Unknown ARAM channel.");
    }
    const url = new URL(currentURL);
    url.searchParams.set("ch", channel);
    return url.toString();
  }

  function declaredLength(response) {
    const raw = response.headers && response.headers.get
      ? response.headers.get("content-length")
      : null;
    if (raw === null || raw === "") return null;
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error("The package server returned an invalid Content-Length.");
    }
    return value;
  }

  async function boundedResponseBytes(response, maxBytes) {
    const declared = declaredLength(response);
    if (declared !== null && declared > maxBytes) {
      throw new Error(`The package is too large (maximum ${maxBytes} bytes).`);
    }

    if (response.body && typeof response.body.getReader === "function") {
      const reader = response.body.getReader();
      const chunks = [];
      let total = 0;
      for (;;) {
        const part = await reader.read();
        if (part.done) break;
        const chunk = part.value instanceof Uint8Array
          ? part.value
          : new Uint8Array(part.value);
        total += chunk.byteLength;
        if (total > maxBytes) {
          try { await reader.cancel(); } catch (_) {}
          throw new Error(`The package is too large (maximum ${maxBytes} bytes).`);
        }
        chunks.push(chunk);
      }
      const data = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return data;
    }

    const data = new Uint8Array(await response.arrayBuffer());
    if (data.byteLength > maxBytes) {
      throw new Error(`The package is too large (maximum ${maxBytes} bytes).`);
    }
    return data;
  }

  function hex(bytes) {
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  }

  async function fetchPackage(spec, options) {
    options = options || {};
    const fetchImpl = options.fetchImpl || (root.fetch && root.fetch.bind(root));
    const subtle = options.subtle || (root.crypto && root.crypto.subtle);
    const maxBytes = options.maxBytes || MAX_PACKAGE_BYTES;
    if (typeof fetchImpl !== "function") throw new Error("Fetch is unavailable.");
    if (!subtle || typeof subtle.digest !== "function") {
      throw new Error("SHA-256 verification is unavailable.");
    }

    const response = await fetchImpl(spec.url, {
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      redirect: "follow",
      referrerPolicy: "no-referrer",
    });
    if (!response || !response.ok) {
      const status = response ? `HTTP ${response.status}` : "no response";
      throw new Error(`Failed to download the package (${status}).`);
    }

    const data = await boundedResponseBytes(response, maxBytes);
    const actual = hex(new Uint8Array(await subtle.digest("SHA-256", data)));
    if (actual !== spec.sha256) {
      throw new Error(`SHA-256 mismatch (expected ${spec.sha256}, got ${actual}).`);
    }
    return { name: spec.name, data };
  }

  return {
    MAX_PACKAGE_BYTES,
    parse,
    withChannel,
    fetchPackage,
  };
});
