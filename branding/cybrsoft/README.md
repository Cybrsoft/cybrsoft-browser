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
| `configure.sh` | Sets `MOZ_APP_DISPLAYNAME="Cybrsoft Browser"`, vendor, ids | ✅ done |
| `pref/firefox-branding.js` | Branding-scoped prefs (update URL, homepage) | ✅ done |
| `locales/en-US/brand.ftl` | "Cybrsoft Browser" / "Cybrsoft" strings + trademark note | ✅ done |
| `branding.nsi` | Windows installer branding strings | TODO |
| `default16/32/48/64/128.png`, `firefox.ico`, `document.ico` | App + document icons (Cobal identity) | TODO — **needs brand assets** |
| `content/about-logo*.png`, wordmark | About page / wordmark | TODO — needs brand assets |
| `VisualElements_*.png` + manifest | Windows tile assets | TODO |

> **Icons are intentionally not invented.** Per the spec, we do not fabricate an
> official logo. The chrome theme and a text/placeholder mark carry the identity
> until real Cybrsoft Browser icon assets are provided. A rendered identity
> preview (colors, type, mock chrome) is at `theme/cybrsoft/preview.html`.

## Trademark note
Mozilla's trademark policy **requires** removing Firefox/Mozilla branding in a
redistributed build. Every asset here must be Cybrsoft's own; none may reuse a
Mozilla mark. We also must not imply Mozilla endorsement. See
`docs/ARCHITECTURE.md §10`.

## Design source
Colors, type, gradient, and tone are defined in `docs/DESIGN_TOKENS.md`
(captured from the live Cobal identity). Icons are net-new Cybrsoft Browser
assets built in that system — we do **not** reproduce the Cobal product logo.
