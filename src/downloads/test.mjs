// Tests for download manager. Run: node src/downloads/test.mjs
import { Downloads } from "./downloads.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

let n = 0; const idGen = () => `d${n++}`;
console.log("downloads tests");

// add + filename inference
{
  n = 0; const d = new Downloads({ idGen });
  const i = d.add("https://x.com/file.zip", { totalBytes: 1000 });
  ok(i.state === "queued" && i.filename === "file.zip", "add -> queued, filename inferred");
  throws(() => d.add(""), "url required");
}

// happy path with progress + percent + speed
{
  n = 0; const d = new Downloads({ idGen });
  const i = d.add("https://x.com/f.bin", { totalBytes: 1000 });
  d.start(i.id, { ts: 0 });
  ok(d.percent(i.id) === 0, "0% at start");
  d.progress(i.id, 250, { ts: 1000 });
  ok(d.percent(i.id) === 25, "25% after 250/1000");
  ok(d.get(i.id).speed === 250, "speed = 250 B/s (250 bytes in 1s)");
  d.progress(i.id, 750, { ts: 2000 });
  ok(d.get(i.id).speed === 500, "speed updates (500 B in 1s)");
  d.complete(i.id);
  ok(d.get(i.id).state === "completed" && d.percent(i.id) === 100, "complete -> 100%");
}

// unknown size => percent null
{
  n = 0; const d = new Downloads({ idGen });
  const i = d.add("https://x.com/stream");
  d.start(i.id); d.progress(i.id, 5000);
  ok(d.percent(i.id) === null, "unknown total -> percent null (not fabricated)");
}

// pause/resume
{
  n = 0; const d = new Downloads({ idGen });
  const i = d.add("https://x.com/f", { totalBytes: 100 });
  d.start(i.id); d.pause(i.id);
  ok(d.get(i.id).state === "paused", "pause");
  throws(() => d.progress(i.id, 10), "cannot progress while paused");
  d.resume(i.id); ok(d.get(i.id).state === "active", "resume");
}

// illegal transitions + terminal
{
  n = 0; const d = new Downloads({ idGen });
  const i = d.add("https://x.com/f", { totalBytes: 100 });
  throws(() => d.pause(i.id), "cannot pause a queued download");
  d.start(i.id); d.complete(i.id);
  throws(() => d.pause(i.id), "cannot pause a completed download");
  ok(d.isTerminal(i.id), "completed is terminal");
}

// progress guards
{
  n = 0; const d = new Downloads({ idGen });
  const i = d.add("https://x.com/f", { totalBytes: 100 });
  d.start(i.id); d.progress(i.id, 50);
  throws(() => d.progress(i.id, 40), "received cannot decrease");
  throws(() => d.progress(i.id, 200), "received cannot exceed total");
}

// cancel + fail + clearCompleted + serialize
{
  n = 0; const d = new Downloads({ idGen });
  const a = d.add("https://x.com/a", { totalBytes: 10 }); d.start(a.id); d.complete(a.id);
  const b = d.add("https://x.com/b"); d.start(b.id); d.fail(b.id, "network");
  const c = d.add("https://x.com/c"); d.cancel(c.id);
  ok(d.get(b.id).error === "network", "fail records error");
  ok(d.get(c.id).state === "canceled", "cancel from queued");
  const d2 = Downloads.deserialize(JSON.parse(JSON.stringify(d.serialize())), { idGen });
  ok(d2.list().length === 3, "serialize round-trip keeps all");
  d.clearCompleted();
  ok(d.list("completed").length === 0 && d.list().length === 2, "clearCompleted removes only completed");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
