# Contributing to Cybrsoft Browser

Thanks for your interest. Cybrsoft Browser is a privacy-first, open-source
Windows browser built as a **soft-fork of Firefox ESR**. Please read
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) first — the architecture explains
why we fork, what we inherit, and what we build.

## Ground rules
- **No telemetry, no accounts, no cloud sync.** Any change that phones home,
  adds an identifier, or weakens a default privacy protection will be rejected.
  See the telemetry kill-list in `prefs/cybrsoft.js` and `autoconfig/cybrsoft.cfg`.
- **Minimal source patches.** Prefer, in order: prefs → locked prefs → theme /
  branding config → a source patch (last resort). Every patch in `patches/` is a
  recurring rebase cost. See [`docs/FORK_TOOLING.md`](docs/FORK_TOOLING.md).
- **No fabricated functionality or statistics.** If a feature is incomplete, say
  so in `docs/PROJECT_STATUS.md`. Never ship a decorative stand-in for a missing
  capability (see the privacy dashboard rules, ARCHITECTURE §6.4/§9).
- **Honesty about testing.** Don't claim tests passed unless they ran. Record
  real results in `PROJECT_STATUS.md`.

## Repository layout
| Path | What |
|------|------|
| `config/cybrsoft.conf` | Upstream pin + identity (single source of truth) |
| `build/scripts/` | Fork tooling: fetch, apply, rebase, build, package, selftest |
| `prefs/`, `autoconfig/` | Default + locked preferences |
| `patches/` | Minimal source patch queue |
| `branding/cybrsoft/` | Firefox branding (name, strings, icons) |
| `theme/cybrsoft/` | Chrome theme + design tokens + preview |
| `pages/` | Browser UI pages (new-tab, onboarding, settings) |
| `extensions-bundled/` | Pinned bundled add-ons (e.g. uBlock Origin) |
| `docs/` | Architecture, roadmap, runbooks, status |

## Dev workflow
1. Branch from `main` (`feature/...`, `phase3/...`).
2. Make the smallest change that works; prefer config over code.
3. Run what you can locally: `build/scripts/selftest.sh`, `bash -n` on scripts,
   open `pages/**/preview` or `theme/cybrsoft/preview.html` in a browser.
4. A full browser build needs Windows + ~40 GB (see `docs/BUILD.md`); CI will
   cover this once build infra exists.
5. Update `docs/PROJECT_STATUS.md` honestly. Open a PR against `main`.

## Commit messages
Imperative mood, explain the *why*. Note what was verified vs. not.

## License
By contributing you agree your contribution is licensed under **MPL 2.0** (see
`LICENSE`).
