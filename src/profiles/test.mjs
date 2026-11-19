// Tests for profile manager + isolation. Run: node src/profiles/test.mjs
import { ProfileManager } from "./profiles.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

let n = 0; const idGen = () => `p${n++}`;
console.log("profiles tests");

// create / active / rename / setActive
{
  n = 0; const m = new ProfileManager({ idGen });
  const a = m.create("Personal");
  ok(m.getActive().id === a.id, "first profile active");
  const b = m.create("Work");
  m.rename(b.id, "Job"); ok(m.get(b.id).name === "Job", "rename");
  m.setActive(b.id); ok(m.activeId === b.id, "setActive");
  throws(() => m.setActive("nope"), "setActive invalid throws");
}

// isolation: data under one profile invisible to another
{
  n = 0; const m = new ProfileManager({ idGen });
  const a = m.create("A"); const b = m.create("B");
  m.setData(a.id, "cookies", ["sessionA"]);
  m.setData(b.id, "cookies", ["sessionB"]);
  ok(JSON.stringify(m.getData(a.id, "cookies")) === JSON.stringify(["sessionA"]), "profile A sees its data");
  ok(m.getData(b.id, "cookies")[0] === "sessionB", "profile B sees its own data");
  ok(m.dataNamespace(a.id) !== m.dataNamespace(b.id), "distinct namespaces (isolation)");
  throws(() => m.setData("ghost", "k", 1), "setData for missing profile throws");
}

// remove rules + data wipe
{
  n = 0; const m = new ProfileManager({ idGen });
  const a = m.create("A");
  throws(() => m.remove(a.id), "cannot remove last profile");
  const b = m.create("B");
  m.setData(b.id, "history", ["x"]);
  m.setActive(b.id);
  m.remove(b.id);
  ok(!m.get(b.id), "profile removed");
  ok(m.activeId === a.id, "active reassigned");
  ok(m.getData(b.id, "history") === undefined, "removed profile's isolated data wiped");
}

// serialize round-trip
{
  n = 0; const m = new ProfileManager({ idGen });
  const a = m.create("A"); m.create("B"); m.setActive(a.id);
  const m2 = ProfileManager.deserialize(JSON.parse(JSON.stringify(m.serialize())), { idGen });
  ok(m2.list().length === 2 && m2.activeId === a.id, "serialize round-trip");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
