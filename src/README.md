# Browser feature logic (`src/`)

Pure, engine-independent modules that hold the **real logic** behind Cybrsoft
features — the code the chrome UI calls once wired into the build. Keeping this
logic separate from the DOM/engine makes it **fully unit-testable now**, before a
compiler exists, and keeps the UI pages (`pages/`) thin.

| Module | What | Tests |
|--------|------|-------|
| `workspaces/workspaces.mjs` | Workspaces state engine — real persisted tab-sets (create/rename/remove/switch, atomic tab moves, serialize for profile + backup) | 20 |
| `privacy/aggregate.mjs` | Privacy-dashboard aggregation — turns raw engine block-events into the dashboard numbers. **Only counts what it's given; never fabricates** (spec §9) | 16 |
| `search/search.mjs` | Omnibox logic — navigate-vs-search decision + search-URL building for the chosen engine (no imposed default) | 23 |
| `shortcuts/validate.mjs` | Keyboard-shortcut validation — chord parsing, duplicate-binding/id detection; guards rebinds and the shipped config | 11 |

Run all tests: `bash tools/run-tests.sh` (also run in CI).

## How these connect to the UI
The pages in `pages/` are standalone prototypes with inlined logic for previewing.
When integrated into the build (see `docs/INTEGRATION.md`), the `about:` pages
import these modules instead:
- privacy dashboard → `privacy/aggregate.mjs` fed by the real content-blocking log
- new tab / address bar → `search/search.mjs`
- settings (workspaces, shortcuts) → `workspaces/*`, `shortcuts/validate.mjs`
- backup payload → `workspaces` serialize + `tools/backup/`

These modules are the tested source of truth; the pages are the visual shell.
