// Tests for history model. Run: node src/history/test.mjs
import { History } from "./history.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

const DAY = 86400000;
const now = new Date("2026-11-19T12:00:00Z").getTime();
console.log("history tests");

// dedupe + visit count
{
  const h = new History();
  h.addVisit("https://a.com", { title: "A", ts: now - 2 * DAY });
  h.addVisit("https://a.com", { ts: now });
  ok(h.size() === 1, "same url deduped");
  const e = h.getByUrl("https://a.com");
  ok(e.visitCount === 2, "visit count incremented");
  ok(e.lastVisit === now, "lastVisit updated to newest");
  ok(e.title === "A", "title retained");
  throws(() => h.addVisit(""), "empty url throws");
}

// recent ordering
{
  const h = new History();
  h.addVisit("https://old.com", { ts: now - 5 * DAY });
  h.addVisit("https://new.com", { ts: now });
  ok(h.recent()[0].url === "https://new.com", "recent newest first");
}

// frecency: frequent+recent beats rare+recent and frequent+old
{
  const h = new History();
  h.addVisit("https://rare.com", { ts: now }); // count 1, recent
  for (let i = 0; i < 5; i++) h.addVisit("https://freq.com", { ts: now }); // count 5, recent
  h.addVisit("https://oldfreq.com", { ts: now - 60 * DAY });
  for (let i = 0; i < 9; i++) h.addVisit("https://oldfreq.com", { ts: now - 60 * DAY }); // count 10 but old
  const r = h.query("com", { now });
  ok(r[0].url === "https://freq.com", "frequent+recent ranks first");
  ok(r.findIndex((x) => x.url === "https://rare.com") > 0, "rare ranks below frequent");
}

// query matches title and url
{
  const h = new History();
  h.addVisit("https://github.com/x", { title: "My Repo", ts: now });
  ok(h.query("repo", { now }).length === 1, "query matches title");
  ok(h.query("github", { now }).length === 1, "query matches url");
  ok(h.query("zzz", { now }).length === 0, "query no match");
}

// remove / clear / serialize
{
  const h = new History();
  h.addVisit("https://a.com", { ts: now });
  h.addVisit("https://b.com", { ts: now });
  h.remove("https://a.com"); ok(h.size() === 1, "remove");
  const h2 = History.deserialize(JSON.parse(JSON.stringify(h.serialize())));
  ok(h2.size() === 1 && h2.getByUrl("https://b.com").visitCount === 1, "serialize round-trip");
  h.clear(); ok(h.size() === 0, "clear");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
