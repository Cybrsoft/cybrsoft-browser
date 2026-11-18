# Backup & export format

Cybrsoft Browser is local-first: no account, no cloud sync (spec §14). Users
move or recover their data with **local backup files**. Reference implementation:
`tools/backup/backup.mjs` (isomorphic Web Crypto — the same code runs in the
browser and in Node). Tested by `tools/backup/test.mjs` (11/11 passing).

## Two levels
- **Everyday export** — a subset (bookmarks, settings) for quick sharing/import.
- **Full backup** — everything portable, for migration or recovery:
  `settings, bookmarks, history, tabGroups, workspaces, profiles, searchEngines,
  sitePermissions, privacyExceptions, extensionsConfig` (see `BACKUP_DOMAINS`).

> External **password-manager** data is never included — it stays with the
> external manager (spec §11/§14). Cybrsoft has no password store.

## File format (JSON, versioned)
A single self-describing JSON file. `format` and `version` gate compatibility.

### Unencrypted
```json
{
  "format": "cybrsoft-backup",
  "version": 1,
  "created": "2026-11-18T12:00:00.000Z",
  "app": "Cybrsoft Browser",
  "encrypted": false,
  "payload": { "settings": { }, "bookmarks": [ ] }
}
```

### Encrypted (recommended for full backups)
```json
{
  "format": "cybrsoft-backup",
  "version": 1,
  "created": "…",
  "app": "Cybrsoft Browser",
  "encrypted": true,
  "kdf": { "name": "PBKDF2", "hash": "SHA-256", "iterations": 310000, "salt": "base64" },
  "cipher": "AES-GCM",
  "iv": "base64",
  "ciphertext": "base64"
}
```

## Encryption
- **Key derivation:** PBKDF2-HMAC-SHA256, 310,000 iterations, random 16-byte salt.
- **Cipher:** AES-GCM-256, random 12-byte IV. GCM provides confidentiality **and**
  integrity — a wrong password or any tampering fails the decrypt (verified by
  tests 3–5). The password is never stored.
- **Portability:** everything needed to decrypt (salt, iv, params) is in the file;
  only the password is external.

## Sensitive-data warning (enforced in UI)
A full backup can contain history, cookies/session data, and site permissions.
The backup UI must warn clearly before creating an unencrypted full backup and
**default to encryption**. (ARCHITECTURE §14.)

## Versioning
`version` increments on breaking changes. Restore refuses a file whose `version`
is newer than the running browser understands (test-covered), and migrates older
versions forward.

## Import from other browsers
Separate from this format: importing from Firefox / other browsers uses Gecko's
migrators where available (spec §12), not this file. This format is Cybrsoft's own
portable backup.

## Status
Format + crypto **implemented and unit-tested** (`node tools/backup/test.mjs`).
Wiring the actual profile read/write (gathering `payload` from the live profile
and applying it on restore) happens in the browser against a real build (B1).
