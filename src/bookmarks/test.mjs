// Tests for bookmarks model. Run: node src/bookmarks/test.mjs
import { Bookmarks, ROOT_ID } from "./bookmarks.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

let n = 0; const idGen = () => `b${n++}`;
console.log("bookmarks tests");

// add folders + bookmarks
{
  n = 0; const b = new Bookmarks({ idGen });
  const f = b.addFolder(ROOT_ID, "Work");
  const bm = b.addBookmark(f.id, "Docs", "https://example.com");
  ok(b.get(f.id).children.length === 1, "folder has child");
  ok(bm.parentId === f.id && bm.url === "https://example.com", "bookmark added under folder");
  throws(() => b.addBookmark(f.id, "x", ""), "bookmark requires url");
  throws(() => b.addFolder("nope", "x"), "add to missing folder throws");
}

// rename / setUrl / root protection
{
  n = 0; const b = new Bookmarks({ idGen });
  const bm = b.addBookmark(ROOT_ID, "A", "https://a.com");
  b.rename(bm.id, "B"); ok(b.get(bm.id).title === "B", "rename");
  b.setUrl(bm.id, "https://b.com"); ok(b.get(bm.id).url === "https://b.com", "setUrl");
  throws(() => b.rename(ROOT_ID, "x"), "cannot rename root");
}

// move + cycle prevention
{
  n = 0; const b = new Bookmarks({ idGen });
  const f1 = b.addFolder(ROOT_ID, "F1");
  const f2 = b.addFolder(f1.id, "F2");
  const bm = b.addBookmark(ROOT_ID, "A", "https://a.com");
  b.move(bm.id, f2.id);
  ok(b.get(f2.id).children.includes(bm.id) && !b.get(ROOT_ID).children.includes(bm.id), "move reparents");
  throws(() => b.move(f1.id, f2.id), "cannot move folder into its descendant");
  throws(() => b.move(f1.id, f1.id), "cannot move folder into itself");
}

// remove subtree
{
  n = 0; const b = new Bookmarks({ idGen });
  const f1 = b.addFolder(ROOT_ID, "F1");
  const f2 = b.addFolder(f1.id, "F2");
  b.addBookmark(f2.id, "deep", "https://d.com");
  b.remove(f1.id);
  ok(!b.get(f1.id) && !b.get(f2.id), "remove folder deletes subtree");
  ok(b.nodes.size === 1, "only root remains");
  throws(() => b.remove(ROOT_ID), "cannot remove root");
}

// search
{
  n = 0; const b = new Bookmarks({ idGen });
  b.addBookmark(ROOT_ID, "GitHub", "https://github.com");
  b.addBookmark(ROOT_ID, "Mail", "https://mail.example.com");
  ok(b.search("git").length === 1, "search by title");
  ok(b.search("example.com").length === 1, "search by url");
  ok(b.search("zzz").length === 0, "search no match");
}

// serialize round-trip
{
  n = 0; const b = new Bookmarks({ idGen });
  const f = b.addFolder(ROOT_ID, "Work");
  b.addBookmark(f.id, "Docs", "https://example.com");
  b.addBookmark(ROOT_ID, "Top", "https://top.com");
  const tree = b.serialize();
  const b2 = Bookmarks.deserialize(tree, { idGen });
  // compare structural shape (titles/urls), ids differ by design
  const strip = (t) => t.type === "bookmark" ? { t: t.type, title: t.title, url: t.url }
    : { t: t.type, title: t.title, c: (t.children || []).map(strip) };
  ok(JSON.stringify(strip(b2.serialize())) === JSON.stringify(strip(tree)), "serialize round-trips (structure)");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
