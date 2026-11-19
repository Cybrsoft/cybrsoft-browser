// Tests for privacy aggregation. Run: node src/privacy/test.mjs
import { aggregate, topHosts, CATEGORIES } from "./aggregate.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

const DAY = 86400000;
const now = new Date("2026-11-19T12:00:00Z").getTime();
const earlierToday = now - 3600000;
const yesterday = now - DAY;

const events = [
  { host: "ads.doubleclick.net", category: "ad", listName: "EasyList", site: "news.com", ts: earlierToday },
  { host: "google-analytics.com", category: "tracker", listName: "EasyPrivacy", site: "news.com", ts: earlierToday },
  { host: "connect.facebook.net", category: "tracker", listName: "Social", site: "news.com", ts: yesterday },
  { host: "fingerprintjs.com", category: "fingerprinter", listName: "FP list", site: "shop.com", ts: earlierToday },
  { host: "ads.doubleclick.net", category: "ad", listName: "EasyList", site: "shop.com", ts: yesterday },
  { host: "cdn.cookielaw.org", category: "cookiePopup", site: "news.com", ts: earlierToday }, // no listName
  { host: "weird.example", category: "mystery", site: "news.com", ts: earlierToday }, // unknown category
];

console.log("privacy aggregation tests");

// empty input => all zeros, never fabricated
{
  const r = aggregate([], { scope: "all" });
  ok(r.total === 0 && r.counts.ad === 0 && r.counts.tracker === 0, "empty input -> zeros (no fabrication)");
  ok(Object.keys(r.cats).length === CATEGORIES.length, "cats always has all categories");
}

// all scope
{
  const r = aggregate(events, { scope: "all" });
  ok(r.counts.ad === 2, "all: 2 ads");
  ok(r.counts.tracker === 2, "all: 2 trackers");
  ok(r.counts.fingerprinter === 1, "all: 1 fingerprinter");
  ok(r.counts.cookiePopup === 1, "all: 1 cookie popup");
  ok(r.unknownCategory === 1, "unknown category counted, not silently dropped");
  ok(r.cats["Ads"] === 2, "labelled cats present");
}

// site scope
{
  const r = aggregate(events, { scope: "site", site: "news.com", withDetail: true });
  ok(r.counts.ad === 1 && r.counts.tracker === 2 && r.counts.cookiePopup === 1, "site filter correct");
  ok(r.blocked.length === r.total, "detail list matches total");
  const popup = r.blocked.find((b) => b.host === "cdn.cookielaw.org");
  ok(popup && popup.reason === null, "missing listName -> reason null (not available, not invented)");
  throws(() => aggregate(events, { scope: "site" }), "site scope requires site");
}

// today scope (uses ts vs now)
{
  const r = aggregate(events, { scope: "today", now });
  // earlierToday events: ad(news), tracker(news), fp(shop), cookie(news) + unknown => 4 known + 1 unknown
  ok(r.counts.ad === 1 && r.counts.tracker === 1 && r.counts.fingerprinter === 1 && r.counts.cookiePopup === 1,
     "today excludes yesterday's events");
}

// topHosts
{
  const t = topHosts(events, { scope: "all" });
  ok(t[0].host === "ads.doubleclick.net" && t[0].count === 2, "topHosts ranks most frequent");
}

// bad input
throws(() => aggregate("nope"), "non-array events throws");
throws(() => aggregate([], { scope: "bogus" }), "unknown scope throws");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
