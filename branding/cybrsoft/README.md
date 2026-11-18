# Cybrsoft branding

This directory is fed to the Firefox build via
`--with-branding=browser/branding/cybrsoft` (see `build/mozconfig.windows`).
`apply-patches.sh` copies it into the engine tree at
`browser/branding/cybrsoft/` before building.

Firefox's branding mechanism expects a specific set of files. We mirror the
layout of upstream's `browser/branding/unofficial` and replace the assets.

## Required contents (to be produced in Phase 3)
| File | Purpose | Status |
|------|---------|--------|
| `configure.sh` | Sets `MOZ_APP_DISPLAYNAME="Cybrsoft Browser"`, vendor, ids | TODO |
| `branding.nsi` | Windows installer branding strings | TODO |
| `pref/firefox-branding.js` | Branding-scoped prefs (update URL, homepage) | TODO |
| `locales/en-US/brand.ftl` + `brand.dtd` / `brand.properties` | "Cybrsoft Browser" / "Cybrsoft" strings used across the UI | TODO |
| `default16/32/48/64/128.png`, `firefox.ico`, `document.ico` | App + document icons (Cobal identity) | TODO (needs brand assets) |
| `content/about-logo*.png`, `content/firefox-wordmark.svg` | About page / wordmark | TODO |
| `VisualElements_*.png` + manifest | Windows tile assets | TODO |

## Trademark note
Mozilla's trademark policy **requires** removing Firefox/Mozilla branding in a
redistributed build. Every asset here must be Cybrsoft's own; none may reuse a
Mozilla mark. We also must not imply Mozilla endorsement. See
`docs/ARCHITECTURE.md §10`.

## Design source
Colors, type, gradient, and tone are defined in `docs/DESIGN_TOKENS.md`
(captured from the live Cobal identity). Icons are net-new Cybrsoft Browser
assets built in that system — we do **not** reproduce the Cobal product logo.
