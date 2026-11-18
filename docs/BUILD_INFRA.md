# Build Infrastructure (Blocker B1)

**Question:** where does the ~40 GB, multi-hour Windows build of the Firefox-based
Cybrsoft Browser actually run?

**Constraint on record (2026-11-18):** the maintainer's local PC does **not** have
40 GB free. **This does not block the project** — the build was never going to run
on the maintainer's machine. Firefox forks build in CI / on a build host and ship
a finished installer that users (and the maintainer) just download.

## What needs a build vs. what doesn't
- **Needs a 40 GB build host:** producing a runnable/installable `.exe` to test.
- **Needs *nothing* but this repo:** all Phase 2 source work — fork tooling,
  patch queue, branding, prefs, theme/`userChrome`, rebase automation scripts,
  docs. We can progress through almost all of Phase 2 with **no build at all**;
  the build only gates the *first compiled binary*.

## Options (for a solo maintainer, no capable local machine)

| Option | Disk / specs | Cost | Notes |
|--------|--------------|------|-------|
| **GitHub Actions — free Windows runner** | 4 CPU / 16 GB RAM / **14 GB SSD** | **Free, unlimited minutes on public repos** | Disk is **too small** for a 40 GB build out of the box. Workable only with aggressive disk trimming (remove preinstalled SDKs, use the temp drive, `sccache`) and risks the 6-hour job limit. Fiddly for full Firefox. |
| **GitHub larger runners** | More disk/CPU/RAM | Paid, per-minute | Official; removes the disk pinch. Reasonable for infrequent ESR builds. |
| **Third-party CI (Depot / WarpBuild)** | 100–256 GB SSD Windows | Paid, per-minute (often faster) | Big disk, fast; good fit for heavy Firefox builds. |
| **On-demand cloud Windows VM** (Azure/AWS/GCP spot) | Size to taste (e.g. 8 vCPU / 32 GB / 100 GB) | Pay only for build hours | Spin up, build, download installer, destroy. Most control; a bit more setup. |

## Why cost stays low
ESR cadence = a security rebase/build roughly **every ~4 weeks**, not constant.
Builds are infrequent, so even paid per-build minutes are a small recurring cost.
Local development of everything else is free (this session + the repo).

## Recommendation
1. **Now:** build all Phase 2 *source/tooling* with no build host (free).
2. **First build:** add a GitHub Actions workflow targeting Windows. Try the
   **free runner + disk-trimming** first (zero cost on a public repo). If disk or
   the time limit makes it unreliable — the likely outcome for full Firefox —
   move that same workflow to a **larger/third-party runner or an on-demand VM**.
3. The maintainer's PC only ever needs enough space to **download and run the
   finished installer** (hundreds of MB), never to build.

## Status
Deferred until the first compiled binary is needed. No decision required to
continue Phase 2 scaffolding.
