# Keyboard shortcuts

Defaults live in `config/keyboard-shortcuts.json` (Windows bindings). All are
**customizable** in Settings → Shortcuts (spec §16); user overrides are stored in
the profile, defaults are never mutated.

## Model
- Each entry: `id` (stable action name), `keys` (default binding), `desc`,
  `customizable`.
- The browser registers these as default command accelerators; a user rebind
  writes an override keyed by `id`.
- Conflicts (two actions on one chord) are detected and surfaced in the UI — the
  later binding wins only after the user confirms.
- A few OS/engine-reserved combos may be marked `customizable: false` (none are
  yet; the flag exists for when the engine reserves one).

## Cybrsoft-specific actions
Beyond standard browser shortcuts, we add:
| Action | Default | id |
|--------|---------|----|
| Open privacy dashboard | `Ctrl+Shift+Y` | `privacy.dashboard` |
| Protection panel (this site) | `Ctrl+Shift+K` | `privacy.panel` |
| Toggle vertical tabs | `Ctrl+Alt+V` | `view.verticalTabs` |
| Next / previous workspace | `Ctrl+Alt+Right/Left` | `workspace.next/prev` |

## Status
Default map defined and validated as JSON (CI). The settings UI to rebind, and
registering accelerators in the chrome, land against a real build (B1).
