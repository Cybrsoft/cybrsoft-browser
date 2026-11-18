# Cybrsoft Browser — Project Status (living record)

**Updated:** 2026-11-18 · **Phase:** 2 (Browser foundation — in progress) · **Version:** pre-0.1

This is the single source of truth for what is actually done vs. claimed, per
spec §21. **No feature is listed as complete without executed tests.**

---

## Completed
**Phase 1**
- Architecture research (Gecko paths, fork landscape, build reqs, tooling)
- Engine decision: **Firefox soft-fork** — ADR-0001
- Build-tooling direction: in-house Gluon/Surfer-style toolchain — ADR-0002
- Architecture document, roadmap, design tokens, this tracker
- Public GitHub repo live; baseline pushed

**Phase 2 (so far)**
- Fork-tooling backbone: `config/cybrsoft.conf` pin (Firefox **153esr**),
  `fetch-source.sh`, `apply-patches.sh`, `build.sh`, `package.sh`
- **Rebase automation** (`rebase.sh`): tests the patch queue against a new ESR
  release and reports clean/conflict — the core of the solo security treadmill
- Telemetry/services **kill-list** via `prefs/cybrsoft.js` + locked
  `autoconfig/cybrsoft.cfg` (no source patches needed)
- `build/mozconfig.windows`, patch-queue structure, branding skeleton
- Windows CI workflow scaffold (`.github/workflows/build-windows.yml`)
- Build/rebase/tooling docs (`BUILD.md`, `REBASE.md`, `FORK_TOOLING.md`)
- **Self-test passing 5/5** (`selftest.sh`): config/series parsing + patch
  conflict detection verified on Linux
- **ESR watch automation**: `check-upstream.sh` (version-compare verified on 5
  fixtures) + weekly `esr-watch.yml` that opens a GitHub issue on a new ESR
- **Branding + first theme pass**: `theme/cybrsoft/tokens.css` (light + navy
  dark), `userChrome.css` chrome theme, Firefox branding files (`configure.sh`,
  `brand.ftl`, branding prefs), and a rendered `theme/cybrsoft/preview.html`

## Decisions locked (2026-11-18)
- **Upstream channel:** Firefox **ESR** (B3)
- **Rebase ownership:** **Solo** → rebase automation is a first-class goal (B6)
- **Brand capture:** ✅ **done** — `cobal.framer.ai` allowlisted and the real identity (palette incl. dark navy family, Inter + Bricolage Grotesque, signature gradient, tone) captured into `DESIGN_TOKENS.md` (B5)
- **Code hosting:** public **GitHub** under a Cybrsoft org (B7) — *pending owner creating the repo*

## In progress
- Phase 2: chrome theme (`userChrome.css`) written but **not yet validated
  against a running build** (blocker B1); icon assets still needed from brand
- Build infrastructure (B1) deferred — **maintainer PC lacks 40 GB; builds run
  in cloud CI, not locally.** Options in `BUILD_INFRA.md`; not needed for Phase 2
  source work
- Release-time blockers open: code-signing cert (B2), update server (B4)

## Not started
- First actual **compiled binary** — needs build infra (B1); tooling is ready
  to drive it
- Source patches for branding strings / chrome CSS (added against the real
  engine tree once `fetch-source.sh` has run)
- Phases 3–8

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
- `build/scripts/selftest.sh` → **5/5 passed** (2026-11-18, Linux): config loads,
  series parsing skips comments/blanks, good patch applies clean, bad patch
  detected as conflict.
- `bash -n` syntax check: **all 7 scripts pass.**
- **NOT yet executed** (need Windows + ~40 GB, blocker B1): `fetch-source.sh`
  against the real 153esr tarball, `build.sh`, `package.sh`. No compiled binary
  exists yet — this is stated plainly and not claimed as working.

## Next steps
1. Branding assets + first chrome theme pass (Cobal tokens) — no build needed.
2. Stand up build infra (B1) → run `fetch-source.sh` + first `mach build`.
3. Add branding/chrome source patches against the real engine tree.
