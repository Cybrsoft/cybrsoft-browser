#!/usr/bin/env bash
# Build Cybrsoft Browser from the patched engine/ tree.
#
# MUST run on the Windows build host (or a Windows CI runner) inside the
# MozillaBuild shell. Needs ~40 GB free disk and the full toolchain
# (MSVC, Rust, clang) — see docs/BUILD.md. NOT runnable in this Linux session.
#
# Usage: build/scripts/build.sh
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

[ -d "${CB_ENGINE_ABS}" ] || die "engine/ missing. Run fetch-source.sh then apply-patches.sh."

# Point mach at our mozconfig (branding, release opts, telemetry disabled).
export MOZCONFIG="${CB_ROOT}/${CB_MOZCONFIG}"
log "Using MOZCONFIG=${MOZCONFIG}"

cd "${CB_ENGINE_ABS}"
if [ ! -f mach ]; then die "no mach in engine/ — is the source extracted correctly?"; fi

log "Bootstrapping build prerequisites (first run only)"
./mach --no-interactive bootstrap --application-choice=browser || \
  warn "bootstrap reported issues; continuing if toolchain already present"

log "Building (this takes tens of minutes to hours)"
./mach build
ok "build complete — try it with: (cd engine && ./mach run)"
