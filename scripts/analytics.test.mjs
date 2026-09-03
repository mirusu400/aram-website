import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtime = await readFile(path.join(projectRoot, "assets", "analytics.js"), "utf8");

function element() {
  const listeners = new Map();
  return {
    hidden: true,
    focused: false,
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type, event = {}) { listeners.get(type)?.(event); },
    focus() { this.focused = true; },
  };
}

function bootAnalytics({ consent = null, pathname = "/guide/", referrer = "" } = {}) {
  const elements = Object.fromEntries([
    "analyticsConsent",
    "analyticsAccept",
    "analyticsDecline",
    "analyticsLater",
    "analyticsSettings",
  ].map((id) => [id, element()]));
  const storage = new Map(consent ? [["aram-analytics-consent", consent]] : []);
  const documentListeners = new Map();
  const appendedScripts = [];
  const cookieWrites = [];
  let reloads = 0;

  const document = {
    currentScript: { dataset: { measurementId: "G-TEST12345" } },
    referrer,
    title: "Private query test",
    getElementById(id) { return elements[id] || null; },
    createElement(tagName) { return { tagName }; },
    addEventListener(type, listener) { documentListeners.set(type, listener); },
    head: { appendChild(script) { appendedScripts.push(script); } },
  };
  Object.defineProperty(document, "cookie", {
    get() { return "_ga=test; _ga_TEST=private"; },
    set(value) { cookieWrites.push(value); },
  });

  const location = {
    origin: "https://aram.mir.sh",
    pathname,
    search: "?package=https%3A%2F%2Fprivate.example%2Fgame.jar",
    hash: "#private-game-name",
    reload() { reloads += 1; },
  };
  const localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); },
  };
  const window = {};

  vm.runInNewContext(runtime, {
    Date,
    URL,
    document,
    encodeURIComponent,
    localStorage,
    location,
    window,
  });

  return {
    appendedScripts,
    cookieWrites,
    documentListeners,
    elements,
    get reloads() { return reloads; },
    storage,
    window,
  };
}

function command(entry) {
  return Array.from(entry);
}

test("analytics makes no Google request before explicit consent", () => {
  const state = bootAnalytics();

  assert.equal(state.appendedScripts.length, 0);
  assert.equal(state.window.dataLayer, undefined);
  assert.equal(state.elements.analyticsConsent.hidden, false);
  assert.equal(state.elements.analyticsSettings.hidden, true);

  state.elements.analyticsLater.dispatch("click");
  assert.equal(state.appendedScripts.length, 0);
  assert.equal(state.storage.has("aram-analytics-consent"), false);
  assert.equal(state.elements.analyticsConsent.hidden, true);
  assert.equal(state.elements.analyticsSettings.hidden, false);
});

test("consent loads GA4 with sanitized page and referrer fields", () => {
  const state = bootAnalytics({
    referrer: "https://search.example/results?q=private-game-name#match",
  });

  state.elements.analyticsAccept.dispatch("click");

  assert.equal(state.storage.get("aram-analytics-consent"), "granted");
  assert.equal(state.appendedScripts.length, 1);
  assert.equal(state.appendedScripts[0].src, "https://www.googletagmanager.com/gtag/js?id=G-TEST12345");

  const commands = state.window.dataLayer.map(command);
  assert.deepEqual(commands[0].slice(0, 2), ["consent", "default"]);
  assert.equal(commands[0][2].ad_storage, "denied");
  assert.equal(commands[0][2].analytics_storage, "granted");

  const config = commands.find(([type]) => type === "config");
  assert.equal(config[2].send_page_view, false);
  assert.equal(config[2].page_location, "https://aram.mir.sh/guide/");
  assert.equal(config[2].page_referrer, "https://search.example");
  assert.equal(config[2].allow_google_signals, false);

  const pageView = commands.find(([type, name]) => type === "event" && name === "page_view");
  assert.equal(pageView[2].page_location, "https://aram.mir.sh/guide/");
  assert.equal(pageView[2].page_referrer, "https://search.example");
  assert.doesNotMatch(JSON.stringify(commands), /private-game-name|private\.example|game\.jar/);
});

test("custom download events expose only platform and channel", () => {
  const state = bootAnalytics({ consent: "granted" });
  const click = state.documentListeners.get("click");
  const anchor = {
    dataset: { file: "aram-windows-amd64.zip" },
    href: "https://github.com/mirusu400/aram-emu/releases/download/nightly/private-game.zip?token=secret",
    hreflang: "",
  };

  click({ target: { closest: () => anchor } });

  const event = state.window.dataLayer.map(command).at(-1);
  assert.deepEqual(event.slice(0, 2), ["event", "download_click"]);
  assert.equal(event[2].platform, "windows");
  assert.equal(event[2].release_channel, "nightly");
  assert.equal(event[2].transport_type, "beacon");
  assert.doesNotMatch(JSON.stringify(event), /private-game|token|secret|github\.com/);
});

test("stored refusal and player pages never load analytics", () => {
  const refused = bootAnalytics({ consent: "denied" });
  assert.equal(refused.appendedScripts.length, 0);
  assert.equal(refused.elements.analyticsConsent.hidden, true);
  assert.equal(refused.elements.analyticsSettings.hidden, false);

  const player = bootAnalytics({ consent: "granted", pathname: "/player/" });
  assert.equal(player.appendedScripts.length, 0);
  assert.equal(player.window.dataLayer, undefined);
});

test("withdrawing consent clears GA cookies and reloads", () => {
  const state = bootAnalytics({ consent: "granted" });
  state.elements.analyticsDecline.dispatch("click");

  assert.equal(state.storage.get("aram-analytics-consent"), "denied");
  assert.equal(state.reloads, 1);
  assert.ok(state.cookieWrites.some((value) => value.startsWith("_ga=")));
  assert.ok(state.cookieWrites.some((value) => value.startsWith("_ga_TEST=")));
  assert.ok(state.cookieWrites.every((value) => value.includes("Max-Age=0")));
});
