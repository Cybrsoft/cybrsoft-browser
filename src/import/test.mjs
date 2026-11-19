// Tests for bookmark import. Run: node src/import/test.mjs
import { importNetscapeBookmarks, isNetscapeBookmarks } from "./bookmarks-import.mjs";
import { ROOT_ID } from "../bookmarks/bookmarks.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
const throws = (fn, m) => { try { fn(); fail++; console.log("  FAIL " + m + " (no throw)"); } catch { pass++; console.log("  ok  " + m); } };

// A realistic Firefox/Chrome export, incl. a nested folder and entities.
const HTML = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><A HREF="https://top.example/">Top Level</A>
    <DT><H3>Work &amp; Study</H3>
    <DL><p>
        <DT><A HREF="https://docs.example/?a=1&amp;b=2" ADD_DATE="1700000000">Docs &amp; More</A>
        <DT><H3>Nested</H3>
        <DL><p>
            <DT><A HREF="https://deep.example/">Deep</A>
        </DL><p>
    </DL><p>
    <DT><A HREF="javascript:void(0)">Bad bookmarklet</A>
</DL><p>`;

console.log("bookmark import tests");

ok(isNetscapeBookmarks(HTML), "detects Netscape format");
ok(!isNetscapeBookmarks("just some text"), "rejects non-bookmark text");
throws(() => importNetscapeBookmarks("nope"), "throws on non-bookmark input");

const { bookmarks: b, counts } = importNetscapeBookmarks(HTML);

// structure
const root = b.toTree(ROOT_ID);
const names = root.children.map((c) => (c.type === "folder" ? `[${c.title}]` : c.title));
ok(names.includes("Top Level"), "top-level bookmark imported");
ok(names.includes("[Work & Study]"), "folder imported + entity decoded");

const work = root.children.find((c) => c.type === "folder" && c.title === "Work & Study");
const workTitles = work.children.map((c) => (c.type === "folder" ? `[${c.title}]` : c.title));
ok(workTitles.includes("Docs & More"), "bookmark inside folder, entity decoded");
ok(workTitles.includes("[Nested]"), "nested folder present");

const docs = work.children.find((c) => c.type === "bookmark" && c.title === "Docs & More");
ok(docs.url === "https://docs.example/?a=1&b=2", "url entity decoded (&amp; -> &)");

const nested = work.children.find((c) => c.type === "folder" && c.title === "Nested");
ok(nested.children.length === 1 && nested.children[0].title === "Deep", "deep nesting preserved");

// counts + javascript: skipped
ok(counts.folders === 2 && counts.bookmarks === 3, "counts correct (javascript: bookmark skipped)");
ok(b.search("javascript").length === 0, "javascript: bookmarklet not imported (safety)");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
