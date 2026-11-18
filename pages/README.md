# Browser UI pages

The Cybrsoft chrome pages. In the shipped browser these become privileged
`about:` pages (e.g. `about:cybrsoft-home`, the first-run wizard, settings),
built from Firefox's HTML/JS frontend and styled with the design tokens
(`theme/cybrsoft/tokens.css`).

| Page | File | Purpose |
|------|------|---------|
| First-run onboarding | `onboarding/index.html` | Search-engine choice (no imposed default), privacy level, theme, tab layout |
| New tab | `newtab/index.html` | Minimal default: search + optional shortcuts + real-data protection indicator |
| Settings | `settings/index.html` | Privacy (applies the profile bundles), Appearance, Search, Tabs/Workspaces, Downloads, Updates, Backup, Extensions, About |
| Privacy dashboard (full) | `dashboard/index.html` | Flagship (spec §9): blocked trackers/ads/fingerprinters, why-blocked, per-site controls, cookies, permissions |
| Privacy panel (toolbar) | `dashboard/panel.html` | Compact popup: this-site counts, quick pause, report breakage, link to full dashboard |
| Search engines | `search-engines.json` | The engine list the wizard/settings read; `default: null` (user must choose) |

## Status (honest)
- These are **real, working UI prototypes** you can open in any browser — layout,
  flow, theming, and interactions all function client-side.
- They are **not yet wired into the browser engine.** The counters, search, and
  pref-applying actions are stubbed in these standalone files; in the build they
  bind to the real subsystems (search service, prefs, the privacy subsystem that
  provides **real** blocked-tracker data — never fabricated, ARCHITECTURE §6.4).
- Wiring them in as `about:` pages happens once the engine tree + build host
  exist (blocker B1), as a Phase 3 source patch.

## Design note
Tokens are currently inlined per page for standalone previewing. When integrated,
pages import the shared `theme/cybrsoft/tokens.css` so there is one source of
truth. The inlined values mirror that file exactly.

## Preview
Open any `index.html` directly, or `theme/cybrsoft/preview.html` for the identity
overview. Each page has a light/dark control.
