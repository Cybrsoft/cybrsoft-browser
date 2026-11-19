// Cybrsoft Browser — site permissions model
//
// Per-site website permissions (spec §8 "transparent website permissions").
// Pure + testable. States: allow | block | ask. Defaults lean to the privacy
// posture (location/notifications/popups blocked by default). The permissions UI
// and the privacy dashboard read/write this.

export const PERMISSIONS = ["location", "camera", "microphone", "notifications", "popups", "autoplay"];
export const STATES = ["allow", "block", "ask"];
// Privacy-leaning defaults (Strict). Camera/mic are "ask" so legit use still works.
export const DEFAULTS = {
  location: "block", camera: "ask", microphone: "ask",
  notifications: "block", popups: "block", autoplay: "block",
};

export class SitePermissions {
  constructor() { this.store = new Map(); } // site -> Map(type -> state)

  set(site, type, state) {
    if (!site) throw new Error("site required");
    if (!PERMISSIONS.includes(type)) throw new Error(`unknown permission: ${type}`);
    if (!STATES.includes(state)) throw new Error(`invalid state: ${state}`);
    if (!this.store.has(site)) this.store.set(site, new Map());
    this.store.get(site).set(type, state);
    return state;
  }

  /** Effective state for a site+type: explicit override, else the default. */
  get(site, type) {
    if (!PERMISSIONS.includes(type)) throw new Error(`unknown permission: ${type}`);
    return this.store.get(site)?.get(type) ?? DEFAULTS[type];
  }

  /** Is an explicit (non-default) override set? */
  hasOverride(site, type) { return this.store.get(site)?.has(type) ?? false; }

  clear(site, type) {
    const m = this.store.get(site); if (!m) return false;
    if (type == null) { this.store.delete(site); return true; }
    const had = m.delete(type);
    if (m.size === 0) this.store.delete(site);
    return had;
  }

  /** Effective permissions for a site (all types). */
  listForSite(site) {
    const out = {};
    for (const t of PERMISSIONS) out[t] = this.get(site, t);
    return out;
  }

  /** Sites that have at least one explicit override. */
  sitesWithOverrides() { return [...this.store.keys()]; }

  serialize() {
    const sites = {};
    for (const [site, m] of this.store) sites[site] = Object.fromEntries(m);
    return { sites };
  }
  static deserialize(obj) {
    const p = new SitePermissions();
    for (const [site, perms] of Object.entries(obj?.sites || {}))
      for (const [t, s] of Object.entries(perms)) p.set(site, t, s);
    return p;
  }
}
