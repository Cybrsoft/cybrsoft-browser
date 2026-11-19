#!/usr/bin/env bash
# Run the full build-independent test suite (what CI runs, runnable locally).
# Does NOT build Firefox — see docs/BUILD.md for that.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== shell syntax =="
for s in build/scripts/*.sh; do bash -n "$s"; done
echo "   ok"

echo "== fork-tooling self-test =="
bash build/scripts/selftest.sh >/dev/null && echo "   ok"

echo "== node module tests =="
for t in tools/backup/test.mjs src/*/test.mjs; do
  printf '   %-28s ' "$(basename "$(dirname "$t")")"
  node "$t" >/dev/null && echo "ok"
done

echo "== asset validation (JSON + HTML) =="
python3 tools/validate.py >/dev/null && echo "   ok"

echo
echo "ALL TESTS PASSED"
