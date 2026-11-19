# Browser feature logic (`src/`)

Pure, engine-independent modules that hold the **real logic** behind Cybrsoft
features — the code the chrome UI calls once wired into the build. Keeping this
logic separate from the DOM/engine makes it **fully unit-testable now**, before a
compiler exists, and keeps the UI pages (`pages/`) thin.

| Module | What | Tests |
|--------|------|-------|
| `workspaces/` | Workspaces state engine — real persisted tab-sets, atomic tab moves, serialize | 20 |
| `privacy/` | Dashboard aggregation — raw block-events → numbers. **Only counts what it's given; never fabricates** (§9) | 16 |
| `search/` | Omnibox — navigate-vs-search + per-engine query building (no imposed default) | 23 |
| `shortcuts/` | Keyboard-shortcut validation — chord parsing, duplicate detection; guards the shipped config | 11 |
| `bookmarks/` | Bookmark tree — safe move (no cycles), subtree remove, search, serialize | 17 |
| `history/` | Local history — dedupe, frecency ranking for suggestions, query/recent | 14 |
| `downloads/` | Download state machine — queued→active↔paused→done/failed/canceled, progress/speed/percent | 20 |
| `permissions/` | Per-site website permissions — privacy-leaning defaults, effective-state resolution | 15 |
| `exceptions/` | Per-site privacy exceptions — scoped override + pause-with-expiry; never weakens other sites (§8) | 13 |
| `theme/` | Theme resolution — system/light/dark + accent validation (§5) | 12 |
| `profiles/` | Multi-profile registry + **isolation** guarantee (distinct data namespaces, §13) | 13 |
| `omnibox/` | Address-bar suggestions — unifies history + bookmarks + search, deduped & ranked | 11 |
| `import/` | Bookmark import — parses Netscape HTML (Firefox/Chrome/Edge/Safari), skips unsafe entries (§12) | 11 |
| `session/` | Session & tab restoration — recently-closed stack (Ctrl+Shift+T) + snapshot/restore (§6) | 14 |
| `integration/` | Full-profile **encrypted backup round-trip** across every module | 9 |

Run all tests: `bash tools/run-tests.sh` or `npm test` (also run in CI). ~230 unit tests across 16 modules.

## How these connect to the UI
The pages in `pages/` are standalone prototypes with inlined logic for previewing.
When integrated into the build (see `docs/INTEGRATION.md`), the `about:` pages
import these modules instead:
- privacy dashboard → `privacy/aggregate.mjs` fed by the real content-blocking log
- new tab / address bar → `search/search.mjs`
- settings (workspaces, shortcuts) → `workspaces/*`, `shortcuts/validate.mjs`
- backup payload → `workspaces` serialize + `tools/backup/`

These modules are the tested source of truth; the pages are the visual shell.
