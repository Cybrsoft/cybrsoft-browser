# Privacy profiles

Cybrsoft Browser ships three privacy profiles (ARCHITECTURE §6.3). **Strict is
the default.** Each profile is a concrete bundle of Gecko prefs plus a
content-blocker (uBlock Origin) configuration. The bundles live in
`prefs/profiles/`.

## At a glance
| Protection | Strict (default) | Balanced | Custom |
|-----------|------------------|----------|--------|
| ETP category | strict | strict | user |
| Reject 3rd-party trackers + partition (TCP) | ✅ | ✅ | user |
| Fingerprinting Protection (FPP) | ✅ | ✅ | user |
| resistFingerprinting (RFP, strong, breaks more) | ✅ | ❌ | user |
| Letterboxing | ✅ | ❌ | user |
| Referrer trimming | aggressive | moderate | user |
| Query-param stripping | ✅ | ✅ | user |
| HTTPS-only | ✅ | ✅ | user |
| DNS-over-HTTPS | ✅ | ✅ | user |
| WebRTC host-candidate blocking | ✅ | partial | user |
| uBlock Origin lists | aggressive set | default set | user |

## How switching works
Selecting a profile (in the first-run wizard or Settings → Privacy) applies that
bundle's prefs. Choosing **Custom** hands per-feature control to the user and the
browser stops managing them as a group. The out-of-box defaults in
`prefs/cybrsoft.js` already equal **Strict**, so a fresh install is Strict with
no action needed.

## Compatibility handling (never silently weaken)
- When a site breaks, the browser surfaces *which* protection is the likely
  cause and offers a **scoped, per-site exception** — it does **not** quietly
  disable protection globally (spec §8).
- RFP is the usual culprit for breakage (canvas, timing, locale, window size).
  Balanced exists precisely to drop RFP while keeping everything else.

## Why these specific prefs
- `cookieBehavior = 5` is Total Cookie Protection: reject known trackers and
  partition all third-party state by top-level site. High value, low breakage —
  kept in both Strict and Balanced.
- RFP vs FPP: FPP targets known fingerprinting scripts with lower breakage; RFP
  makes the browser look generic but breaks more. Strict uses both; Balanced
  uses FPP only.

## Status
Pref bundles are defined and reviewed. **Not yet validated against a running
build** (blocker B1) — exact breakage behavior per site is confirmed during
Phase 4/7 testing. The settings UI that applies them is in `pages/settings/`.
