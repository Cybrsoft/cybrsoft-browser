# Security rebase runbook (solo maintainer)

This is the **most important recurring task** in the project. Firefox ESR ships
security releases roughly every 4 weeks (plus occasional emergency releases).
Each one fixes real, often critical, vulnerabilities. Cybrsoft Browser must move
to the new release **promptly** or its users run a browser with known holes
(ARCHITECTURE §9). Everything below is designed to make that a short, mostly
automated chore.

## When
- Watch Mozilla's ESR releases: <https://www.mozilla.org/firefox/enterprise/>
  and the security advisories: <https://www.mozilla.org/security/advisories/>.
- Treat an ESR security release as **act within days**, an emergency
  (chemspill) release as **act now**.

## The happy path (most releases)
```bash
# 1. Test the new release against our patch set (safe, changes nothing):
build/scripts/rebase.sh 153.8.0

# 2. If the report says "0 conflicts":
sed -i 's/^CB_FIREFOX_VERSION=.*/CB_FIREFOX_VERSION="153.8.0"/' config/cybrsoft.conf
#    (also bump CB_FIREFOX_TAG)
build/scripts/fetch-source.sh --force
build/scripts/apply-patches.sh

# 3. Build + smoke-test on the Windows host, then:
git commit -am "rebase: Firefox 153.8.0esr (security)"
git tag cybrsoft-<our-version>
# 4. Build the signed installer, publish the update (signed MAR).
```
Because our delta is mostly prefs/config (not source patches), most ESR security
releases apply with **0 conflicts** — the bump is nearly mechanical.

## When there ARE conflicts
`rebase.sh` lists exactly which patches failed. For each:
1. Extract the new source, apply the clean patches, hand-fix the failing file.
2. Regenerate the patch: `cd engine && git diff <files> > ../patches/NNNN-*.patch`.
3. Re-run `build/scripts/rebase.sh <ver>` until it reports 0 conflicts.
Only the listed patches need attention — never the whole tree.

## Keep conflicts rare
- Minimize `patches/series`. Every source patch is a future conflict.
- Push customization into prefs/autoconfig/theme, which almost never conflict.
- Keep each patch small and localized.

## Major ESR jumps (≈yearly)
When the ESR line changes (e.g. 153 → next), expect more conflicts and API
changes (chrome internals move). Budget real time for these, re-test all real
extensions (Phase 5 list), and re-verify the privacy network audit (§6.2).

## Automation hook
The `rebase.sh` check is CI-friendly: a scheduled job can run it against the
latest ESR tarball and open an issue/notification when a new release needs
adopting, so nothing is missed. (Wire this up once build infra lands.)
