// Cybrsoft Browser — download manager model
//
// State machine + progress tracking for downloads (spec §12). Pure + testable;
// the chrome download UI drives this and renders its state. The engine performs
// the actual byte transfer; this models queue, progress, pause/resume, speed,
// and history.

export const STATES = ["queued", "active", "paused", "completed", "failed", "canceled"];
const TERMINAL = new Set(["completed", "failed", "canceled"]);
// allowed transitions
const NEXT = {
  queued:    new Set(["active", "canceled"]),
  active:    new Set(["paused", "completed", "failed", "canceled"]),
  paused:    new Set(["active", "canceled"]),
  completed: new Set(),
  failed:    new Set(),
  canceled:  new Set(),
};

let _seq = 0;
const defaultId = () => `dl_${Date.now().toString(36)}_${(_seq++).toString(36)}`;

export class Downloads {
  constructor(opts = {}) { this._id = opts.idGen || defaultId; this.items = new Map(); }

  get(id) { const i = this.items.get(id); if (!i) throw new Error(`no download ${id}`); return i; }
  list(state) { const a = [...this.items.values()]; return state ? a.filter((i) => i.state === state) : a; }

  add(url, { filename, totalBytes = null } = {}) {
    if (!url) throw new Error("download requires url");
    const item = {
      id: this._id(), url, filename: filename || url.split("/").pop() || "download",
      totalBytes, receivedBytes: 0, state: "queued",
      startedAt: null, updatedAt: null, speed: 0, error: null,
    };
    this.items.set(item.id, item);
    return item;
  }

  _transition(id, to, mutate) {
    const i = this.get(id);
    if (!NEXT[i.state].has(to)) throw new Error(`illegal transition ${i.state} -> ${to} (${id})`);
    if (mutate) mutate(i);
    i.state = to;
    return i;
  }

  start(id, { ts } = {}) { return this._transition(id, "active", (i) => { if (!i.startedAt) i.startedAt = ts ?? Date.now(); }); }
  pause(id)  { return this._transition(id, "paused"); }
  resume(id) { return this._transition(id, "active"); }
  cancel(id) { return this._transition(id, "canceled"); }
  fail(id, error) { return this._transition(id, "failed", (i) => { i.error = String(error || "failed"); }); }

  complete(id) {
    return this._transition(id, "completed", (i) => {
      if (i.totalBytes != null) i.receivedBytes = i.totalBytes;
    });
  }

  /** Report bytes received; only valid while active. Computes speed (bytes/sec). */
  progress(id, receivedBytes, { ts } = {}) {
    const i = this.get(id);
    if (i.state !== "active") throw new Error(`cannot progress a ${i.state} download`);
    const now = ts ?? Date.now();
    if (receivedBytes < i.receivedBytes) throw new Error("received bytes cannot decrease");
    if (i.totalBytes != null && receivedBytes > i.totalBytes) throw new Error("received exceeds total");
    const ref = i.updatedAt ?? i.startedAt; // first tick measures from start
    if (ref != null && now > ref) {
      i.speed = Math.round(((receivedBytes - i.receivedBytes) * 1000) / (now - ref));
    }
    i.receivedBytes = receivedBytes;
    i.updatedAt = now;
    return i;
  }

  percent(id) {
    const i = this.get(id);
    if (i.totalBytes == null || i.totalBytes === 0) return null; // unknown size
    return Math.min(100, Math.round((i.receivedBytes / i.totalBytes) * 100));
  }

  isTerminal(id) { return TERMINAL.has(this.get(id).state); }
  clearCompleted() {
    for (const [id, i] of this.items) if (i.state === "completed") this.items.delete(id);
  }

  serialize() { return { items: this.list().map((i) => ({ ...i })) }; }
  static deserialize(obj, opts = {}) {
    const d = new Downloads(opts);
    for (const i of obj?.items || []) d.items.set(i.id, { ...i });
    return d;
  }
}
