# Building Cybrsoft Browser

> **Reality check:** a full build needs **Windows**, the Mozilla toolchain, and
> **~40 GB** of free disk; it takes tens of minutes to hours. It cannot run in
> the Linux dev session or on a free GitHub Windows runner (14 GB disk). See
> `docs/BUILD_INFRA.md` for where to run it. The steps below are the documented
> Mozilla build process wired to our tooling; they are **not yet executed** (no
> build host exists — blocker B1).

## Prerequisites (Windows build host)
- Windows 10/11 x64 with **~40 GB+** free on an SSD.
- [MozillaBuild](https://firefox-source-docs.mozilla.org/setup/windows_build.html)
  (provides the bash shell used for all commands).
- Visual Studio Build Tools (MSVC), Rust, clang — installed by `mach bootstrap`.
- A source/MozillaBuild path with **no spaces** or special characters.

## Steps
Run inside the MozillaBuild shell, from the repo root:

```bash
build/scripts/fetch-source.sh      # download + verify Firefox 153esr source
build/scripts/apply-patches.sh     # apply Cybrsoft prefs/autoconfig/branding/patches
build/scripts/build.sh             # mach bootstrap + mach build
build/scripts/package.sh           # mach package -> installer under engine/obj-*/dist/
```

Run it during development:
```bash
cd engine && ./mach run
```

## After building
- **Smoke test:** launches, browses, loads an extension, privacy defaults active.
- **Sign** the installer and update packages before any distribution
  (Authenticode — blocker B2).
- **Publish** updates as signed MAR via the update server (blocker B4).

## Verifying the privacy promise
Before release, run the network audit (ARCHITECTURE §6.2): packet-capture a
fresh profile at idle and during browsing and confirm **no** telemetry /
experiment / account / location endpoints are contacted and **no** unique id
leaves the device. Only the update endpoint (and optional filter-list mirror)
should appear.
