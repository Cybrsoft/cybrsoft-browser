#!/usr/bin/env bash
# Package a built Cybrsoft Browser into a distributable Windows installer.
#
# Runs after build.sh on the Windows build host. Produces the NSIS installer
# stub and the full package under engine/obj-*/dist/. Code-signing (B2) is a
# separate release step applied to the produced binaries.
#
# Usage: build/scripts/package.sh
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

export MOZCONFIG="${CB_ROOT}/${CB_MOZCONFIG}"
cd "${CB_ENGINE_ABS}"

log "Packaging installer"
./mach package
./mach repackage installer || warn "installer repackage step may need NSIS config"
ok "package built under engine/obj-*/dist/ — sign before distribution (see docs, blocker B2)"
