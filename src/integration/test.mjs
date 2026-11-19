// Integration test: a full profile survives an encrypted backup round-trip,
// exercising every feature module + the backup crypto together.
// Run: node src/integration/test.mjs
import { createBackup, restoreBackup, BACKUP_DOMAINS } from "../../tools/backup/backup.mjs";
import { Bookmarks, ROOT_ID } from "../bookmarks/bookmarks.mjs";
import { History } from "../history/history.mjs";
import { WorkspaceStore } from "../workspaces/workspaces.mjs";
import { SitePermissions } from "../permissions/permissions.mjs";
import { PrivacyExceptions } from "../exceptions/exceptions.mjs";
import { Downloads } from "../downloads/downloads.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };

console.log("integration: full-profile backup round-trip");

// --- build a realistic profile from the modules ---
const bm = new Bookmarks();
const folder = bm.addFolder(ROOT_ID, "Work");
bm.addBookmark(folder.id, "Docs", "https://example.com");

const hist = new History();
hist.addVisit("https://example.com", { title: "Example", ts: 1000 });
hist.addVisit("https://example.com", { ts: 2000 });

const ws = new WorkspaceStore();
const w = ws.create("Personal");
ws.addTab(w.id, "tab-1");

const perms = new SitePermissions();
perms.set("example.com", "camera", "allow");

const exc = new PrivacyExceptions();
exc.setProtection("news.com", "rfp", false);

const dl = new Downloads();
const d = dl.add("https://example.com/file.zip", { totalBytes: 100 });
dl.start(d.id); dl.complete(d.id);

const payload = {
  settings: { theme: "dark", profile: "strict", searchEngine: "duckduckgo" },
  bookmarks: bm.serialize(),
  history: hist.serialize(),
  workspaces: ws.serialize(),
  sitePermissions: perms.serialize(),
  privacyExceptions: exc.serialize(),
  downloads: dl.serialize(),
};

// every domain we claim to back up is present (minus the engine-only ones)
ok(BACKUP_DOMAINS.includes("bookmarks") && BACKUP_DOMAINS.includes("workspaces"), "BACKUP_DOMAINS covers these");

// --- encrypted backup -> restore ---
const file = await createBackup(payload, { password: "a strong passphrase" });
ok(!file.includes("example.com"), "encrypted backup does not leak plaintext");
const restored = await restoreBackup(file, { password: "a strong passphrase" });

// --- rebuild modules from restored data and verify ---
const bm2 = Bookmarks.deserialize(restored.bookmarks);
ok(bm2.search("docs").length === 1, "bookmarks rebuilt");

const hist2 = History.deserialize(restored.history);
ok(hist2.getByUrl("https://example.com").visitCount === 2, "history rebuilt (visit count intact)");

const ws2 = WorkspaceStore.deserialize(restored.workspaces);
ok(ws2.getActive().name === "Personal" && ws2.getActive().tabs.includes("tab-1"), "workspaces rebuilt");

const perms2 = SitePermissions.deserialize(restored.sitePermissions);
ok(perms2.get("example.com", "camera") === "allow", "permissions rebuilt");

const exc2 = PrivacyExceptions.deserialize(restored.privacyExceptions);
ok(exc2.getEffective("news.com", { rfp: true, fpp: true, cookiePopup: true, trackers: true }, 0).rfp === false,
   "privacy exceptions rebuilt (scoped override intact)");

const dl2 = Downloads.deserialize(restored.downloads);
ok(dl2.list("completed").length === 1, "downloads rebuilt");

ok(JSON.stringify(restored.settings) === JSON.stringify(payload.settings), "settings intact");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
