// Cybrsoft Browser — browsing history model
//
// Local-only history (spec §13/§14 — never synced). Records visits, dedupes by
// URL, and ranks for address-bar suggestions with a simple "frecency" (frequency
// + recency). Pure + testable; `now` is injectable for deterministic tests.

const DAY = 86400000;

export class History {
  constructor() { this.entries = new Map(); } // url -> {url, title, visitCount, lastVisit}

  addVisit(url, { title, ts } = {}) {
    if (!url) throw new Error("addVisit requires url");
    const now = ts ?? Date.now();
    const e = this.entries.get(url);
    if (e) {
      e.visitCount++;
      e.lastVisit = Math.max(e.lastVisit, now);
      if (title) e.title = String(title);
      return e;
    }
    const ne = { url, title: title ? String(title) : "", visitCount: 1, lastVisit: now };
    this.entries.set(url, ne);
    return ne;
  }

  getByUrl(url) { return this.entries.get(url) || null; }
  remove(url) { return this.entries.delete(url); }
  clear() { this.entries.clear(); }
  size() { return this.entries.size; }

  /** Most recently visited first. */
  recent(limit = 20) {
    return [...this.entries.values()].sort((a, b) => b.lastVisit - a.lastVisit).slice(0, limit);
  }

  _recencyFactor(lastVisit, now) {
    const age = now - lastVisit;
    if (age < DAY) return 1.0;
    if (age < 7 * DAY) return 0.7;
    if (age < 30 * DAY) return 0.5;
    return 0.3;
  }
  frecency(entry, now = Date.now()) {
    return entry.visitCount * this._recencyFactor(entry.lastVisit, now);
  }

  /** Address-bar suggestions: entries matching text, ranked by frecency. */
  query(text, { limit = 10, now = Date.now() } = {}) {
    const q = String(text).toLowerCase();
    const matches = [...this.entries.values()].filter(
      (e) => e.url.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)
    );
    return matches
      .map((e) => ({ ...e, score: this.frecency(e, now) }))
      .sort((a, b) => b.score - a.score || b.lastVisit - a.lastVisit)
      .slice(0, limit);
  }

  serialize() { return { entries: [...this.entries.values()].map((e) => ({ ...e })) }; }
  static deserialize(obj) {
    const h = new History();
    for (const e of obj?.entries || []) h.entries.set(e.url, { ...e });
    return h;
  }
}
