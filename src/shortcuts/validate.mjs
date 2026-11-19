// Cybrsoft Browser — keyboard-shortcut validation
//
// Validates the shortcuts config (config/keyboard-shortcuts.json) and any user
// overrides: well-formed chords, no duplicate ids, and no two actions bound to
// the same chord. Used by the Settings → Shortcuts UI (to reject a bad rebind)
// and by CI (to keep the shipped defaults clean). Pure, testable.

const MOD_ALIAS = { control: "Ctrl", ctrl: "Ctrl", shift: "Shift", alt: "Alt", option: "Alt",
                    meta: "Meta", cmd: "Meta", command: "Meta", super: "Meta", win: "Meta" };
const MOD_ORDER = ["Ctrl", "Alt", "Shift", "Meta"];
const NAMED_KEYS = new Set(["Tab","Enter","Esc","Escape","Space","Left","Right","Up","Down",
  "Home","End","PageUp","PageDown","Delete","Backspace","Plus","Minus","Comma","Period","Slash"]);

/** Parse "Ctrl+Shift+T" into a normalized canonical string, or throw. */
export function normalizeChord(chord) {
  if (typeof chord !== "string" || !chord.trim()) throw new Error("empty chord");
  const parts = chord.split("+").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new Error(`invalid chord: ${chord}`);
  const key = parts.pop();
  const mods = new Set();
  for (const p of parts) {
    const m = MOD_ALIAS[p.toLowerCase()];
    if (!m) throw new Error(`invalid modifier "${p}" in "${chord}"`);
    mods.add(m);
  }
  if (!isValidKey(key)) throw new Error(`invalid key "${key}" in "${chord}"`);
  const canonical = MOD_ORDER.filter((m) => mods.has(m)).concat(normalizeKey(key)).join("+");
  return canonical;
}

function normalizeKey(k) {
  if (/^[a-z]$/i.test(k)) return k.toUpperCase();
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(k)) return k;            // F1..F24
  if (/^[0-9]$/.test(k)) return k;
  if (k === "Escape") return "Esc";
  return k;
}
function isValidKey(k) {
  return /^[a-z]$/i.test(k) || /^[0-9]$/.test(k) || /^F([1-9]|1[0-9]|2[0-4])$/.test(k) || NAMED_KEYS.has(k);
}

/**
 * Validate a shortcuts config { shortcuts: [{id, keys, ...}] }.
 * @returns {{ok:boolean, errors:string[], conflicts:string[]}}
 */
export function validateShortcuts(config) {
  const errors = [], conflicts = [];
  const list = config?.shortcuts;
  if (!Array.isArray(list)) return { ok: false, errors: ["config.shortcuts must be an array"], conflicts };

  const seenIds = new Set();
  const chordToId = new Map();
  for (const s of list) {
    if (!s || typeof s.id !== "string") { errors.push(`entry missing string id: ${JSON.stringify(s)}`); continue; }
    if (seenIds.has(s.id)) errors.push(`duplicate id: ${s.id}`);
    seenIds.add(s.id);
    let canon;
    try { canon = normalizeChord(s.keys); }
    catch (e) { errors.push(`${s.id}: ${e.message}`); continue; }
    if (chordToId.has(canon)) conflicts.push(`${canon} bound to both "${chordToId.get(canon)}" and "${s.id}"`);
    else chordToId.set(canon, s.id);
  }
  return { ok: errors.length === 0 && conflicts.length === 0, errors, conflicts };
}
