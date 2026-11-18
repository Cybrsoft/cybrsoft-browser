// Round-trip tests for the backup module. Run: node tools/backup/test.mjs
import { createBackup, restoreBackup, BACKUP_FORMAT, BACKUP_VERSION } from "./backup.mjs";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };
async function throws(fn, m) { try { await fn(); fail++; console.log("  FAIL " + m + " (did not throw)"); } catch { pass++; console.log("  ok  " + m); } }

const sample = {
  settings: { theme: "dark", profile: "strict", searchEngine: "duckduckgo" },
  bookmarks: [{ title: "Docs", url: "https://example.com" }],
  tabGroups: [{ name: "Work", tabs: ["a", "b"] }],
  workspaces: [{ name: "Personal" }],
  privacyExceptions: [{ site: "example-news.com", rfp: false }],
};

console.log("backup round-trip tests");

// 1. Plaintext export/import
{
  const file = await createBackup(sample);
  const meta = JSON.parse(file);
  ok(meta.format === BACKUP_FORMAT && meta.version === BACKUP_VERSION, "plaintext: header correct");
  ok(meta.encrypted === false, "plaintext: not encrypted");
  const back = await restoreBackup(file);
  ok(JSON.stringify(back) === JSON.stringify(sample), "plaintext: round-trips identically");
}

// 2. Encrypted export/import with correct password
{
  const file = await createBackup(sample, { password: "correct horse battery staple" });
  const meta = JSON.parse(file);
  ok(meta.encrypted === true && meta.cipher === "AES-GCM", "encrypted: header + cipher");
  ok(!file.includes("duckduckgo"), "encrypted: plaintext NOT present in file");
  const back = await restoreBackup(file, { password: "correct horse battery staple" });
  ok(JSON.stringify(back) === JSON.stringify(sample), "encrypted: round-trips with right password");
}

// 3. Wrong password fails
{
  const file = await createBackup(sample, { password: "right-one" });
  await throws(() => restoreBackup(file, { password: "wrong-one" }), "encrypted: wrong password throws");
}

// 4. Missing password on encrypted backup fails
{
  const file = await createBackup(sample, { password: "pw" });
  await throws(() => restoreBackup(file), "encrypted: missing password throws");
}

// 5. Tampering is detected (AES-GCM auth)
{
  const file = await createBackup(sample, { password: "pw" });
  const o = JSON.parse(file);
  const ct = Buffer.from(o.ciphertext, "base64"); ct[0] ^= 0xff; o.ciphertext = ct.toString("base64");
  await throws(() => restoreBackup(JSON.stringify(o), { password: "pw" }), "encrypted: tampering detected");
}

// 6. Non-backup input rejected
await throws(() => restoreBackup('{"hello":"world"}'), "reject: non-backup JSON");
await throws(() => restoreBackup("not json at all"), "reject: non-JSON");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
