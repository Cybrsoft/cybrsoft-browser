# Bundled extensions

Cybrsoft Browser ships a small set of WebExtensions preinstalled. We **bundle,
do not reimplement** — the content blocker is uBlock Origin, the best-in-class
tool, rather than a home-grown blocking engine (ARCHITECTURE §6.1).

## uBlock Origin
- **Role:** ad/tracker/cosmetic/cookie-popup blocking; its logger feeds the
  real-data privacy dashboard (ARCHITECTURE §6.4).
- **License:** GPL-3.0-or-later. Bundled **unmodified** as a separate `.xpi`,
  not statically linked — keeps license boundaries clean (see
  `THIRD_PARTY_NOTICES.md`).
- **Pinning & verification:** a specific signed release is pinned by version and
  SHA-256. The `.xpi` is **not committed** to this repo (binary); it is fetched
  and checksum-verified at package time. Record the pin here:

  | Field | Value |
  |-------|-------|
  | Version | _TBD — pin a specific release_ |
  | Source | AMO (addons.mozilla.org) signed release |
  | SHA-256 | _TBD_ |

- **Default lists per privacy profile:** see `docs/PRIVACY_PROFILES.md`
  (aggressive set for Strict, default set for Balanced, user-controlled for
  Custom).
- **Filter-list updates:** fetched on uBO's normal schedule from the lists'
  own endpoints. No Cybrsoft identifier is attached; updates carry no user
  tracking (ARCHITECTURE §6).

## Not bundled (by design)
- **Password managers** — none bundled; users bring Bitwarden / Proton Pass via
  the extension system (spec §11). We never create a Cybrsoft password store.

## Packaging
`build/scripts/apply-patches.sh` / the build will place verified bundled `.xpi`
files into the distribution's `browser/extensions/` (or the equivalent
preinstalled-extensions location) so they are present on first run. Wiring this
into the build is a Phase 5 task (needs the engine tree + build host, B1).

## Status
Plan and license boundaries defined. Actual bundling + the uBO pin/verification
land in Phase 5 against a real build.
