# Cybrsoft Browser — Design Tokens

**Source:** captured from the live Cobal site (`https://cobal.framer.ai/`) on
2026-11-18, cross-checked against the master spec. Cobal (a.k.a. CobalAI, formerly
CraftMindAI) is **made by Cybrsoft** — it is the reference for the Cybrsoft visual
identity. Values below are read from the site's actual CSS, not guessed.

> We use the Cobal **visual language** (palette, type, tone, gradient), not its web
> layout, and we do **not** reproduce the Cobal logo. Cybrsoft Browser gets its own
> wordmark/icon built in this system (Phase 3).

## Brand character
Clean, minimal, confident, friendly. Lots of white space, blue accents on light
surfaces, one signature blue→navy gradient for hero/emphasis. Plain-language,
approachable tone ("Ask like you'd ask a friend").

## Typography (confirmed)
| Role | Family | Notes |
|------|--------|-------|
| Headings | **Bricolage Grotesque** | `"Bricolage Grotesque", sans-serif` |
| Interface / body | **Inter** | `"Inter", sans-serif` |

## Color — light theme (verified from live CSS)
| Token | Hex | Role |
|-------|-----|------|
| `--cb-primary` | `#3B6FE0` | Primary blue — key actions, active states, links |
| `--cb-primary-deep` | `#1B3A8C` | Deep blue — gradient end, pressed/emphasis |
| `--cb-primary-bright` | `#6D9BFF` | Brighter blue — highlights, focus accents |
| `--cb-secondary` | `#E4ECFF` | Secondary blue — subtle fills, hovers |
| `--cb-tint-1` | `#EAF0FF` | Lightest blue tint — raised surfaces |
| `--cb-tint-2` | `#D5DFF5` | Light blue-gray — borders/dividers on light |
| `--cb-tint-3` | `#C7D6FF` | Periwinkle — chips, soft accents |
| `--cb-muted` | `#A5B4D8` | Muted blue-gray — secondary text/icons |
| `--cb-bg` | `#F3F6FF` | App background |
| `--cb-surface` | `#FFFFFF` | Cards / primary surfaces |
| `--cb-text` | `#4A5878` | Default text |

## Color — dark theme (verified navy family from live CSS — purpose-built, not inverted)
The Cobal site already ships a deliberate dark navy palette; we adopt it so the
dark theme is authentic rather than an inversion (spec §5).
| Token | Hex | Role |
|-------|-----|------|
| `--cb-bg` (dark) | `#0A1330` | Deepest background |
| `--cb-bg-alt` (dark) | `#0F1D4A` | Background alt / sections |
| `--cb-surface` (dark) | `#101C42` | Cards / surfaces |
| `--cb-surface-2` (dark) | `#0F275E` | Raised surfaces |
| `--cb-border` (dark) | `#14213D` | Borders/dividers |
| `--cb-accent` (dark) | `#22336B` | Subtle accents |
| `--cb-primary` (dark) | `#6D9BFF` | Primary (brightened for contrast on navy) |
| `--cb-text` (dark) | `#C7D6FF` / off-white | Text (never pure #FFF) |

Default theme follows the **Windows system theme**; manual override in settings.

## Signature gradient
```css
--cb-gradient: linear-gradient(135deg, #3B6FE0 0%, #1B3A8C 100%);
```
Use sparingly for hero/emphasis (new-tab header, onboarding, primary CTA).

## Shape / components
- Border-radius observed small/crisp in content (3–6px). Treat as a starting
  point; final button/card radii to be set in Phase 3 against the live
  components (hero CTAs may use a larger pill radius — verify visually).
- Keep contrast WCAG-compliant in both themes; verify every fg/bg pair.

## Notes for the browser (not from the marketing site)
Chrome density must suit a desktop browser (compact toolbar/tabs), so spacing is
tighter than the marketing page. The site informs *identity* (color, type, tone,
gradient), not chrome layout.
