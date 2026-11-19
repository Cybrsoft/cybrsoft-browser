// Tests for omnibox/search logic. Run: node src/search/test.mjs
import { looksLikeUrl, toNavigationUrl, buildSearchUrl, resolveOmnibox } from "./search.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };

const ddg = { id: "duckduckgo", name: "DuckDuckGo", searchUrl: "https://duckduckgo.com/?q={q}" };
const pct = { id: "x", name: "X", searchUrl: "https://e.com/search?query=%s" };
const noph = { id: "y", name: "Y", searchUrl: "https://e.com/find" };

console.log("search/omnibox tests");

// URL detection
for (const [inp, exp] of [
  ["example.com", true], ["https://example.com", true], ["http://a.b/c?d=e", true],
  ["localhost", true], ["localhost:3000", true], ["192.168.0.1", true], ["192.168.0.1:8080/x", true],
  ["about:config", true], ["file:///c/x.txt", true],
  ["hello world", false], ["how to tie a tie", false], ["buy milk", false],
  ["单词", false], ["weather", false], ["a.b c", false],
]) ok(looksLikeUrl(inp) === exp, `looksLikeUrl(${JSON.stringify(inp)}) === ${exp}`);

// navigation url
ok(toNavigationUrl("example.com") === "https://example.com", "bare host -> https");
ok(toNavigationUrl("https://x.com") === "https://x.com", "keeps scheme");
ok(toNavigationUrl("about:config") === "about:config", "keeps about:");

// search url building
ok(buildSearchUrl(ddg, "cats & dogs") === "https://duckduckgo.com/?q=cats%20%26%20dogs", "{q} encoded");
ok(buildSearchUrl(pct, "a b") === "https://e.com/search?query=a%20b", "%s placeholder");
ok(buildSearchUrl(noph, "x") === "https://e.com/find?q=x", "no placeholder -> appends ?q=");

// resolveOmnibox
{
  const a = resolveOmnibox("example.com", ddg);
  ok(a.type === "navigate" && a.url === "https://example.com", "resolve: navigate");
  const b = resolveOmnibox("best pizza", ddg);
  ok(b.type === "search" && b.url.includes("q=best%20pizza"), "resolve: search");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
