// Tests for privacy exceptions. Run: node src/exceptions/test.mjs
import { PrivacyExceptions } from "./exceptions.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

const STRICT = { rfp: true, fpp: true, cookiePopup: true, trackers: true };
const now = 1_000_000;
console.log("privacy exceptions tests");

// no exception -> inherits profile exactly
{
  const e = new PrivacyExceptions();
  const eff = e.getEffective("a.com", STRICT, now);
  ok(eff.rfp && eff.fpp && eff.trackers && !eff.paused, "no exception inherits profile");
}

// scoped single-protection override (the common 'site breaks because of RFP' case)
{
  const e = new PrivacyExceptions();
  e.setProtection("a.com", "rfp", false);
  const eff = e.getEffective("a.com", STRICT, now);
  ok(eff.rfp === false, "rfp disabled for this site");
  ok(eff.fpp === true && eff.trackers === true, "other protections stay ON (scoped, not global weakening)");
  // other sites unaffected
  ok(e.getEffective("b.com", STRICT, now).rfp === true, "exception is per-site");
  throws(() => e.setProtection("a.com", "bogus", false), "unknown protection throws");
}

// pause: everything off until expiry, then back on
{
  const e = new PrivacyExceptions();
  e.pause("a.com", now + 3600_000);
  ok(e.isPaused("a.com", now), "paused now");
  const eff = e.getEffective("a.com", STRICT, now);
  ok(!eff.rfp && !eff.fpp && !eff.trackers && eff.paused, "paused -> all protections off");
  ok(!e.isPaused("a.com", now + 3_600_001), "pause expires");
  ok(e.getEffective("a.com", STRICT, now + 3_600_001).trackers === true, "protection returns after expiry");
  throws(() => e.pause("a.com", "soon"), "pause requires numeric timestamp");
}

// unpause + clear + serialize
{
  const e = new PrivacyExceptions();
  e.pause("a.com", now + 1000); e.unpause("a.com");
  ok(!e.isPaused("a.com", now), "unpause");
  e.setProtection("a.com", "cookiePopup", false);
  const e2 = PrivacyExceptions.deserialize(JSON.parse(JSON.stringify(e.serialize())));
  ok(e2.getEffective("a.com", STRICT, now).cookiePopup === false, "serialize round-trip");
  e.clear("a.com");
  ok(e.sitesWithExceptions().length === 0, "clear site");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
