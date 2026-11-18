# ADR-0002: Fork build tooling (Gluon/Surfer-style, vendored)

- **Status:** Proposed
- **Date:** 2026-11-18
- **Depends on:** ADR-0001

## Context
A soft-fork needs a repeatable pipeline: fetch a pinned Firefox source, apply the
Cybrsoft patch queue + branding, build with `mach`, and package a Windows
installer — reproducibly, in CI, and across upstream rebases.

## Options
1. **Hand-rolled scripts** around `mach` + manual patch application.
2. **Adopt an existing FF-fork toolchain** (Gluon → Surfer lineage, used by
   Pulse/Dot → Zen).
3. **Build our own tool from scratch.**

## Decision
**Option 2, vendored and pinned** — adopt a Gluon/Surfer-style tool, but **vendor
and pin** it (or maintain a thin in-house fork) so we don't depend on a possibly
unmaintained upstream. Fall back to Option 1 patterns where the tool is thin.

## Rationale
- These tools already encode the exact workflow (download → import patches →
  build → package) that every modern FF fork uses; reusing them avoids
  reinventing fragile glue.
- Vendoring/pinning protects us from upstream-tool abandonment (Surfer is
  described as a prerelease prototype; Gluon's lineage has stalled before).
- Keeping the option to drop to raw `mach` scripts means no hard lock-in.

## Consequences
- **Positive:** fast start; patch-queue discipline built in; CI-friendly.
- **Negative:** another dependency to audit and maintain; Node-based tool in a
  mostly C++/JS/Python stack; must track upstream Firefox version bumps in the
  tool config.

## Follow-ups
- Stand up the pipeline in Phase 2 against the chosen channel (B3).
- Reproducible Windows build in CI with compile caching (e.g. sccache) — B1.
