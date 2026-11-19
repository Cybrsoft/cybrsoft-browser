// Cybrsoft Browser — privacy dashboard aggregation
//
// Turns RAW block events (from the engine's content-blocking log + uBlock
// Origin's logger) into the numbers the dashboard shows. This is the "real data"
// engine the spec demands (§9/§6.4): it only ever COUNTS what it is given — it
// never fabricates. Empty input → zeros. A field the source didn't provide stays
// null, so the UI can show "not available" instead of a guess.
//
// A raw event: { host, category, listName?, site, ts }   (ts = epoch ms)
//   category ∈ CATEGORIES

export const CATEGORIES = ["tracker", "ad", "fingerprinter", "cookiePopup"];
const LABEL = { tracker: "Trackers", ad: "Ads", fingerprinter: "Fingerprinters", cookiePopup: "Cookie popups" };

function startOfDay(now) { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime(); }

/**
 * @param {Array} events raw block events
 * @param {object} opts
 * @param {"site"|"today"|"all"} [opts.scope="all"]
 * @param {string} [opts.site] required when scope==="site"
 * @param {number} [opts.now=Date.now()]
 * @param {boolean} [opts.withDetail=false] include per-request list (used for "site")
 */
export function aggregate(events, opts = {}) {
  if (!Array.isArray(events)) throw new Error("events must be an array");
  const scope = opts.scope || "all";
  const now = opts.now ?? Date.now();

  let sel = events;
  if (scope === "site") {
    if (!opts.site) throw new Error('scope "site" requires opts.site');
    sel = events.filter((e) => e.site === opts.site);
  } else if (scope === "today") {
    const t0 = startOfDay(now);
    sel = events.filter((e) => typeof e.ts === "number" && e.ts >= t0);
  } else if (scope !== "all") {
    throw new Error(`unknown scope: ${scope}`);
  }

  const counts = { tracker: 0, ad: 0, fingerprinter: 0, cookiePopup: 0 };
  let unknown = 0;
  for (const e of sel) {
    if (counts[e.category] === undefined) { unknown++; continue; }
    counts[e.category]++;
  }

  const cats = {};
  for (const c of CATEGORIES) cats[LABEL[c]] = counts[c];

  const result = {
    scope,
    total: sel.length,
    counts,          // machine-readable by category key
    cats,            // display-labelled, for the bar chart
    unknownCategory: unknown, // events whose category we didn't recognise (not dropped silently)
  };

  if (opts.withDetail) {
    result.blocked = sel.map((e) => ({
      host: e.host,
      category: e.category,
      // "why": the list/reason the engine gave, or null -> UI shows "not available"
      reason: e.listName ?? null,
    }));
  }
  return result;
}

/** Top blocked hosts across the selection, most frequent first. */
export function topHosts(events, { scope = "all", site, now, limit = 10 } = {}) {
  const sel = aggregate(events, { scope, site, now, withDetail: true }).blocked || [];
  const freq = new Map();
  for (const b of sel) freq.set(b.host, (freq.get(b.host) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([host, count]) => ({ host, count }));
}
