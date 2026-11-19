// Tests for shortcut validation. Run: node src/shortcuts/test.mjs
import { normalizeChord, validateShortcuts } from "./validate.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

console.log("shortcut validation tests");

// normalization is order-independent + canonical
ok(normalizeChord("Ctrl+Shift+T") === "Ctrl+Shift+T", "canonical order");
ok(normalizeChord("Shift+Ctrl+t") === normalizeChord("Ctrl+Shift+T"), "order & case independent");
ok(normalizeChord("Control+J") === "Ctrl+J", "Control alias -> Ctrl");
ok(normalizeChord("Ctrl+Alt+Right") === "Ctrl+Alt+Right", "named key kept");
throws(() => normalizeChord("Ctrl+"), "trailing + invalid");
throws(() => normalizeChord("Foo+T"), "invalid modifier");
throws(() => normalizeChord("Ctrl+##"), "invalid key");

// conflict detection
{
  const r = validateShortcuts({ shortcuts: [
    { id: "a", keys: "Ctrl+T" }, { id: "b", keys: "Shift+Ctrl+Y" }, { id: "c", keys: "Ctrl+Shift+Y" },
  ]});
  ok(!r.ok && r.conflicts.length === 1, "detects duplicate binding (Ctrl+Shift+Y)");
}
// duplicate id
{
  const r = validateShortcuts({ shortcuts: [{ id: "a", keys: "Ctrl+T" }, { id: "a", keys: "Ctrl+N" }] });
  ok(!r.ok && r.errors.some((e) => e.includes("duplicate id")), "detects duplicate id");
}
// bad shape
ok(validateShortcuts({}).ok === false, "missing shortcuts array fails");

// THE REAL shipped config must be clean
{
  const here = dirname(fileURLToPath(import.meta.url));
  const cfg = JSON.parse(readFileSync(join(here, "../../config/keyboard-shortcuts.json"), "utf8"));
  const r = validateShortcuts(cfg);
  if (!r.ok) console.log("   ->", JSON.stringify(r));
  ok(r.ok, "shipped config/keyboard-shortcuts.json has no errors or conflicts");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
