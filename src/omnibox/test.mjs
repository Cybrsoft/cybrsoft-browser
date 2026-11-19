// Tests for omnibox suggestion aggregator. Run: node src/omnibox/test.mjs
import { buildSuggestions } from "./omnibox.mjs";
import { History } from "../history/history.mjs";
import { Bookmarks, ROOT_ID } from "../bookmarks/bookmarks.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };

const engine = { name: "DuckDuckGo", searchUrl: "https://duckduckgo.com/?q={q}" };
const now = 2_000_000;

function fixtures() {
  const history = new History();
  history.addVisit("https://example.com/news", { title: "Example News", ts: now - 1000 });
  history.addVisit("https://example.com/news", { ts: now });        // bump frecency
  history.addVisit("https://other.org", { title: "Other", ts: now - 100000 });
  const bookmarks = new Bookmarks();
  bookmarks.addBookmark(ROOT_ID, "Example Home", "https://example.com/");
  return { history, bookmarks };
}

console.log("omnibox tests");

// empty input -> nothing
ok(buildSuggestions("", { ...fixtures(), engine }).length === 0, "empty input -> no suggestions");

// a query surfaces history + bookmark + a search action
{
  const r = buildSuggestions("example", { ...fixtures(), engine, now });
  const urls = r.map((x) => x.url);
  ok(r.some((x) => x.source === "bookmark" && x.url === "https://example.com/"), "includes bookmark match");
  ok(r.some((x) => x.source === "history" && x.url === "https://example.com/news"), "includes history match");
  ok(r[r.length - 1].type === "search" && r[r.length - 1].url.includes("q=example"), "ends with a search action");
}

// typing a URL puts a direct-navigate row first
{
  const r = buildSuggestions("example.com/news", { ...fixtures(), engine, now });
  ok(r[0].type === "navigate" && r[0].source === "direct", "URL input -> direct navigate first");
  ok(r.some((x) => x.type === "search"), "still offers search");
}

// dedupe: a URL both bookmarked and in history appears once, marked bookmarked
{
  const { history, bookmarks } = fixtures();
  history.addVisit("https://example.com/", { title: "Example Home", ts: now }); // same as the bookmark
  const r = buildSuggestions("example home", { history, bookmarks, engine, now });
  const home = r.filter((x) => x.url === "https://example.com/");
  ok(home.length === 1, "bookmarked+visited URL deduped to one row");
  ok(home[0].bookmarked === true, "deduped row marked bookmarked");
}

// no engine -> no search row (graceful)
{
  const r = buildSuggestions("other", { ...fixtures(), now });
  ok(!r.some((x) => x.type === "search"), "no engine -> no search row");
  ok(r.some((x) => x.url === "https://other.org"), "still returns destinations");
}

// limit respected
{
  const history = new History();
  for (let i = 0; i < 20; i++) history.addVisit(`https://site${i}.com/page`, { title: `Page ${i}`, ts: now - i });
  const r = buildSuggestions("page", { history, engine, now, limit: 5 });
  ok(r.length === 5, "limit respected");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
