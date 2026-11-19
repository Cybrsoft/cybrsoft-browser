// Cybrsoft Browser — browser profiles (multi-profile isolation)
//
// Multiple independent browser profiles (spec §13): each has its OWN history,
// cookies, bookmarks, extensions, prefs, sessions. This models the profile
// registry and — importantly — the isolation guarantee: every profile maps to a
// distinct data namespace, and data written under one is never visible under
// another. Pure + testable (an in-memory store stands in for on-disk isolation).

let _seq = 0;
const defaultId = () => `pf_${Date.now().toString(36)}_${(_seq++).toString(36)}`;

export class ProfileManager {
  constructor(opts = {}) {
    this._id = opts.idGen || defaultId;
    this.profiles = [];          // [{id, name, createdAt}]
    this.activeId = null;
    this._data = new Map();      // `${profileId}:${key}` -> value  (models isolated storage)
  }

  create(name = "Profile", { createdAt } = {}) {
    const p = { id: this._id(), name: String(name), createdAt: createdAt ?? Date.now() };
    this.profiles.push(p);
    if (this.activeId === null) this.activeId = p.id;
    return p;
  }

  get(id) { return this.profiles.find((p) => p.id === id) || null; }
  list() { return this.profiles.slice(); }
  getActive() { return this.get(this.activeId); }

  rename(id, name) { const p = this.get(id); if (!p) throw new Error(`no profile ${id}`); p.name = String(name); return p; }
  setActive(id) { if (!this.get(id)) throw new Error(`no profile ${id}`); this.activeId = id; return this.getActive(); }

  remove(id) {
    const i = this.profiles.findIndex((p) => p.id === id);
    if (i < 0) throw new Error(`no profile ${id}`);
    if (this.profiles.length === 1) throw new Error("cannot remove the last profile");
    this.profiles.splice(i, 1);
    // wipe the profile's isolated data
    for (const k of [...this._data.keys()]) if (k.startsWith(id + ":")) this._data.delete(k);
    if (this.activeId === id) this.activeId = this.profiles[Math.max(0, i - 1)].id;
    return true;
  }

  /** The isolated storage namespace key for a profile (distinct per profile). */
  dataNamespace(id) { if (!this.get(id)) throw new Error(`no profile ${id}`); return `profile/${id}`; }

  // Isolated per-profile storage (models cookies/history/etc. living separately).
  setData(profileId, key, value) { if (!this.get(profileId)) throw new Error(`no profile ${profileId}`); this._data.set(`${profileId}:${key}`, value); }
  getData(profileId, key) { return this._data.has(`${profileId}:${key}`) ? this._data.get(`${profileId}:${key}`) : undefined; }

  serialize() { return { activeId: this.activeId, profiles: this.profiles.map((p) => ({ ...p })) }; }
  static deserialize(obj, opts = {}) {
    const m = new ProfileManager(opts);
    m.profiles = (obj?.profiles || []).map((p) => ({ ...p }));
    m.activeId = obj?.activeId ?? (m.profiles[0]?.id ?? null);
    return m;
  }
}
