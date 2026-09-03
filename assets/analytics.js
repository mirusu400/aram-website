(() => {
  "use strict";

  const loader = document.currentScript;
  const measurementId = loader?.dataset.measurementId || "";
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
  if (location.pathname === "/player" || location.pathname.startsWith("/player/")) return;

  const consentKey = "aram-analytics-consent";
  const banner = document.getElementById("analyticsConsent");
  const acceptButton = document.getElementById("analyticsAccept");
  const declineButton = document.getElementById("analyticsDecline");
  const laterButton = document.getElementById("analyticsLater");
  const settingsButton = document.getElementById("analyticsSettings");
  if (!banner || !acceptButton || !declineButton || !laterButton || !settingsButton) return;

  let analyticsLoaded = false;

  function readConsent() {
    try {
      const value = localStorage.getItem(consentKey);
      return value === "granted" || value === "denied" ? value : null;
    } catch (_) {
      return null;
    }
  }

  function writeConsent(value) {
    try { localStorage.setItem(consentKey, value); } catch (_) {}
  }

  function setBannerVisible(visible) {
    banner.hidden = !visible;
    settingsButton.hidden = visible;
    if (visible) acceptButton.focus({ preventScroll: true });
  }

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function sendEvent(name, parameters) {
    if (!analyticsLoaded) return;
    gtag("event", name, { ...parameters, transport_type: "beacon" });
  }

  function pageLocation() {
    return `${location.origin}${location.pathname}`;
  }

  function pageReferrer() {
    if (!document.referrer) return "";
    try {
      const referrer = new URL(document.referrer);
      return referrer.origin === location.origin
        ? `${referrer.origin}${referrer.pathname}`
        : referrer.origin;
    } catch (_) {
      return "";
    }
  }

  function releaseChannel(url) {
    return url.pathname.includes("/nightly/") || url.searchParams.get("ch") === "nightly"
      ? "nightly"
      : "stable";
  }

  function downloadPlatform(filename) {
    const value = filename.toLowerCase();
    if (value.includes("windows")) return "windows";
    if (value.includes("macos")) return "macos";
    if (value.includes("linux")) return "linux";
    if (value.includes("android") || value.endsWith(".apk")) return "android";
    return "other";
  }

  function trackClick(event) {
    const anchor = event.target.closest?.("a[href]");
    if (!anchor) return;

    let url;
    try { url = new URL(anchor.href, location.origin); } catch (_) { return; }

    if (url.origin === location.origin && (url.pathname === "/player" || url.pathname.startsWith("/player/"))) {
      sendEvent("web_player_launch", { release_channel: releaseChannel(url) });
      return;
    }

    const filename = anchor.dataset.file || url.pathname.split("/").pop() || "";
    if (anchor.dataset.file || /\.(zip|tar\.gz|apk)$/i.test(filename)) {
      sendEvent("download_click", {
        platform: downloadPlatform(filename),
        release_channel: releaseChannel(url),
      });
      return;
    }

    if (anchor.hreflang === "ko" || anchor.hreflang === "en") {
      sendEvent("language_switch", { target_language: anchor.hreflang });
      return;
    }

    if (url.hostname === "github.com") {
      const match = url.pathname.match(/^\/mirusu400\/(aram-(?:emu|core|frontend|cheat))(?:\/|$)/);
      sendEvent("github_click", { repository: match ? match[1] : "mirusu400" });
    }
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = gtag;
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    gtag("js", new Date());
    gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: "aram.mir.sh",
      cookie_expires: 15552000,
      cookie_flags: "SameSite=Lax;Secure",
      page_location: pageLocation(),
      page_referrer: pageReferrer(),
      send_page_view: false,
    });
    gtag("event", "page_view", {
      page_location: pageLocation(),
      page_referrer: pageReferrer(),
      page_title: document.title,
    });

    const tag = document.createElement("script");
    tag.async = true;
    tag.referrerPolicy = "origin";
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(tag);
    document.addEventListener("click", trackClick);
  }

  function clearAnalyticsCookies() {
    for (const part of document.cookie.split(";")) {
      const name = part.split("=", 1)[0].trim();
      if (!name.startsWith("_ga")) continue;
      document.cookie = `${name}=;Max-Age=0;path=/;SameSite=Lax`;
      document.cookie = `${name}=;Max-Age=0;path=/;domain=.aram.mir.sh;SameSite=Lax`;
    }
  }

  acceptButton.addEventListener("click", () => {
    writeConsent("granted");
    setBannerVisible(false);
    settingsButton.hidden = false;
    loadAnalytics();
  });

  declineButton.addEventListener("click", () => {
    writeConsent("denied");
    if (analyticsLoaded) {
      gtag("consent", "update", { analytics_storage: "denied" });
    }
    clearAnalyticsCookies();
    setBannerVisible(false);
    settingsButton.hidden = false;
    if (analyticsLoaded) location.reload();
  });

  laterButton.addEventListener("click", () => {
    setBannerVisible(false);
    settingsButton.hidden = false;
  });

  settingsButton.addEventListener("click", () => setBannerVisible(true));

  const consent = readConsent();
  if (consent === "granted") {
    settingsButton.hidden = false;
    loadAnalytics();
  } else if (consent === "denied") {
    settingsButton.hidden = false;
  } else {
    setBannerVisible(true);
  }
})();
