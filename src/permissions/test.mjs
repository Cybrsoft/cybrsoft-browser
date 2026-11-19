// Tests for site permissions. Run: node src/permissions/test.mjs
import { SitePermissions, DEFAULTS } from "./permissions.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

console.log("permissions tests");

// defaults are privacy-leaning
ok(DEFAULTS.location === "block" && DEFAULTS.notifications === "block" && DEFAULTS.popups === "block", "sensitive perms default to block");
ok(DEFAULTS.camera === "ask", "camera defaults to ask");

{
  const p = new SitePermissions();
  ok(p.get("a.com", "location") === "block", "unset -> default");
  ok(!p.hasOverride("a.com", "location"), "no override initially");
  p.set("a.com", "location", "allow");
  ok(p.get("a.com", "location") === "allow", "override applied");
  ok(p.hasOverride("a.com", "location"), "hasOverride true after set");
  ok(p.get("b.com", "location") === "block", "override is per-site");
  throws(() => p.set("a.com", "bogus", "allow"), "unknown permission throws");
  throws(() => p.set("a.com", "camera", "maybe"), "invalid state throws");
  throws(() => p.get("x", "bogus"), "get unknown perm throws");
}

// listForSite returns effective for all types
{
  const p = new SitePermissions();
  p.set("a.com", "camera", "allow");
  const l = p.listForSite("a.com");
  ok(l.camera === "allow" && l.location === "block", "listForSite merges overrides + defaults");
  ok(Object.keys(l).length === 6, "lists all permission types");
}

// clear
{
  const p = new SitePermissions();
  p.set("a.com", "camera", "allow"); p.set("a.com", "location", "allow");
  p.clear("a.com", "camera");
  ok(p.get("a.com", "camera") === "ask" && p.get("a.com", "location") === "allow", "clear one type");
  p.clear("a.com");
  ok(p.sitesWithOverrides().length === 0, "clear whole site");
}

// serialize round-trip
{
  const p = new SitePermissions();
  p.set("a.com", "camera", "allow"); p.set("b.com", "notifications", "allow");
  const p2 = SitePermissions.deserialize(JSON.parse(JSON.stringify(p.serialize())));
  ok(p2.get("a.com", "camera") === "allow" && p2.get("b.com", "notifications") === "allow", "serialize round-trip");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
