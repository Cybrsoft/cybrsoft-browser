// Cybrsoft Browser — session & tab restoration
//
// Two jobs (spec §6): (1) a recently-closed-tabs stack powering "reopen closed
// tab" (Ctrl+Shift+T), and (2) session snapshots for restore on startup / after
// a crash. Pure + testable; the chrome feeds it tab events and restores from it.

export class SessionManager {
  constructor({ maxClosed = 25 } = {}) {
    this.maxClosed = maxClosed;
    this.closed = []; // most-recently-closed LAST (stack)
  }

  /** Record a just-closed tab so it can be reopened. */
  recordClosed(tab, { ts } = {}) {
    if (!tab || !tab.url) throw new Error("closed tab needs a url");
    this.closed.push({
      url: tab.url, title: tab.title || "", index: tab.index ?? null,
      workspaceId: tab.workspaceId ?? null, closedAt: ts ?? Date.now(),
    });
    if (this.closed.length > this.maxClosed) this.closed.shift(); // drop oldest
    return this.closed[this.closed.length - 1];
  }

  /** Pop and return the most recently closed tab (null if none). */
  reopenLast() { return this.closed.pop() ?? null; }

  /** Most-recently-closed first, without removing. */
  recentlyClosed(limit = 25) { return this.closed.slice().reverse().slice(0, limit); }

  clearClosed() { this.closed = []; }

  /**
   * Build a serializable session snapshot from the live window/tab state.
   * @param {{windows: Array<{tabs: Array, activeIndex?: number}>}} state
   */
  static snapshot(state) {
    const windows = (state?.windows || []).map((w) => ({
      activeIndex: typeof w.activeIndex === "number" ? w.activeIndex : 0,
      tabs: (w.tabs || []).map((t) => ({
        url: t.url, title: t.title || "", pinned: !!t.pinned, workspaceId: t.workspaceId ?? null,
      })),
    }));
    return { version: 1, savedAt: Date.now(), windows };
  }

  /**
   * Resolve a snapshot into the windows/tabs to recreate on restore.
   * Drops empty windows and clamps activeIndex into range.
   * @returns {Array<{tabs:Array, activeIndex:number}>}
   */
  static restore(snapshot) {
    if (!snapshot || snapshot.version !== 1) throw new Error("unsupported session snapshot");
    return (snapshot.windows || [])
      .filter((w) => (w.tabs || []).length > 0)
      .map((w) => ({
        tabs: w.tabs.map((t) => ({ ...t })),
        activeIndex: Math.min(Math.max(0, w.activeIndex || 0), w.tabs.length - 1),
      }));
  }

  serialize() { return { closed: this.closed.slice() }; }
  static deserialize(obj, opts = {}) {
    const s = new SessionManager(opts);
    s.closed = (obj?.closed || []).slice(-s.maxClosed);
    return s;
  }
}
