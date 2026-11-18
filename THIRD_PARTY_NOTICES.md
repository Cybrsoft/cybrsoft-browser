# Third-Party Notices

Cybrsoft Browser incorporates third-party open-source software. This file lists
the major components and their licenses. It is maintained as components are
added; the authoritative, complete set of upstream notices is produced from the
built tree at release time (`about:license` in the browser).

## Browser engine & platform
- **Mozilla Firefox / Gecko / SpiderMonkey** — the browser is a soft-fork of
  Firefox ESR. Licensed primarily under the **Mozilla Public License 2.0**
  (MPL-2.0), with some files under Apache-2.0, BSD, and other compatible
  licenses. See the upstream `about:license` for the full, authoritative list.
  Firefox is a trademark of the Mozilla Foundation; Cybrsoft Browser is **not**
  affiliated with or endorsed by Mozilla, and ships without Mozilla branding.

## Bundled extensions
- **uBlock Origin** — bundled, unmodified, as a separate add-on. Licensed
  **GPL-3.0-or-later**. Distributed under its own terms; not statically linked
  into the engine. See `extensions-bundled/README.md` for the pinned version and
  verification.

## Filter lists
- Content-blocking filter lists (e.g. EasyList and companions, as shipped/used
  by uBlock Origin) are distributed under their respective licenses (commonly
  CC BY-SA / GPL). Lists are fetched without user tracking; see ARCHITECTURE §6.

## Fonts
- **Inter** — SIL Open Font License 1.1.
- **Bricolage Grotesque** — SIL Open Font License 1.1.

## Cybrsoft-authored code
Everything under `build/`, `prefs/`, `autoconfig/`, `patches/`, `theme/`,
`pages/`, `branding/cybrsoft/`, and `docs/` is © Cybrsoft and licensed under
**MPL-2.0** (see `LICENSE`), unless a file states otherwise.

---
*This list is not yet exhaustive. A complete, generated THIRD_PARTY_NOTICES is a
release deliverable (Phase 8) produced from the actual build.*
