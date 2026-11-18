# ADR-0001: Browser engine via a Firefox soft-fork

- **Status:** Proposed (accept to open Phase 2)
- **Date:** 2026-11-18
- **Context source:** master spec §3 (Gecko required, Chromium prohibited), §10
  (genuine WebExtension compatibility)

## Context
We must ship a Gecko-based Windows desktop browser with genuine Firefox
WebExtension compatibility, and we may not use Chromium/Electron/CEF/WebView2.

## Options
1. **Embed Gecko as a library** in a custom native shell.
2. **Soft-fork Firefox** (maintained patch set over a pinned release).
3. **Hard-fork** Gecko and diverge.

## Decision
**Option 2 — soft-fork Firefox.**

## Rationale
- Option 1 is **infeasible**: no supported desktop Gecko embedding API exists.
  GeckoView is Android-only; Positron (desktop embedding) was discontinued in
  2017; there is no CEF/WebView2 equivalent for Gecko.
- Option 3 is **rejected on security**: a small team cannot safely own a full
  engine's CVE stream (violates the spec's Security-first ordering).
- Option 2 is **proven** (LibreWolf, Floorp, Zen, Mullvad, Waterfox) and is the
  only path that delivers WebExtension compatibility **for free**, because the
  product *is* Firefox underneath. It also inherits ETP, Total Cookie
  Protection, fingerprinting resistance, DoH, Reader, pdf.js, PiP, offline
  translation, downloads, sandboxing, and signed updates.

## Consequences
- **Positive:** fastest path to a real, secure, extension-compatible browser;
  most "built-in features" are inherited; low contributor barrier (mostly JS/CSS).
- **Negative / cost:** a **permanent ~4-week security-rebase treadmill**; large
  builds (~40 GB, long compiles); UI work happens inside Firefox's chrome, not a
  framework of our choosing; must remove Mozilla trademarks and comply with
  MPL 2.0.
- Pins the stack to Gecko toolchain (mach, clang, Rust, Python).

## Follow-ups
- ADR-0002 (build tooling). Resolve blockers B1–B4 (`ARCHITECTURE.md §11`).
- Decide upstream channel (ESR recommended) — tracked as B3.
