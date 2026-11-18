#!/usr/bin/env bash
# Rebase the Cybrsoft patch set onto a NEW Firefox ESR release.
# This is the core of the solo-maintainer security treadmill: every time
# Mozilla ships an ESR security release, run this to move the fork forward
# and get a precise report of which patches still apply.
#
# Usage:
#   build/scripts/rebase.sh <new-version> [<new-git-tag>]
#   e.g.  build/scripts/rebase.sh 153.8.0
#
# What it does (SAFE — nothing is committed to this repo automatically):
#   1. Stages a temporary engine tree at the new version.
#   2. Dry-run applies every patch in the series onto it.
#   3. Prints a report: clean vs conflicting patches.
#   4. If ALL clean, offers to bump config/cybrsoft.conf to the new pin.
#   5. If any conflict, lists them so you fix those patches by hand.
#
# A security release with 0 conflicts = bump the pin, rebuild, ship.
# A release with conflicts = only the listed patches need human attention.
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

NEW_VER="${1:-}"
NEW_TAG="${2:-}"
[ -n "${NEW_VER}" ] || die "usage: rebase.sh <new-version> [<new-git-tag>]"

OLD_VER="${CB_FIREFOX_VERSION}"
log "Rebase: Firefox ${OLD_VER}esr  ->  ${NEW_VER}esr"
[ "${NEW_VER}" = "${OLD_VER}" ] && warn "new version equals current pin"

# Fetch the new source into a throwaway tree (does not touch engine/).
STAGE="${CB_ROOT}/.cache/rebase-${NEW_VER}"
TARBALL_NAME="firefox-${NEW_VER}${CB_UPSTREAM_CHANNEL}.source.tar.xz"
TARBALL_URL="${CB_SOURCE_BASEURL}/${NEW_VER}${CB_UPSTREAM_CHANNEL}/source/${TARBALL_NAME}"
TARBALL="${CB_ROOT}/.cache/${TARBALL_NAME}"

require curl tar git xz
mkdir -p "${CB_ROOT}/.cache"
if [ ! -f "${TARBALL}" ]; then
  log "Downloading ${TARBALL_NAME}"
  curl -fSL --retry 4 --retry-delay 3 -o "${TARBALL}" "${TARBALL_URL}" \
    || die "download failed: ${TARBALL_URL}"
fi
rm -rf "${STAGE}"; mkdir -p "${STAGE}"
log "Extracting new source to a staging tree"
tar -xf "${TARBALL}" -C "${STAGE}" --strip-components=1
git -C "${STAGE}" init -q
git -C "${STAGE}" add -A
git -C "${STAGE}" -c user.name="${CB_VENDOR}" -c user.email="build@cybrsoft.invalid" \
    commit -q -m "pristine Firefox ${NEW_VER}esr"

# Dry-run the whole queue.
clean=0; fail=0; failed_list=""
echo
log "Testing patch queue against ${NEW_VER}esr"
while IFS= read -r p; do
  [ -z "${p}" ] && continue
  if git -C "${STAGE}" apply --check "${CB_PATCHES_ABS}/${p}" 2>/dev/null; then
    clean=$((clean+1)); ok "clean: ${p}"
  else
    fail=$((fail+1)); failed_list="${failed_list}\n    - ${p}"; warn "CONFLICT: ${p}"
  fi
done <<EOF
$(read_series)
EOF

echo
echo "============================================================"
echo " REBASE REPORT  ${OLD_VER}esr -> ${NEW_VER}esr"
echo "   ${clean} patches apply cleanly"
echo "   ${fail} patches CONFLICT and need manual fixing"
[ "${fail}" -gt 0 ] && printf "   conflicting:%b\n" "${failed_list}"
echo "============================================================"

if [ "${fail}" -eq 0 ]; then
  ok "All patches clean. Safe to bump the pin."
  echo
  echo "To adopt ${NEW_VER}esr:"
  echo "  1. sed -i 's/^CB_FIREFOX_VERSION=.*/CB_FIREFOX_VERSION=\"${NEW_VER}\"/' config/cybrsoft.conf"
  [ -n "${NEW_TAG}" ] && echo "     (also update CB_FIREFOX_TAG to ${NEW_TAG})"
  echo "  2. build/scripts/fetch-source.sh --force"
  echo "  3. build/scripts/apply-patches.sh"
  echo "  4. build/scripts/build.sh && build/scripts/package.sh   # on the Windows build host"
  echo "  5. commit the config bump: 'rebase: Firefox ${NEW_VER}esr'"
else
  warn "Fix the conflicting patches, regenerate them, then re-run this script."
  echo "  Tip: extract the new source, apply the good patches, hand-fix the rest,"
  echo "       then 'git diff' to regenerate each conflicting .patch."
fi
rm -rf "${STAGE}"
exit $([ "${fail}" -eq 0 ] && echo 0 || echo 2)
