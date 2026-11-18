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

## Cost comparison (rates as of late 2026 — confirm on vendor pages)

Planning assumption: a **clean** Firefox build ≈ **90 min on 8 vCPU**, **~60 min
on 16 vCPU**. ⚠️ **This is an estimate, not measured** — the first job's real
time sets the true cost, and `sccache` makes later incremental builds much
faster. ESR security rebases are ~monthly, so figure **~12–15 builds/year**.

| Option | Windows rate | Est. per clean build* | GitHub plan? | Setup effort | Notes |
|--------|-------------|----------------------|--------------|-------------|-------|
| **GitHub larger runner, 8‑core** | ~$0.042/min | **~$3.80** | **Team+ required** | Low — change `runs-on` | First-party; priciest/min; always billed (even public repos) |
| GitHub larger runner, 16‑core | ~$0.082/min | ~$4.90 | Team+ required | Low | Faster wall-clock |
| **WarpBuild, 8‑core** | ~$0.032/min | **~$2.90** | none | Low — sign up, set runner label | ~25% cheaper, claims ~2× faster, **$10 free credits**, no seat fee |
| WarpBuild, ~16‑core | ~$0.064/min (est) | ~$3.80 | none | Low | |
| Depot | Windows rate not published | ~ | none | Low | Per-second billing; check depot.dev |
| **On-demand cloud VM** (e.g. AWS c5.4xlarge, 16 vCPU) | ~$1.36/hr Windows on-demand; spot cheaper | **~$2–3** | none | **High** — script provision/toolchain/teardown | Most control, cheapest at scale, most engineering |

*Per-build = rate × est. build time. **Annual compute ≈ $45–75** at ~15
builds/year — the real cost is **setup effort, not dollars**.

### Recommendation (solo maintainer)
1. **Start with a WarpBuild-style third-party runner.** Cheapest per minute, no
   GitHub plan upgrade, and **$10 free credits cover the first real build at
   ~zero cost** — which is exactly what we need to *measure* actual build time
   and disk before committing. Wiring = sign up + change the runner label in
   `build-windows.yml`.
2. **GitHub larger runner** if you prefer staying first-party and are willing to
   be on GitHub **Team** (~$4/user/mo) — larger runners aren't available on a
   personal free account.
3. **On-demand cloud VM** only if you want zero third-party CI and don't mind
   scripting provisioning/teardown — cheapest at volume, most setup.

### First concrete step (whichever you pick)
Run **one** Windows build to get the real build time + disk footprint. That
single measurement replaces every estimate above and tells us the true per-build
cost. Everything in this repo (`fetch-source.sh` → `apply-patches.sh` →
`build.sh` → `package.sh`) is ready to drive it.

## Decision: WarpBuild (2026-11-18)
Chosen for the first build: a WarpBuild Windows runner — cheapest per minute, no
GitHub plan upgrade, and free starter credits to measure build #1 at ~$0.
`.github/workflows/build-windows.yml` is wired for it (8 vCPU label).

### One-time setup (owner)
1. Create a **WarpBuild account** at <https://warpbuild.com> (free starter credits).
2. Install the **WarpBuild GitHub App** on `BenDaDev/cybrsoft-browser`.
3. In WarpBuild, confirm a Windows runner matching the workflow label
   `warp-windows-latest-x64-8x` (change the label in the workflow for another size).
4. GitHub → **Actions** → **build-windows** → **Run workflow**.

### First run = the measurement run
A Windows Firefox CI build almost always needs a tweak on the first attempt
(toolchain/path quirks). The first run's job is to (a) surface anything to fix
and (b) print the **real build time + disk** (the workflow logs both), replacing
the estimates in this doc. Expect to iterate once or twice; that's normal.

## Status
WarpBuild selected; `build-windows.yml` wired. Awaiting owner's WarpBuild
account + GitHub App install, then the first (measurement) run.
