#!/usr/bin/env bash
# Apply the Cybrsoft patch queue + overlay files onto engine/.
#
# Usage: build/scripts/apply-patches.sh [--check]
#   --check   dry-run: report which patches apply cleanly, change nothing
#
# Order:
#   1. source patches from patches/series (via `git apply`)
#   2. copy pref overlays + autoconfig + branding into the tree
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

[ -d "${CB_ENGINE_ABS}/.git" ] || die "engine/ not initialized. Run fetch-source.sh first."

CHECK=0
[ "${1:-}" = "--check" ] && CHECK=1

clean=0; fail=0; failed_list=""
log "Applying patch queue (check=${CHECK})"
while IFS= read -r p; do
  [ -z "${p}" ] && continue
  patch_path="${CB_PATCHES_ABS}/${p}"
  [ -f "${patch_path}" ] || die "series lists missing patch: ${p}"
  if git -C "${CB_ENGINE_ABS}" apply --check "${patch_path}" 2>/dev/null; then
    if [ "${CHECK}" -eq 0 ]; then
      git -C "${CB_ENGINE_ABS}" apply "${patch_path}"
    fi
    clean=$((clean+1)); ok "clean: ${p}"
  else
    fail=$((fail+1)); failed_list="${failed_list} ${p}"; warn "CONFLICT: ${p}"
  fi
done <<EOF
$(read_series)
EOF

if [ "${CHECK}" -eq 0 ] && [ "${fail}" -eq 0 ]; then
  log "Copying overlay files (prefs, autoconfig, branding)"
  # Default prefs -> browser/app/profile/cybrsoft.js (sourced at startup)
  if [ -f "${CB_ROOT}/${CB_PREFS_DIR}/cybrsoft.js" ]; then
    cp "${CB_ROOT}/${CB_PREFS_DIR}/cybrsoft.js" \
       "${CB_ENGINE_ABS}/browser/app/profile/cybrsoft.js"
  fi
  # Autoconfig (locked prefs) -> shipped next to the binary
  if [ -d "${CB_ROOT}/${CB_AUTOCONFIG_DIR}" ]; then
    cp "${CB_ROOT}/${CB_AUTOCONFIG_DIR}/local-settings.js" \
       "${CB_ENGINE_ABS}/browser/app/profile/channel-prefs.d/" 2>/dev/null || true
  fi
  ok "overlays copied"
fi

echo "------------------------------------------------------------"
echo " patch queue: ${clean} clean, ${fail} conflicting"
[ -n "${failed_list}" ] && echo " conflicts:${failed_list}"
echo "------------------------------------------------------------"
[ "${fail}" -eq 0 ] || exit 2
