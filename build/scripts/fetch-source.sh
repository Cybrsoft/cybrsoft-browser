#!/usr/bin/env bash
# Fetch and verify the pinned Firefox ESR source, then git-init it as the
# pristine baseline so patches can be applied and rebases diffed with git.
#
# Usage: build/scripts/fetch-source.sh [--force]
#   --force   re-extract even if engine/ already exists
#
# Produces: engine/  (the extracted Firefox source tree, GIT-IGNORED)
#           a single baseline commit tagged "upstream/<version>esr"
#
# NOTE: this downloads ~500 MB and extracts to a large tree. Not run in CI by
#       default. The actual mach build needs ~40 GB and Windows (see docs/BUILD.md).
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

require curl tar git xz

if [ -d "${CB_ENGINE_ABS}" ] && [ "${FORCE}" -eq 0 ]; then
  die "engine/ already exists. Use --force to re-extract, or rebase.sh to move versions."
fi
rm -rf "${CB_ENGINE_ABS}"
mkdir -p "${CB_ROOT}/.cache"

TARBALL="${CB_ROOT}/.cache/${CB_SOURCE_TARBALL}"
log "Downloading ${CB_SOURCE_TARBALL}"
log "  from ${CB_SOURCE_URL}"
curl -fSL --retry 4 --retry-delay 3 -o "${TARBALL}" "${CB_SOURCE_URL}" \
  || die "download failed: ${CB_SOURCE_URL}"

# Integrity: Mozilla publishes SHA256SUMS alongside releases. Verify when present.
SUMS_URL="${CB_SOURCE_BASEURL}/${CB_FIREFOX_VERSION}${CB_UPSTREAM_CHANNEL}/SHA256SUMS"
if curl -fSL --retry 3 -o "${CB_ROOT}/.cache/SHA256SUMS" "${SUMS_URL}" 2>/dev/null; then
  EXPECT="$(grep "source/${CB_SOURCE_TARBALL}\$" "${CB_ROOT}/.cache/SHA256SUMS" | awk '{print $1}' | head -1)"
  if [ -n "${EXPECT}" ]; then
    ACTUAL="$(sha256sum "${TARBALL}" | awk '{print $1}')"
    [ "${EXPECT}" = "${ACTUAL}" ] || die "SHA256 mismatch! expected ${EXPECT} got ${ACTUAL}"
    ok "SHA256 verified"
  else
    warn "no SHA256 entry for ${CB_SOURCE_TARBALL}; skipping checksum"
  fi
else
  warn "could not fetch SHA256SUMS; skipping checksum (verify manually for releases)"
fi

log "Extracting (this takes a while)"
mkdir -p "${CB_ENGINE_ABS}"
tar -xf "${TARBALL}" -C "${CB_ENGINE_ABS}" --strip-components=1

log "Initializing pristine baseline in engine/"
git -C "${CB_ENGINE_ABS}" init -q
git -C "${CB_ENGINE_ABS}" add -A
git -C "${CB_ENGINE_ABS}" -c user.name="${CB_VENDOR}" -c user.email="build@cybrsoft.invalid" \
    commit -q -m "pristine Firefox ${CB_FIREFOX_VERSION}esr"
git -C "${CB_ENGINE_ABS}" tag "upstream/${CB_FIREFOX_VERSION}esr"
ok "engine/ ready at Firefox ${CB_FIREFOX_VERSION}esr (baseline tagged)"
