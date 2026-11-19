// Tests for theme resolution. Run: node src/theme/test.mjs
import { resolveTheme, isValidHex, normalizeHex, effectiveTheme } from "./theme.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

console.log("theme tests");

ok(resolveTheme("system", true) === "dark", "system + dark OS -> dark");
ok(resolveTheme("system", false) === "light", "system + light OS -> light");
ok(resolveTheme("dark", false) === "dark", "explicit dark overrides OS");
ok(resolveTheme("light", true) === "light", "explicit light overrides OS");
throws(() => resolveTheme("rainbow", false), "invalid setting throws");

ok(isValidHex("#3B6FE0") && isValidHex("#abc"), "valid hex accepted");
ok(!isValidHex("3B6FE0") && !isValidHex("#xyz") && !isValidHex("#12"), "invalid hex rejected");
ok(normalizeHex("#ABC") === "#aabbcc", "shorthand expanded + lowercased");
ok(normalizeHex("#3B6FE0") === "#3b6fe0", "6-digit lowercased");
throws(() => normalizeHex("nope"), "normalize invalid throws");

{
  const e = effectiveTheme({ setting: "system", systemPrefersDark: true });
  ok(e.theme === "dark" && e.dataTheme === "" && e.accent === "#3b6fe0", "system: dataTheme empty (CSS media drives it)");
  const d = effectiveTheme({ setting: "dark", accent: "#FFF" });
  ok(d.dataTheme === "dark" && d.accent === "#ffffff", "explicit: dataTheme set, accent normalized");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
