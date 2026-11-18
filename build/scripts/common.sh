#!/usr/bin/env bash
# Shared helpers for Cybrsoft Browser build/rebase scripts.
# Works in Linux bash and in the MozillaBuild (Windows) bash shell.
set -euo pipefail

# Resolve repo root regardless of where a script is invoked from.
CB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CB_ROOT="$(cd "${CB_SCRIPT_DIR}/../.." && pwd)"

# Load config.
# shellcheck source=/dev/null
. "${CB_ROOT}/config/cybrsoft.conf"

# Absolute paths.
CB_ENGINE_ABS="${CB_ROOT}/${CB_ENGINE_DIR}"
CB_PATCHES_ABS="${CB_ROOT}/${CB_PATCHES_DIR}"
CB_SERIES_ABS="${CB_ROOT}/${CB_PATCHES_SERIES}"

log()  { printf '\033[0;34m[cybrsoft]\033[0m %s\n' "$*" >&2; }
ok()   { printf '\033[0;32m[ ok ]\033[0m %s\n' "$*" >&2; }
warn() { printf '\033[0;33m[warn]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[0;31m[fail]\033[0m %s\n' "$*" >&2; exit 1; }

require() {
  for c in "$@"; do
    command -v "$c" >/dev/null 2>&1 || die "required tool not found: $c"
  done
}

# Ordered, comment-stripped list of patch filenames from the series file.
read_series() {
  [ -f "${CB_SERIES_ABS}" ] || die "missing series file: ${CB_SERIES_ABS}"
  grep -vE '^\s*(#|$)' "${CB_SERIES_ABS}" || true
}
