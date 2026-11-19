# Integration plan — wiring the repo into a real build

Everything in this repo so far is **source, config, and tested logic** that does
not need a compiler. This document is the bridge: it specifies exactly how each
asset gets wired into the Firefox ESR tree once build infrastructure exists
(blocker B1), so that step is turnkey rather than exploratory.

Legend: **copy** = file placed into the tree by `apply-patches.sh`; **patch** =
a small source patch in `patches/series`; **package** = included in the built
distribution.

## Map

| Repo asset | How it integrates | Mechanism |
|-----------|-------------------|-----------|
| `config/cybrsoft.conf` | drives fetch/build scripts | tooling (already wired) |
| `prefs/cybrsoft.js` | default prefs | **copy** → `browser/app/profile/cybrsoft.js`, loaded at startup |
| `prefs/profiles/*.js` | privacy-profile bundles | packaged as resources; applied by the Settings/onboarding chrome JS when a profile is selected |
| `autoconfig/cybrsoft.cfg` + `local-settings.js` | locked prefs | **copy** next to the binary (`defaults/pref/` + app dir) |
| `branding/cybrsoft/` | product identity | `--with-branding` (already in `mozconfig.windows`); **copy** into `browser/branding/cybrsoft/` |
| `theme/cybrsoft/tokens.css` + `userChrome.css` | chrome theme | ship into profile `chrome/` with legacy stylesheets pref **or** a **patch** loading it as a built-in stylesheet (preferred — no per-profile setup) |
| `pages/newtab/` | `about:cybrsoft-home` (new tab) | **patch**: register the `about:` page + set `browser.newtabpage` to it |
| `pages/onboarding/` | first-run page | **patch**: register `about:cybrsoft-welcome`; shown on first run |
| `pages/settings/` | `about:preferences` replacement/extension | **patch**: register page; bind controls to real prefs + profile bundles |
| `pages/dashboard/` | `about:cybrsoft-privacy` + toolbar panel | **patch**: register page; **bind to real data** (content-blocking log, uBO logger, permissions/cookie managers) |
| `pages/errors/` | neterror theming | **patch**: Cybrsoft `aboutNetError` styling/strings |
| `pages/search-engines.json` | search config | packaged; read by onboarding/settings; applied via the search service |
| `config/keyboard-shortcuts.json` | default accelerators | packaged; registered as chrome commands; user overrides stored in profile |
| `extensions-bundled/` (uBlock Origin) | preinstalled add-on | **package**: verified `.xpi` into `browser/extensions/` |
| `tools/backup/backup.mjs` | backup/export UI | packaged as a chrome module; backup UI calls `createBackup`/`restoreBackup`; **wire** profile read/write for the payload |

## Tested logic already exists (`src/`)
The core logic behind these features is **already written and unit-tested**
(engine-independent). Wiring is mostly connecting these modules to the engine's
data sources and the chrome UI — not writing the logic from scratch:

| Feature | Tested module | Wire it to |
|---------|--------------|-----------|
| Privacy dashboard | `src/privacy/aggregate.mjs` | the content-blocking log + uBO logger |
| Address bar | `src/omnibox/`, `src/search/` | the search service + history/bookmarks stores |
| Workspaces | `src/workspaces/` | the tab/session model |
| Bookmarks / history | `src/bookmarks/`, `src/history/` | the places DB |
| Downloads | `src/downloads/` | the engine's download events |
| Site permissions / exceptions | `src/permissions/`, `src/exceptions/` | the permission manager |
| Theme / profiles | `src/theme/`, `src/profiles/` | prefs + profile dirs |
| Import / backup | `src/import/`, `tools/backup/` | file picker + live profile read/write |

## The data-binding work (the honest gap)
The UI prototypes render and interact, but their **live data and actions are
stubbed**. Wiring each to the engine is the remaining real work:
- **Privacy dashboard/panel** → feed `aggregate()` the content-blocking event log
  (`nsIWebProgress` flags) + uBO's logger; never fabricate (ARCHITECTURE §6.4).
- **Settings** → bind each control to its Gecko pref; the profile control applies
  `prefs/profiles/<id>.js`.
- **New tab / onboarding** → `src/omnibox` + the engine's search service;
  onboarding writes the chosen engine/profile/theme/tab layout on completion.
- **Backup** → `tools/backup` over the `BACKUP_DOMAINS` gathered from the live profile.

## Order of wiring (once B1 is up)
1. Branding + prefs + autoconfig (smallest patches; validates the pipeline).
2. Theme as built-in stylesheet.
3. `about:` page registration (new tab, welcome, settings, privacy, errors).
4. Data-binding: settings↔prefs, then the privacy dashboard to real data.
5. Bundle + verify uBlock Origin; test real extensions (Phase 5).
6. Backup payload read/write against a live profile.

## Why this is safe to defer
None of the above can be *validated* without a running build, and writing
source patches against a tree we haven't fetched would be guesswork. The split
is deliberate: **logic that can be tested now is tested now** (backup, tooling,
version checks); **engine wiring waits for the build** and is specified here so
it's mechanical when it starts.
