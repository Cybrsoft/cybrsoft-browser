# Cybrsoft Browser

A privacy-first Windows desktop web browser by Cybrsoft, built on **Gecko** as a
**soft-fork of Firefox**. Local-first, no telemetry, no accounts, no cloud sync,
with genuine Firefox WebExtension compatibility.

> **Project status: Phases 2–6 in progress (source-only).** There is **no
> compiled browser yet** — producing a runnable `.exe` is gated on Windows build
> infrastructure (see `docs/BUILD_INFRA.md`). Everything that can be built and
> tested *without* a compiler is done: the fork build-system, security-rebase
> automation, privacy config, branding, theme, UI pages, a tested backup module,
> and CI. See [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) for the honest,
> up-to-date state. Nothing is advertised as working until it is built and tested.

## Why a Firefox soft-fork?
It is the **only** technically viable way to ship a Gecko desktop browser with
real Firefox extension support — there is no supported desktop Gecko embedding
API. Forking also inherits Firefox's privacy/security stack (Enhanced Tracking
Protection, Total Cookie Protection, fingerprinting resistance, DoH), Reader
mode, pdf.js, Picture-in-Picture, offline translation, downloads, sandboxing, and
signed updates. Our work is the Cybrsoft identity, UI, an interactive privacy
dashboard built on **real** data, workspaces, local backup, and the update/signing
pipeline. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## What's in the repo
| Area | Where |
|------|-------|
| Fork build-system (fetch → patch → build → package) | `build/`, `config/cybrsoft.conf` |
| Security-rebase automation + ESR watch | `build/scripts/rebase.sh`, `.github/workflows/esr-watch.yml` |
| Privacy config (telemetry kill-list, profiles) | `prefs/`, `autoconfig/`, `docs/PRIVACY_PROFILES.md` |
| Branding + chrome theme + tokens | `branding/cybrsoft/`, `theme/cybrsoft/` |
| UI pages (new-tab, onboarding, settings, privacy dashboard, errors) | `pages/` |
| Backup/export (tested Web Crypto) | `tools/backup/`, `docs/BACKUP_FORMAT.md` |
| Bundled extensions plan (uBlock Origin) | `extensions-bundled/` |
| CI (build-independent verification) | `.github/workflows/ci.yml` |

## Documentation
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — technical architecture
- [`docs/ROADMAP.md`](docs/ROADMAP.md) · [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) — plan & living status
- [`docs/INTEGRATION.md`](docs/INTEGRATION.md) — how each asset wires into a build
- [`docs/FORK_TOOLING.md`](docs/FORK_TOOLING.md) · [`docs/REBASE.md`](docs/REBASE.md) · [`docs/BUILD.md`](docs/BUILD.md) · [`docs/BUILD_INFRA.md`](docs/BUILD_INFRA.md)
- [`docs/PRIVACY_PROFILES.md`](docs/PRIVACY_PROFILES.md) · [`docs/BACKUP_FORMAT.md`](docs/BACKUP_FORMAT.md) · [`docs/KEYBOARD_SHORTCUTS.md`](docs/KEYBOARD_SHORTCUTS.md) · [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md)
- [`docs/decisions/`](docs/decisions/) — architecture decision records

## Build & verify
A full browser build needs Windows + ~40 GB (`docs/BUILD.md`). Build-independent
checks run in CI and locally:
```bash
bash build/scripts/selftest.sh     # fork-tooling logic
node tools/backup/test.mjs         # backup crypto (11 tests)
python3 tools/validate.py          # JSON + HTML validation
```

## Principles
Privacy by default · no telemetry · no mandatory accounts · no cloud sync ·
local-first · strong security · extensive customization · fully open source.

## License
Intended: **MPL 2.0** (to stay compatible with the Firefox/Gecko base). Mozilla
trademarks are removed; bundled uBlock Origin is distributed unmodified under its
own license. Final license files land in Phase 8. See `docs/ARCHITECTURE.md §10`.
