// Cybrsoft Browser — Workspaces state engine
//
// Workspaces are REAL state (spec §6/§12): separate, persisted sets of tabs, not
// visual labels. This module is the pure, engine-independent core the chrome UI
// drives and that serializes into the profile + backups. No DOM, no engine — so
// it is fully unit-testable (see test.mjs).
//
// Invariants enforced:
//  - always at least one workspace
//  - exactly one active workspace
//  - a tab belongs to at most one workspace (moves are atomic)

let _seq = 0;
const defaultIdGen = () => `ws_${Date.now().toString(36)}_${(_seq++).toString(36)}`;

export class WorkspaceStore {
  /** @param {object} [opts] @param {()=>string} [opts.idGen] */
  constructor(opts = {}) {
    this._idGen = opts.idGen || defaultIdGen;
    this.workspaces = [];
    this.activeId = null;
  }

  /** Create a workspace; first one becomes active. Returns it. */
  create(name = "New workspace", { color } = {}) {
    const ws = { id: this._idGen(), name: String(name), color: color || null, tabs: [] };
    this.workspaces.push(ws);
    if (this.activeId === null) this.activeId = ws.id;
    return ws;
  }

  get(id) { return this.workspaces.find((w) => w.id === id) || null; }
  list() { return this.workspaces.slice(); }
  getActive() { return this.get(this.activeId); }

  rename(id, name) {
    const w = this.get(id); if (!w) throw new Error(`no workspace ${id}`);
    w.name = String(name); return w;
  }

  setActive(id) {
    if (!this.get(id)) throw new Error(`no workspace ${id}`);
    this.activeId = id; return this.getActive();
  }

  /** Remove a workspace. Refuses to remove the last one. Reassigns active. */
  remove(id) {
    const i = this.workspaces.findIndex((w) => w.id === id);
    if (i < 0) throw new Error(`no workspace ${id}`);
    if (this.workspaces.length === 1) throw new Error("cannot remove the last workspace");
    this.workspaces.splice(i, 1);
    if (this.activeId === id) this.activeId = this.workspaces[Math.max(0, i - 1)].id;
    return true;
  }

  /** Add a tab id to a workspace (deduped within that workspace). */
  addTab(wsId, tabId) {
    const w = this.get(wsId); if (!w) throw new Error(`no workspace ${wsId}`);
    if (!w.tabs.includes(tabId)) w.tabs.push(tabId);
    return w;
  }

  removeTab(wsId, tabId) {
    const w = this.get(wsId); if (!w) throw new Error(`no workspace ${wsId}`);
    w.tabs = w.tabs.filter((t) => t !== tabId);
    return w;
  }

  /** Which workspace holds a tab, or null. */
  findTab(tabId) { return this.workspaces.find((w) => w.tabs.includes(tabId)) || null; }

  /** Move a tab between workspaces atomically (removes from any current owner). */
  moveTab(tabId, toWsId) {
    const to = this.get(toWsId); if (!to) throw new Error(`no workspace ${toWsId}`);
    const from = this.findTab(tabId);
    if (from && from.id === toWsId) return to;
    if (from) from.tabs = from.tabs.filter((t) => t !== tabId);
    to.tabs.push(tabId);
    return to;
  }

  /** Plain-object snapshot for persistence / backup payloads. */
  serialize() {
    return {
      activeId: this.activeId,
      workspaces: this.workspaces.map((w) => ({ ...w, tabs: w.tabs.slice() })),
    };
  }

  /** Rebuild a store from serialize() output. */
  static deserialize(obj, opts = {}) {
    const s = new WorkspaceStore(opts);
    s.workspaces = (obj?.workspaces || []).map((w) => ({
      id: w.id, name: w.name, color: w.color ?? null, tabs: Array.isArray(w.tabs) ? w.tabs.slice() : [],
    }));
    s.activeId = obj?.activeId ?? (s.workspaces[0]?.id ?? null);
    return s;
  }
}
