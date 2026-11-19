// Cybrsoft Browser — per-site privacy exceptions
//
// Implements the spec's rule (§8): when a site breaks, offer a SCOPED exception
// rather than silently weakening protection globally. A site can have individual
// protections toggled off, or protection temporarily paused (with an expiry).
// Pure + testable. getEffective() merges the active profile with site overrides.

export class PrivacyExceptions {
  constructor() { this.store = new Map(); } // site -> { rfp?, fpp?, cookiePopup?, trackers?, pausedUntil? }

  _site(site) {
    if (!site) throw new Error("site required");
    if (!this.store.has(site)) this.store.set(site, {});
    return this.store.get(site);
  }

  /** Override a single protection for a site (true=on, false=off). */
  setProtection(site, name, enabled) {
    const KEYS = ["rfp", "fpp", "cookiePopup", "trackers"];
    if (!KEYS.includes(name)) throw new Error(`unknown protection: ${name}`);
    this._site(site)[name] = !!enabled;
    return this.store.get(site);
  }

  /** Temporarily pause ALL protection for a site until a timestamp. */
  pause(site, untilTs) {
    if (typeof untilTs !== "number") throw new Error("pause requires a timestamp");
    this._site(site).pausedUntil = untilTs;
    return this.store.get(site);
  }
  unpause(site) { const s = this.store.get(site); if (s) delete s.pausedUntil; }

  isPaused(site, now = Date.now()) {
    const until = this.store.get(site)?.pausedUntil;
    return typeof until === "number" && now < until;
  }

  clear(site) { return this.store.delete(site); }
  sitesWithExceptions() { return [...this.store.keys()]; }

  /**
   * Effective protection booleans for a site, given the active profile's
   * defaults. If paused, everything is off. Otherwise per-protection overrides
   * win over the profile; unset protections inherit the profile.
   * @param {object} profile e.g. { rfp:true, fpp:true, cookiePopup:true, trackers:true }
   */
  getEffective(site, profile, now = Date.now()) {
    const base = { rfp: !!profile.rfp, fpp: !!profile.fpp, cookiePopup: !!profile.cookiePopup, trackers: !!profile.trackers };
    if (this.isPaused(site, now)) return { rfp: false, fpp: false, cookiePopup: false, trackers: false, paused: true };
    const ov = this.store.get(site) || {};
    const eff = { ...base };
    for (const k of ["rfp", "fpp", "cookiePopup", "trackers"]) if (k in ov) eff[k] = ov[k];
    eff.paused = false;
    return eff;
  }

  serialize() { return { sites: Object.fromEntries(this.store) }; }
  static deserialize(obj) {
    const e = new PrivacyExceptions();
    for (const [site, data] of Object.entries(obj?.sites || {})) e.store.set(site, { ...data });
    return e;
  }
}
