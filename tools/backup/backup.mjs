// Cybrsoft Browser — backup/export reference implementation
//
// Isomorphic: uses the Web Crypto API (globalThis.crypto.subtle), so the SAME
// code runs in the browser's privileged backup UI and in Node (for tests/CLI).
// Local-first: produces/consumes a single self-describing file. No cloud, no
// account (spec §14). Optional password encryption via PBKDF2 -> AES-GCM-256.
//
// Format is specified in docs/BACKUP_FORMAT.md.

export const BACKUP_FORMAT = "cybrsoft-backup";
export const BACKUP_VERSION = 1;
const KDF_ITERATIONS = 310000; // PBKDF2-SHA256 (OWASP-aligned)

const subtle = globalThis.crypto.subtle;
const getRandom = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));

/* ---- base64 helpers (browser + Node) ---- */
function toB64(bytes) {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function fromB64(b64) {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(b64, "base64"));
  const s = atob(b64); const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u;
}
const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(password, salt) {
  const base = await subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: KDF_ITERATIONS, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}

/**
 * Create a backup file (JSON string) from a payload object.
 * @param {object} payload  the data to back up (see BACKUP_FORMAT.md)
 * @param {object} [opts]
 * @param {string} [opts.password]  if set, the payload is encrypted
 * @returns {Promise<string>} the backup file contents
 */
export async function createBackup(payload, opts = {}) {
  const base = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    created: new Date().toISOString(),
    app: "Cybrsoft Browser",
  };
  if (!opts.password) {
    return JSON.stringify({ ...base, encrypted: false, payload }, null, 2);
  }
  const salt = getRandom(16);
  const iv = getRandom(12);
  const key = await deriveKey(opts.password, salt);
  const plaintext = enc.encode(JSON.stringify(payload));
  const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  return JSON.stringify({
    ...base,
    encrypted: true,
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations: KDF_ITERATIONS, salt: toB64(salt) },
    cipher: "AES-GCM",
    iv: toB64(iv),
    ciphertext: toB64(ct),
  }, null, 2);
}

/**
 * Restore a payload object from a backup file (JSON string).
 * Throws on wrong/missing password, tampering, or an unsupported format.
 */
export async function restoreBackup(fileText, opts = {}) {
  let obj;
  try { obj = JSON.parse(fileText); } catch { throw new Error("not a valid backup file (bad JSON)"); }
  if (obj.format !== BACKUP_FORMAT) throw new Error("not a Cybrsoft backup file");
  if (obj.version > BACKUP_VERSION) throw new Error(`backup version ${obj.version} is newer than this browser supports`);

  if (!obj.encrypted) return obj.payload;

  if (!opts.password) throw new Error("this backup is encrypted — a password is required");
  const salt = fromB64(obj.kdf.salt);
  const iv = fromB64(obj.iv);
  const key = await deriveKey(opts.password, salt);
  let plainBuf;
  try {
    plainBuf = await subtle.decrypt({ name: "AES-GCM", iv }, key, fromB64(obj.ciphertext));
  } catch {
    throw new Error("decryption failed — wrong password or the file was altered");
  }
  return JSON.parse(dec.decode(plainBuf));
}

/** The set of data domains a full backup covers (spec §14). */
export const BACKUP_DOMAINS = [
  "settings", "bookmarks", "history", "tabGroups", "workspaces",
  "profiles", "searchEngines", "sitePermissions", "privacyExceptions",
  "extensionsConfig",
];
