# Cybrsoft Browser

A privacy-first Windows desktop web browser by Cybrsoft, built on **Gecko** as a
**soft-fork of Firefox**. Local-first, no telemetry, no accounts, no cloud sync,
with genuine Firefox WebExtension compatibility.

> **Project status: Phase 1 — Research & Architecture.** There is **no working
> build yet.** This repository currently contains the technical architecture and
> plan that gate implementation. See `docs/PROJECT_STATUS.md` for the honest,
> up-to-date state. Nothing here is advertised as working until it is built and
> tested.

## Why a Firefox soft-fork?
It is the **only** technically viable way to ship a Gecko desktop browser with
real Firefox extension support — there is no supported desktop Gecko embedding
API. Forking also inherits Firefox's privacy/security stack (Enhanced Tracking
Protection, Total Cookie Protection, fingerprinting resistance, DoH), Reader
mode, pdf.js, Picture-in-Picture, offline translation, downloads, sandboxing, and
signed updates. Our work is the Cybrsoft identity, UI, an interactive privacy
dashboard built on **real** data, workspaces, local backup, and the update/signing
pipeline. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Documentation
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Phase 1 technical architecture
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased implementation plan
- [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) — living status / caveats
- [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md) — Cobal design tokens
- [`docs/decisions/`](docs/decisions/) — architecture decision records

## Principles
Privacy by default · no telemetry · no mandatory accounts · no cloud sync ·
local-first · strong security · extensive customization · fully open source.

## License
Intended: **MPL 2.0** (to stay compatible with the Firefox/Gecko base). Mozilla
trademarks are removed; bundled uBlock Origin is distributed unmodified under its
own license. Final license files land in Phase 8. See `docs/ARCHITECTURE.md §10`.
