// Cybrsoft Browser — address-bar (omnibox) suggestion aggregator
//
// Ties together history, bookmarks, and the chosen search engine into one ranked
// suggestion list (the dropdown under the address bar). Pure + testable; no
// network (search *suggestion* fetches happen in the chrome if the user opted in).
//
// Dedupes a URL that is both bookmarked and visited into a single row (marked
// bookmarked), ranks real destinations by score, and always offers a search
// action for the typed text.

import { looksLikeUrl, toNavigationUrl, buildSearchUrl } from "../search/search.mjs";

/**
 * @param {string} input raw address-bar text
 * @param {object} ctx
 * @param {import("../history/history.mjs").History} ctx.history
 * @param {import("../bookmarks/bookmarks.mjs").Bookmarks} ctx.bookmarks
 * @param {object} ctx.engine search engine ({ name, searchUrl })
 * @param {number} [ctx.limit=8]
 * @param {number} [ctx.now]
 * @returns {Array<{type:"navigate"|"search", title:string, url:string, source:string, bookmarked?:boolean}>}
 */
export function buildSuggestions(input, ctx = {}) {
  const s = String(input).trim();
  const { history, bookmarks, engine, limit = 8, now = Date.now() } = ctx;
  if (!s) return [];

  const out = [];

  // 1. If it clearly is a URL, the top row navigates there directly.
  if (looksLikeUrl(s)) {
    out.push({ type: "navigate", title: s, url: toNavigationUrl(s), source: "direct" });
  }

  // 2. Gather destinations from history + bookmarks, deduped by URL.
  const byUrl = new Map();
  if (bookmarks) {
    for (const b of bookmarks.search(s)) {
      byUrl.set(b.url, { type: "navigate", title: b.title || b.url, url: b.url, source: "bookmark", bookmarked: true, score: 1e6 });
    }
  }
  if (history) {
    for (const h of history.query(s, { now, limit: 50 })) {
      const ex = byUrl.get(h.url);
      if (ex) { ex.bookmarked = true; } // already a bookmark; keep bookmark label, mark score high
      else byUrl.set(h.url, { type: "navigate", title: h.title || h.url, url: h.url, source: "history", score: h.score });
    }
  }
  const dests = [...byUrl.values()]
    .filter((d) => !out.some((o) => o.url === d.url)) // not the direct-nav row
    .sort((a, b) => b.score - a.score);

  // 3. Always offer a search action for the typed text.
  const searchRow = engine
    ? { type: "search", title: `Search ${engine.name} for “${s}”`, url: buildSearchUrl(engine, s), source: "search" }
    : null;

  // Assemble: direct nav (if any) -> destinations -> search action.
  for (const d of dests) { const { score, ...row } = d; out.push(row); }
  if (searchRow) out.push(searchRow);

  return out.slice(0, limit);
}
