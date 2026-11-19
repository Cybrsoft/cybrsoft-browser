// Cybrsoft Browser — bookmarks model
//
// Engine-independent bookmark tree: folders + bookmarks, with safe move/remove
// (no cycles, subtree removal), search, and serialize for the profile + backup.
// The chrome bookmarks UI and the bookmarks toolbar drive this. Pure + testable.

let _seq = 0;
const defaultId = () => `bm_${Date.now().toString(36)}_${(_seq++).toString(36)}`;
export const ROOT_ID = "root";

export class Bookmarks {
  constructor(opts = {}) {
    this._id = opts.idGen || defaultId;
    this.nodes = new Map();
    this.nodes.set(ROOT_ID, { id: ROOT_ID, type: "folder", title: "Bookmarks", parentId: null, children: [] });
  }

  get(id) { return this.nodes.get(id) || null; }
  _folder(id) {
    const n = this.get(id);
    if (!n || n.type !== "folder") throw new Error(`no folder ${id}`);
    return n;
  }

  addFolder(parentId, title) {
    const p = this._folder(parentId);
    const node = { id: this._id(), type: "folder", title: String(title), parentId, children: [] };
    this.nodes.set(node.id, node); p.children.push(node.id);
    return node;
  }

  addBookmark(parentId, title, url) {
    const p = this._folder(parentId);
    if (!url) throw new Error("bookmark requires a url");
    const node = { id: this._id(), type: "bookmark", title: String(title), url: String(url), parentId };
    this.nodes.set(node.id, node); p.children.push(node.id);
    return node;
  }

  rename(id, title) {
    const n = this.get(id); if (!n || id === ROOT_ID) throw new Error(`cannot rename ${id}`);
    n.title = String(title); return n;
  }
  setUrl(id, url) {
    const n = this.get(id); if (!n || n.type !== "bookmark") throw new Error(`no bookmark ${id}`);
    n.url = String(url); return n;
  }

  /** Is `maybeDescendant` inside the subtree rooted at `ancestorId`? */
  isDescendant(ancestorId, maybeDescendant) {
    let cur = this.get(maybeDescendant);
    while (cur && cur.parentId !== null) {
      if (cur.parentId === ancestorId) return true;
      cur = this.get(cur.parentId);
    }
    return false;
  }

  move(id, newParentId, index = -1) {
    if (id === ROOT_ID) throw new Error("cannot move root");
    const n = this.get(id); if (!n) throw new Error(`no node ${id}`);
    const np = this._folder(newParentId);
    if (id === newParentId || this.isDescendant(id, newParentId))
      throw new Error("cannot move a folder into itself or its descendant");
    const oldp = this._folder(n.parentId);
    oldp.children = oldp.children.filter((c) => c !== id);
    if (index < 0 || index >= np.children.length) np.children.push(id);
    else np.children.splice(index, 0, id);
    n.parentId = newParentId;
    return n;
  }

  /** Remove a node; folders remove their whole subtree. */
  remove(id) {
    if (id === ROOT_ID) throw new Error("cannot remove root");
    const n = this.get(id); if (!n) throw new Error(`no node ${id}`);
    const collect = (nid, acc) => {
      acc.push(nid);
      const node = this.get(nid);
      if (node.type === "folder") for (const c of node.children) collect(c, acc);
      return acc;
    };
    for (const nid of collect(id, [])) this.nodes.delete(nid);
    const p = this._folder(n.parentId);
    p.children = p.children.filter((c) => c !== id);
    return true;
  }

  /** Bookmarks (not folders) whose title or url matches, case-insensitive. */
  search(query) {
    const q = String(query).toLowerCase();
    const out = [];
    for (const n of this.nodes.values())
      if (n.type === "bookmark" && (n.title.toLowerCase().includes(q) || n.url.toLowerCase().includes(q)))
        out.push(n);
    return out;
  }

  /** Nested tree snapshot from a folder (default root). */
  toTree(id = ROOT_ID) {
    const n = this.get(id);
    if (n.type === "bookmark") return { id: n.id, type: "bookmark", title: n.title, url: n.url };
    return { id: n.id, type: "folder", title: n.title, children: n.children.map((c) => this.toTree(c)) };
  }

  serialize() { return this.toTree(ROOT_ID); }

  static deserialize(tree, opts = {}) {
    const b = new Bookmarks(opts);
    b.nodes.get(ROOT_ID).title = tree.title ?? "Bookmarks";
    const walk = (node, parentId) => {
      for (const child of node.children || []) {
        if (child.type === "folder") {
          const f = b.addFolder(parentId, child.title);
          walk(child, f.id);
        } else {
          b.addBookmark(parentId, child.title, child.url);
        }
      }
    };
    walk(tree, ROOT_ID);
    return b;
  }
}
