// Cybrsoft Browser — address-bar (omnibox) + search logic
//
// Pure, engine-independent: decides whether omnibox input is a URL to navigate
// to or a search query, and builds the query URL for the user's chosen engine
// (no imposed default — spec §7). Engine objects come from pages/search-engines.json.

const SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const NAV_SCHEMES = new Set(["http:", "https:", "file:", "about:", "ftp:", "ws:", "wss:", "data:", "view-source:"]);

/** Does this omnibox input look like something to navigate to (vs. search)? */
export function looksLikeUrl(input) {
  const s = String(input).trim();
  if (!s) return false;
  if (/\s/.test(s)) return false;                 // any whitespace => search
  if (s.startsWith("about:")) return true;
  // host:port / IP forms first, so "localhost:3000" isn't read as a scheme
  if (s === "localhost" || /^localhost[:/]/.test(s)) return true;
  if (/^(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?$/.test(s)) return true; // IPv4
  // explicit scheme (http:, https:, file:, …); unknown schemes => search
  if (SCHEME_RE.test(s)) {
    const scheme = s.slice(0, s.indexOf(":") + 1).toLowerCase();
    return NAV_SCHEMES.has(scheme);
  }
  // host.tld[/...] with no spaces and at least one dot and a 2+ char TLD-ish
  if (/^[^\s/]+\.[^\s/]{2,}(:\d+)?(\/.*)?$/.test(s)) return true;
  return false;
}

/** Prepend https:// when a bare host was entered. */
export function toNavigationUrl(input) {
  const s = String(input).trim();
  if (s.startsWith("about:") || SCHEME_RE.test(s)) return s;
  return "https://" + s;
}

/** Build a search URL for an engine. Supports {q} and %s placeholders. */
export function buildSearchUrl(engine, query) {
  if (!engine || !engine.searchUrl) throw new Error("engine with searchUrl required");
  const q = encodeURIComponent(String(query));
  if (engine.searchUrl.includes("{q}")) return engine.searchUrl.replaceAll("{q}", q);
  if (engine.searchUrl.includes("%s")) return engine.searchUrl.replaceAll("%s", q);
  // no placeholder: append as ?q= fallback
  const sep = engine.searchUrl.includes("?") ? "&" : "?";
  return engine.searchUrl + sep + "q=" + q;
}

/**
 * Resolve omnibox input against the user's engine.
 * @returns {{type:"navigate"|"search", url:string}}
 */
export function resolveOmnibox(input, engine) {
  const s = String(input).trim();
  if (looksLikeUrl(s)) return { type: "navigate", url: toNavigationUrl(s) };
  return { type: "search", url: buildSearchUrl(engine, s) };
}
