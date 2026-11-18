# Cybrsoft Browser — Project Status (living record)

**Updated:** 2026-11-18 · **Phase:** 1 (Research & Architecture) · **Version:** pre-0.1

This is the single source of truth for what is actually done vs. claimed, per
spec §21. **No feature is listed as complete without executed tests.**

---

## Completed
- Phase 1 architecture research (Gecko paths, fork landscape, build reqs, tooling)
- Engine decision: **Firefox soft-fork** — ADR-0001
- Build-tooling direction: **Gluon/Surfer-style** vendored toolchain — ADR-0002
- Architecture document, roadmap, design tokens, this tracker

## Decisions locked (2026-11-18)
- **Upstream channel:** Firefox **ESR** (B3)
- **Rebase ownership:** **Solo** → rebase automation is a first-class goal (B6)
- **Brand capture:** ✅ **done** — `cobal.framer.ai` allowlisted and the real identity (palette incl. dark navy family, Inter + Bricolage Grotesque, signature gradient, tone) captured into `DESIGN_TOKENS.md` (B5)
- **Code hosting:** public **GitHub** under a Cybrsoft org (B7) — *pending owner creating the repo*

## In progress
- Brand capture blocked on `cobal.framer.ai` being allowlisted in the session
- Build infrastructure (B1) deferred — architect to present options before first compile
- Release-time blockers open: code-signing cert (B2), update server (B4)

## Not started
- Everything in Phases 2–8 (no browser code written yet — by design: Phase 1
  gates implementation)

## Known limitations / honest caveats
- **No build exists yet.** Nothing here is a working browser; this is the
  pre-implementation architecture gate.
- **Cobal brand not captured:** `cobal.framer.ai` was not reachable from the
  build environment (host not allowlisted). Design tokens in
  `DESIGN_TOKENS.md` are the agreed starting point only.
- **Permanent security-rebase treadmill** (~4 weeks/upstream release) is a
  structural commitment, not a one-time task (ARCHITECTURE §9).
- Some privacy-dashboard data points may be "not available" rather than
  fabricated (ARCHITECTURE §6.4).

## Blockers (owner input needed)
See `ARCHITECTURE.md §11`: B1 build infra · B2 code-signing cert · B3 ESR vs
stable · B4 update server · B5 brand capture · B6 team/cadence commitment.

## Test results
- None yet (no code). Test logs will be recorded here from Phase 2 onward.

## Next steps
1. Resolve B1 (Windows build infra) and B3 (upstream channel).
2. Produce a reproducible upstream Firefox build on the target toolchain.
3. Accept ADR-0001/0002 → open Phase 2.
