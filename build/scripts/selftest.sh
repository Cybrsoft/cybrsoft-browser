#!/usr/bin/env bash
# Self-test for the fork tooling's logic that CAN run without the Firefox source:
#   - config loads and derives the source URL
#   - series parsing ignores comments/blanks
#   - the patch-apply conflict detection (git apply --check) behaves correctly
#     on a known-good and a known-bad patch
#
# This does NOT build Firefox. It proves the plumbing that fetch/apply/rebase
# rely on. Runs anywhere with bash + git.
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

pass=0; fail=0
check() { if eval "$2"; then ok "$1"; pass=$((pass+1)); else warn "FAILED: $1"; fail=$((fail+1)); fi; }

log "1) config loads and derives source URL"
check "CB_FIREFOX_VERSION set"      '[ -n "${CB_FIREFOX_VERSION}" ]'
check "source URL ends in .tar.xz"  'case "${CB_SOURCE_URL}" in *.source.tar.xz) true;; *) false;; esac'

log "2) series parsing skips comments/blanks"
N="$(read_series | wc -l | tr -d " ")"
check "series currently lists 0 active patches" '[ "${N}" = "0" ]'

log "3) patch conflict detection on a synthetic tree"
SB="${CB_ROOT}/.cache/selftest"; rm -rf "${SB}"; mkdir -p "${SB}"
git -C "${SB}" init -q
printf 'line1\nline2\nline3\n' > "${SB}/file.txt"
git -C "${SB}" add -A
git -C "${SB}" -c user.name=t -c user.email=t@t commit -q -m base

# good patch: change line2 against the current content
printf 'line1\nCHANGED\nline3\n' > "${SB}/file.txt"
git -C "${SB}" diff > "${SB}/good.patch"
git -C "${SB}" checkout -q -- file.txt

# bad patch: expects content that doesn't exist -> must be reported as conflict
cat > "${SB}/bad.patch" <<'EOF'
diff --git a/file.txt b/file.txt
index 0000000..1111111 100644
--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 line1
-DOES_NOT_EXIST
+whatever
 line3
EOF

check "good patch applies clean"    'git -C "${SB}" apply --check "${SB}/good.patch" 2>/dev/null'
check "bad patch is detected as conflict" '! git -C "${SB}" apply --check "${SB}/bad.patch" 2>/dev/null'
rm -rf "${SB}"

echo "------------------------------------------------------------"
echo " selftest: ${pass} passed, ${fail} failed"
echo "------------------------------------------------------------"
[ "${fail}" -eq 0 ]
