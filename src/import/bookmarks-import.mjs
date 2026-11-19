// Cybrsoft Browser — bookmark import (Netscape bookmark HTML)
//
// Parses the "Netscape-Bookmark-file-1" HTML that Firefox, Chrome, Edge, Safari
// and others export, into our Bookmarks model (spec §12). No DOM dependency —
// a small ordered-token parser. Pure + testable.

import { Bookmarks, ROOT_ID } from "../bookmarks/bookmarks.mjs";

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}
function stripTags(s) { return decodeEntities(String(s).replace(/<[^>]*>/g, "")).trim(); }

/** Does this text look like a Netscape bookmark export? */
export function isNetscapeBookmarks(text) {
  return /NETSCAPE-Bookmark-file-1/i.test(text) || /<DL>/i.test(text);
}

/**
 * Parse Netscape bookmark HTML into a Bookmarks model.
 * @param {string} html
 * @param {object} [opts] @param {()=>string} [opts.idGen]
 * @returns {{ bookmarks: Bookmarks, counts: {folders:number, bookmarks:number} }}
 */
export function importNetscapeBookmarks(html, opts = {}) {
  if (typeof html !== "string" || !isNetscapeBookmarks(html))
    throw new Error("not a Netscape bookmark file");

  const b = new Bookmarks({ idGen: opts.idGen });
  const stack = [ROOT_ID];
  let pendingFolder = null;
  let folders = 0, bookmarks = 0;

  const re = /<DL\b|<\/DL>|<H3\b[^>]*>([\s\S]*?)<\/H3>|<A\b[^>]*?\bHREF="([^"]*)"[^>]*>([\s\S]*?)<\/A>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tok = m[0];
    if (/^<DL\b/i.test(tok)) {
      stack.push(pendingFolder ?? stack[stack.length - 1]);
      pendingFolder = null;
    } else if (/^<\/DL>/i.test(tok)) {
      if (stack.length > 1) stack.pop();
      pendingFolder = null;
    } else if (/^<H3\b/i.test(tok)) {
      const name = stripTags(m[1]) || "Folder";
      pendingFolder = b.addFolder(stack[stack.length - 1], name).id;
      folders++;
    } else if (/^<A\b/i.test(tok)) {
      const url = decodeEntities(m[2]);
      const title = stripTags(m[3]) || url;
      if (url && !/^javascript:/i.test(url)) { b.addBookmark(stack[stack.length - 1], title, url); bookmarks++; }
    }
  }
  return { bookmarks: b, counts: { folders, bookmarks } };
}
