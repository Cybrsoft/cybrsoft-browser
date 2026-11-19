// Tests for the workspaces state engine. Run: node src/workspaces/test.mjs
import { WorkspaceStore } from "./workspaces.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

// deterministic ids for testing
let n = 0; const idGen = () => `w${n++}`;
console.log("workspaces tests");

// create + active
{
  const s = new WorkspaceStore({ idGen });
  const a = s.create("Work");
  ok(a.id === "w0" && a.name === "Work", "create returns workspace");
  ok(s.getActive().id === a.id, "first workspace is active");
  const b = s.create("Personal");
  ok(s.getActive().id === a.id, "active unchanged by second create");
  ok(s.list().length === 2, "list has 2");
}

// rename / setActive
{
  n = 0; const s = new WorkspaceStore({ idGen });
  const a = s.create("A"); const b = s.create("B");
  s.rename(a.id, "Renamed"); ok(s.get(a.id).name === "Renamed", "rename works");
  s.setActive(b.id); ok(s.activeId === b.id, "setActive works");
  throws(() => s.setActive("nope"), "setActive invalid throws");
  throws(() => s.rename("nope", "x"), "rename invalid throws");
}

// remove rules
{
  n = 0; const s = new WorkspaceStore({ idGen });
  const a = s.create("A");
  throws(() => s.remove(a.id), "cannot remove last workspace");
  const b = s.create("B"); const c = s.create("C");
  s.setActive(b.id); s.remove(b.id);
  ok(!s.get(b.id), "removed workspace gone");
  ok(s.getActive() && s.activeId !== b.id, "active reassigned after removing active");
  ok(s.list().length === 2, "two remain");
}

// tab add / dedupe / remove
{
  n = 0; const s = new WorkspaceStore({ idGen });
  const a = s.create("A");
  s.addTab(a.id, "t1"); s.addTab(a.id, "t1"); s.addTab(a.id, "t2");
  ok(s.get(a.id).tabs.length === 2, "addTab dedupes");
  s.removeTab(a.id, "t1");
  ok(JSON.stringify(s.get(a.id).tabs) === JSON.stringify(["t2"]), "removeTab works");
}

// moveTab is atomic (removes from source)
{
  n = 0; const s = new WorkspaceStore({ idGen });
  const a = s.create("A"); const b = s.create("B");
  s.addTab(a.id, "t1");
  s.moveTab("t1", b.id);
  ok(s.findTab("t1").id === b.id, "moveTab puts tab in target");
  ok(s.get(a.id).tabs.length === 0, "moveTab removed from source (no duplication)");
  s.moveTab("t1", b.id); // moving to same ws is a no-op
  ok(s.get(b.id).tabs.filter((t) => t === "t1").length === 1, "move to same ws keeps single copy");
}

// serialize round-trip
{
  n = 0; const s = new WorkspaceStore({ idGen });
  const a = s.create("A", { color: "#3B6FE0" }); s.addTab(a.id, "t1");
  const b = s.create("B"); s.addTab(b.id, "t2"); s.setActive(b.id);
  const snap = s.serialize();
  const s2 = WorkspaceStore.deserialize(JSON.parse(JSON.stringify(snap)), { idGen });
  ok(JSON.stringify(s2.serialize()) === JSON.stringify(snap), "serialize round-trips");
  ok(s2.getActive().id === b.id, "active preserved through round-trip");
  ok(s2.get(a.id).color === "#3B6FE0", "color preserved");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
