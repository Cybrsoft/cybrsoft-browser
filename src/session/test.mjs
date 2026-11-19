// Tests for session & tab restoration. Run: node src/session/test.mjs
import { SessionManager } from "./session.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

console.log("session tests");

// recently-closed stack: LIFO reopen
{
  const s = new SessionManager();
  s.recordClosed({ url: "https://a.com", title: "A" });
  s.recordClosed({ url: "https://b.com", title: "B" });
  ok(s.reopenLast().url === "https://b.com", "reopen returns most recent (LIFO)");
  ok(s.reopenLast().url === "https://a.com", "then the next most recent");
  ok(s.reopenLast() === null, "null when empty");
  throws(() => s.recordClosed({ title: "no url" }), "closed tab needs url");
}

// cap enforced, oldest dropped
{
  const s = new SessionManager({ maxClosed: 3 });
  for (const u of ["a", "b", "c", "d"]) s.recordClosed({ url: `https://${u}.com` });
  ok(s.closed.length === 3, "cap enforced");
  ok(s.recentlyClosed()[0].url === "https://d.com", "newest first in recentlyClosed");
  ok(!s.closed.some((t) => t.url === "https://a.com"), "oldest dropped");
}

// snapshot + restore
{
  const snap = SessionManager.snapshot({
    windows: [
      { activeIndex: 1, tabs: [{ url: "https://x.com" }, { url: "https://y.com", pinned: true }] },
      { tabs: [] }, // empty window
    ],
  });
  ok(snap.version === 1 && snap.windows.length === 2, "snapshot captures windows");
  const restored = SessionManager.restore(snap);
  ok(restored.length === 1, "restore drops empty windows");
  ok(restored[0].tabs.length === 2 && restored[0].activeIndex === 1, "restore keeps tabs + active");
  ok(restored[0].tabs[1].pinned === true, "pinned flag preserved");
  throws(() => SessionManager.restore({ version: 2 }), "unsupported snapshot version throws");
}

// restore clamps a bad activeIndex
{
  const snap = { version: 1, windows: [{ activeIndex: 99, tabs: [{ url: "https://x.com" }] }] };
  ok(SessionManager.restore(snap)[0].activeIndex === 0, "activeIndex clamped into range");
}

// serialize round-trip
{
  const s = new SessionManager();
  s.recordClosed({ url: "https://a.com" });
  const s2 = SessionManager.deserialize(JSON.parse(JSON.stringify(s.serialize())));
  ok(s2.reopenLast().url === "https://a.com", "closed stack round-trips");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
