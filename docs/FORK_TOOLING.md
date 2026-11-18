# Fork tooling

How Cybrsoft Browser is assembled from upstream Firefox ESR. The design goal is
**minimal, auditable, and rebase-cheap** — critical because the fork is
maintained solo (ARCHITECTURE §9, §11/B6).

## Model
We do **not** hard-fork or vendor the Firefox source into this repo. Instead:

```
config/cybrsoft.conf   ← the pin (Firefox ESR version) + identity
          │
  fetch-source.sh      → downloads + verifies the official ESR source tarball,
          │              extracts to engine/ (git-ignored), tags a pristine baseline
  apply-patches.sh     → applies patches/series, then copies the prefs,
          │              autoconfig, and branding overlays into the tree
  build.sh             → mach build   (Windows host / big-disk CI only)
  package.sh           → mach package → signed installer
```

The repo stores only **our** delta: config, a small patch queue, pref/autoconfig
overlays, branding, theme, scripts, docs. `engine/` (the multi-GB Firefox tree)
and build output are never committed (see `.gitignore`).

## Where customization lives (prefer top of this list)
1. **`prefs/cybrsoft.js`** — user-overridable default prefs (telemetry off,
   privacy defaults). No source patching.
2. **`autoconfig/cybrsoft.cfg`** — locked prefs that can never be re-enabled.
3. **`branding/cybrsoft/`** + **theme CSS** — identity via config, not code.
4. **`patches/`** — source patches, last resort, kept tiny.

This ordering is deliberate: prefs and config survive upstream churn with zero
maintenance, while source patches must be re-validated every release.

## Commands
```bash
build/scripts/fetch-source.sh          # pull the pinned ESR source
build/scripts/apply-patches.sh         # apply our delta onto engine/
build/scripts/apply-patches.sh --check # dry-run: do patches still apply?
build/scripts/rebase.sh 153.8.0        # test/adopt a new ESR release
build/scripts/build.sh                 # compile (Windows host)
build/scripts/package.sh               # produce the installer (Windows host)
```

## What is verified vs. not
- **Verified (Linux, synthetic repo):** config parsing, series parsing, and the
  patch-apply / rebase conflict-reporting logic. See `build/scripts/selftest.sh`.
- **NOT yet run:** `fetch-source.sh` against the real 153esr tarball (large
  download) and the `mach` build/package steps (need Windows + ~40 GB, blocker
  B1). These are written against Mozilla's documented build process but remain
  unexecuted until build infra exists. They are labelled as such in the code.
