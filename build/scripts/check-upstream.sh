#!/usr/bin/env bash
# Check whether a newer Firefox ESR than our pin has been released.
# Source of truth: Mozilla's machine-readable product-details feed.
#   https://product-details.mozilla.org/1.0/firefox_versions.json  -> "FIREFOX_ESR"
#
# Usage:
#   build/scripts/check-upstream.sh
# Testing (offline): point it at a local fixture instead of the network:
#   CB_VERSIONS_JSON=path/to/fixture.json build/scripts/check-upstream.sh
#
# Exit codes:
#   0  up to date (our pin >= latest ESR)
#   10 a NEWER ESR is available (prints old/new versions on stdout, machine-readable)
#   2  error (couldn't fetch or parse)
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

FEED_URL="https://product-details.mozilla.org/1.0/firefox_versions.json"

# Obtain the feed: local fixture (testing) or network (CI/real use).
json=""
if [ -n "${CB_VERSIONS_JSON:-}" ] && [ -f "${CB_VERSIONS_JSON}" ]; then
  json="$(cat "${CB_VERSIONS_JSON}")"
else
  require curl
  json="$(curl -fSL --retry 4 --retry-delay 3 "${FEED_URL}")" || die "could not fetch ${FEED_URL}"
fi

# Extract FIREFOX_ESR exactly (not FIREFOX_ESR_NEXT), e.g. "153.7.0esr".
raw="$(printf '%s' "${json}" | grep -oE '"FIREFOX_ESR":[[:space:]]*"[0-9][^"]*"' | head -1 \
       | sed -E 's/.*"([0-9][^"]*)".*/\1/')"
[ -n "${raw}" ] || die "could not parse FIREFOX_ESR from feed"
latest="${raw%esr}"            # strip trailing 'esr' -> 153.7.0
current="${CB_FIREFOX_VERSION}"

# Compare dotted versions with sort -V.
newest="$(printf '%s\n%s\n' "${current}" "${latest}" | sort -V | tail -1)"

if [ "${latest}" = "${current}" ] || { [ "${newest}" = "${current}" ] && [ "${latest}" != "${current}" ]; }; then
  ok "Up to date: pinned ${current}esr, latest ESR ${latest}esr"
  echo "status=uptodate current=${current} latest=${latest}"
  exit 0
fi

warn "NEW Firefox ESR available: ${latest}esr (we are on ${current}esr)"
echo "status=update current=${current} latest=${latest}"
exit 10
