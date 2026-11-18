# Cybrsoft Browser — Technical Architecture (Phase 1 Deliverable)

**Status:** Draft 0.1 — Phase 1 (Research & Architecture)
**Date:** 2026-11-18
**Audience:** Engineering, security, and project stakeholders
**Decision owner:** Lead architect

> This document is the gate for Phase 2. It exists to **prove that the chosen
> architecture can actually deliver the browser described in the master spec**
> before a single line of product UI is written. It is deliberately honest about
> limitations. Where a spec requirement is not achievable, or only partially
> achievable, this document says so.

---

## 0. TL;DR for decision-makers

- **Engine decision:** Cybrsoft Browser must be a **soft-fork of Firefox**
  (a maintained patch set on top of a pinned Firefox release, rebuilt with
  Mozilla's build system). This is not a preference — it is the **only**
  technically viable way to ship a Gecko-based desktop browser with **genuine
  Firefox WebExtension compatibility**. See §2.
- **What this buys us for free:** WebExtensions (uBlock Origin, Bitwarden,
  Proton Pass, Dark Reader…), Enhanced Tracking Protection, Total Cookie
  Protection, fingerprinting resistance, DNS-over-HTTPS, Reader mode, PDF.js,
  Picture-in-Picture, local/offline translation, the download manager, the
  update system, sandboxing, and the entire Gecko rendering/security stack.
  **A large fraction of the "built-in features" list already exists in Firefox.**
  Our work is overwhelmingly **branding, UI, configuration, and a privacy
  dashboard that surfaces real data** — not reimplementing a browser.
- **What is genuinely new engineering:** the Cybrsoft chrome (toolbar, tabs,
  new-tab page, settings, onboarding), the **interactive privacy dashboard**,
  workspaces, first-run search-engine choice, backup/export, the Cybrsoft
  update/signing pipeline, and the Windows installer.
- **The honest cost:** this is a **large, ongoing** program. Even the fork path
  is months of work to a credible 1.0.0, plus a **permanent maintenance
  treadmill** — every ~4 weeks a new Firefox release must be rebased and
  security-patched, or users are exposed. See §9 and `ROADMAP.md`.
- **Hard blockers to resolve before Phase 2:** build infrastructure (Windows
  build host/CI, ~40 GB+, long builds), code-signing certificate for the
  installer and update packages, and a decision on the fork's update server.
  See §11.

---

## 1. Requirements restated as architectural constraints

The master spec is translated into constraints the architecture must satisfy.
"Must" = release-blocking for 1.0.0; "Should" = targeted but negotiable.

| # | Constraint | Source | Satisfied by |
|---|-----------|--------|-------------|
| C1 | Gecko engine; **Chromium/Electron/CEF/WebView2 prohibited** | §3 | Firefox soft-fork (§2) |
| C2 | **Genuine** Firefox WebExtension compatibility | §10 | Inherited from Firefox (§5) |
| C3 | Windows desktop first; portable to other OSes later | §3 | Gecko is cross-platform; we gate non-Windows work |
| C4 | No telemetry, no analytics, no accounts, no cloud sync | §8 | Strip Mozilla telemetry/services via patches (§6) |
| C5 | Local-first storage; export/import; optional encrypted backup | §14 | Profile dir + Cybrsoft backup module (§7) |
| C6 | Privacy protection: ad/tracker/cookie/fingerprint/cookie-popups | §8 | Firefox ETP/TCP/RFP + bundled uBlock Origin + filter lists (§6) |
| C7 | **Real** interactive privacy dashboard (no fake stats) | §9 | Reads live data from protection subsystems (§6.4) |
| C8 | Privacy profiles: Strict / Balanced / Custom (Strict default) | §8 | Preference bundles mapped to Gecko prefs (§6.3) |
| C9 | Multiple isolated profiles | §13 | Firefox profile system, exposed in UI (§7) |
| C10 | Built-in features (reader, PDF, PiP, translation, downloads…) | §12 | Mostly inherited from Firefox; UI/branding work (§5) |
| C11 | Horizontal **and** vertical tabs; tab groups; workspaces | §6 | Firefox native tab groups + vertical tabs + our workspace layer (§5.3) |
| C12 | Cybrsoft visual identity (Cobal design system) | §5 | Custom chrome theme + new-tab + settings (§5) |
| C13 | Secure, signed auto-updates; verify integrity | §15 | Signed MAR + update server (§8) |
| C14 | Fully open source; license-compliant | §18 | MPL 2.0 base; see §10 |
| C15 | No built-in password manager | §11 | Deliberately omitted; rely on extensions |

**Conflict-resolution order (from spec §22):** Security → Privacy → Engine
reliability → Correctness → Performance → UX → Extra features. This ordering is
used throughout to break ties.

---

## 2. Engine decision: why a Firefox soft-fork, and nothing else

### 2.1 The options evaluated

The spec requires Gecko and prohibits Chromium. Three Gecko paths exist in
principle:

**Option A — Embed Gecko as a library (like CEF for Chromium).**
**Verdict: not possible.** There is no supported desktop Gecko embedding API.
- GeckoView, Mozilla's reusable engine library, is **Android-only**.
- Positron, the last serious desktop-embedding/XUL-runtime effort, was
  **discontinued in 2017** and never shipped.
- Mozilla community requests for a "CEF for Gecko" remain open and unanswered;
  the only forward-looking pointer is to Servo, which is **not** a Firefox-grade
  engine and has **no WebExtension support**.
- **Consequence:** you cannot drop Gecko into a C#/Rust/Qt desktop shell the way
  you can drop in Chromium via CEF/WebView2. This kills the "write our own native
  shell and embed the engine" design entirely.

**Option B — Fork the full Firefox browser (soft-fork).**
**Verdict: chosen.** Maintain a patch set over a pinned Firefox release and
rebuild with Mozilla's build system. This is exactly how **LibreWolf, Floorp,
Zen, Mullvad Browser, and Waterfox** are built. It is the proven path.

**Option C — Hard-fork (take the code and diverge permanently).**
**Verdict: rejected.** A hard fork means owning the entire security burden of a
browser engine (Gecko is millions of lines of C++/Rust with a constant stream of
CVEs). No small team can keep that safe. This directly violates constraint
ordering (Security first). Rejected.

### 2.2 Why the fork path is not a compromise but an advantage

The decisive factor is **C2 (genuine WebExtension compatibility)**. Firefox's
extension engine is deeply integrated into Gecko. A fork **inherits it
completely** — uBlock Origin, Bitwarden, Proton Pass, Dark Reader, SponsorBlock,
and Privacy Badger run **because the browser *is* Firefox underneath**. Any
non-fork approach would have to reimplement the WebExtensions runtime, which is
not realistic and would fail C2.

Secondary inherited capabilities (each of which would otherwise be a project on
its own): Enhanced Tracking Protection, Total Cookie Protection (state
partitioning), `privacy.resistFingerprinting` + FPP (fingerprinting protection),
DNS-over-HTTPS, HTTPS-only mode, the Gecko security sandbox, Reader mode,
`pdf.js`, Picture-in-Picture, **local/offline translation** (Bergamot —
privacy-friendly, runs on-device), the download manager, SmartBlock, and the
signed-update mechanism (MAR).

### 2.3 Soft-fork mechanics

The fork is expressed as:

```
pinned upstream Firefox release  (e.g. firefox-140.x ESR or latest stable)
        │
        ├── patches/                      # Cybrsoft source patches (chrome, prefs, branding removal)
        ├── branding/                     # Cybrsoft name, icons, strings
        ├── configs/                      # mozconfig(s), build flags
        ├── extensions-bundled/           # uBlock Origin (pinned, verified)
        └── build-tooling/                # fetch upstream → apply patches → build → package
```

- **Build tooling:** adopt a Gluon/Surfer-style toolchain (the family used by
  Pulse/Dot → Zen). It automates: download the pinned Firefox source, import the
  patch queue, apply branding, build, and package. We will **vendor and pin**
  the tool (or maintain a thin in-house equivalent) rather than depend on an
  unmaintained upstream. ADR-0002.
- **Rebase cadence:** track the chosen channel. **Decision needed (§11):** track
  **Firefox ESR** (rebase roughly every 4 weeks for security, major rebase
  ~yearly — *recommended for a small team*) vs **Firefox stable/rapid** (rebase
  every ~4 weeks including feature churn — more work, newer features). The
  constraint ordering (Security) favors **ESR** with disciplined security
  backports. This is the single most important sustainability decision.
- **Patch discipline:** keep patches **minimal and surgical**. Every patch is a
  future rebase cost and a potential security regression. Prefer configuration
  (prefs, policies, `userChrome`/built-in CSS) over C++ changes wherever
  possible. "Theme and configure, don't modify" is the default.

---

## 3. Technology selection

Because we fork Firefox, the primary technology stack is **dictated by Gecko**,
not freely chosen. This is a feature (consistency, upstream support), not a
limitation.

| Layer | Technology | Rationale |
|------|-----------|-----------|
| Rendering/JS engine | **Gecko + SpiderMonkey** (C++/Rust) | Required; inherited |
| Browser chrome (our UI) | **HTML + CSS + JS** (Firefox's modern frontend), limited remaining XUL, Web Components / `MozXULElement` | This is where Cybrsoft UI lives; no new framework needed or wanted |
| Build system | **Mozilla `mach`** + MozillaBuild (Windows), clang, Rust, Python | Required by Gecko |
| Fork orchestration | **Gluon/Surfer-style** Node tool (vendored) | Proven for FF forks; ADR-0002 |
| Privacy dashboard logic | **Privileged frontend JS** reading `webRequest`, ETP APIs, content-blocking log | Runs in chrome context; real data |
| Bundled content blocker | **uBlock Origin** (WebExtension, pinned) | Best-in-class; MPL/GPL compatible; avoids us writing a blocking engine |
| Installer | **Firefox packaging** → signed **NSIS** stub (Windows), optional MSIX later | Matches upstream; well-trodden |
| Update server | **Balrog-compatible AUS** or minimal static MAR server | Signed updates; no telemetry |
| Local backup/export | In-house **JS module** (profile serialization + optional encryption) | Local-first; new work |

**Deliberately *not* used:** Electron, CEF, WebView2, Chromium, Qt/C# native
shells embedding an engine (impossible per §2), and any new heavyweight UI
framework (React/Flutter/etc.) for the chrome — the chrome is Firefox's own
HTML/JS environment and adding a framework would fight it.

**Languages a contributor needs:** mostly **JavaScript/CSS** (chrome, dashboard,
new-tab, settings), some **Python** (build/packaging), and **C++/Rust only** for
the small number of deep patches. This keeps the contributor barrier far lower
than "a browser from scratch" would imply.

---

## 4. High-level architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Cybrsoft Browser (Windows)                      │
│                                                                       │
│  ┌──────────────── Cybrsoft Chrome (HTML/CSS/JS, our code) ────────┐ │
│  │  Toolbar · Tabs (horiz/vert) · Workspaces · New-tab page ·      │ │
│  │  Settings · First-run wizard · Privacy dashboard · Backup UI    │ │
│  └───────────────┬─────────────────────────────────┬──────────────┘ │
│                  │ chrome privileged JS APIs         │                 │
│  ┌───────────────▼─────────────┐   ┌────────────────▼──────────────┐ │
│  │  Firefox platform services   │   │  WebExtensions runtime         │ │
│  │  (inherited, config'd by us) │   │  (inherited)                   │ │
│  │  · ETP / Total Cookie Prot.  │   │  · uBlock Origin (bundled)     │ │
│  │  · resistFingerprinting/FPP  │   │  · user-installed extensions   │ │
│  │  · DoH / HTTPS-only          │   │    (Bitwarden, Proton Pass…)   │ │
│  │  · Reader / pdf.js / PiP     │   └────────────────────────────────┘ │
│  │  · Translation (Bergamot)    │                                      │
│  │  · Download manager          │   ┌────────────────────────────────┐ │
│  │  · Update (signed MAR)       │   │  Profile store (local-first)    │ │
│  └───────────────┬─────────────┘   │  history, cookies, bookmarks,   │ │
│                  │                   │  prefs, extensions, sessions    │ │
│  ┌───────────────▼─────────────────────────────┐ └──────────────────┘ │
│  │           Gecko + SpiderMonkey engine         │                      │
│  │   (multiprocess, sandboxed content procs)     │                      │
│  └───────────────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
        │                                   │
        ▼                                   ▼
  Cybrsoft update server            Filter-list endpoints (uBO lists)
  (signed MAR, no tracking)         (no user identifiers sent)
```

Key property: **the only network endpoints Cybrsoft operates** are the update
server and (optionally) a filter-list mirror. Neither receives browsing data or
unique identifiers (C4). All other Mozilla-operated endpoints (telemetry,
Pocket, accounts, Nimbus/experiments, location, Normandy) are **disabled and/or
patched out** (§6.2).

---

## 5. UI / frontend architecture (the bulk of new work)

The Cybrsoft UI is built **inside Firefox's chrome**, which today is largely
standard HTML/CSS/JS (`browser.xhtml`, `browser/components/*`, `toolkit`), with
some remaining XUL elements and `MozXULElement`/custom-element patterns.

### 5.1 Branding & theme
- Replace Mozilla branding with Cybrsoft branding via the `browser/branding`
  mechanism (name, icons, about pages). **We will not fabricate a Mozilla or
  Firefox mark; we will not ship their trademarks.** Trademark removal is a
  **requirement** of redistributing a fork (§10).
- Implement the **Cybrsoft design system** (Cobal) as chrome CSS variables.
  Design tokens from the spec are captured in `docs/DESIGN_TOKENS.md`
  (primary `#3B6FE0`, secondary `#E4ECFF`, bg `#F3F6FF`, text `#4A5878`; Inter +
  Bricolage Grotesque). Dark mode is a **purpose-built palette**, not an
  inversion, following the Windows theme by default with a manual override.
  > **Open item:** the live Cobal site (`cobal.framer.ai`) could not be fetched
  > from this environment (host not in the session allowlist). Branding work in
  > Phase 3 must start by capturing the real site's identity; the tokens above
  > are the agreed starting point in the meantime.

### 5.2 Toolbar & navigation
Back/forward/reload/address-bar/search/bookmarks/extensions/downloads/privacy/
menu — most already exist in Firefox's customizable toolbar. Work is
**restyling + adding the privacy control** and making the layout match Cobal.

### 5.3 Tabs, groups, workspaces
- **Horizontal tabs:** native.
- **Vertical tabs:** **native in modern Firefox** — enable and restyle rather
  than build from scratch.
- **Tab groups:** **native in modern Firefox** — real functionality, inherited.
- **Workspaces:** the one genuinely new tab concept. Implemented as a chrome-JS
  layer over profiles/containers + tab-group state, persisted in the profile.
  Must be **real state**, not labels (C11). This is net-new engineering and a
  known risk item.

### 5.4 New-tab page, settings, onboarding, error pages
Custom privileged pages (`about:cybrsoft-*` or built-in resources). New-tab:
minimal by default (search + optional shortcuts), everything else opt-in.
First-run wizard: **search-engine choice (no imposed default)**, privacy profile,
theme, tab layout. All net-new UI, but standard web tech.

---

## 6. Privacy & security subsystem (the defining feature)

### 6.1 Strategy
Privacy is delivered by **(a)** Firefox's mature built-ins, configured
aggressively, **(b)** a **bundled uBlock Origin** for ad/tracker/cosmetic/cookie-
popup blocking, and **(c)** a Cybrsoft dashboard/UX layer that exposes and
controls it. We **do not** write our own network-blocking engine — that would be
inferior to uBO and a security liability.

### 6.2 Telemetry / phone-home removal (C4) — enforced, not toggled
Patched and/or locked via prefs & policies: Telemetry, Health Report, Normandy,
Nimbus/experiments, Pocket, Firefox Accounts & Sync, location services,
Safe-Browsing *remote* lookups (retain **local** malware/phishing list
protection, see §6.5), crash-ping auto-submit, default-browser agent, and
sponsored new-tab content. Network allowlist for the shipped build is audited in
Phase 7 (packet-level) to **prove** no browsing data leaves the device.

### 6.3 Privacy profiles (C8)
Three named bundles mapping to concrete Gecko prefs + uBO config:
- **Strict (default):** ETP strict, `resistFingerprinting`/FPP on, strict
  third-party cookie partitioning, aggressive uBO lists, DoH on, HTTPS-only on.
  **Compatibility breakage is surfaced, never silently disabled** — if a site
  breaks, the browser detects likely causes and offers a scoped exception.
- **Balanced:** strong but more compatible (ETP standard+, lighter FPP).
- **Custom:** per-feature control.

### 6.4 Privacy dashboard (C7) — real data only
The dashboard reads **live** data from:
- the content-blocking event log / ETP (`nsIWebProgress`, content-blocking
  flags) → blocked trackers/cookies per site;
- uBlock Origin's own logger/stats (via its API surface) → blocked ads/requests;
- the permissions manager → site permissions;
- the cookie/storage manager → cookie activity.

**No simulated or fabricated numbers, ever (spec §9).** If a data point is not
reliably obtainable, the dashboard **says "not available"** rather than inventing
one. Two surfaces: a lightweight toolbar panel + a full `about:` dashboard.

### 6.5 Security (C13, §15)
- **Malicious-site protection:** retain Firefox's local Safe-Browsing list
  matching; evaluate privacy-preserving list updates. Document honestly that this
  is list-based and not absolute.
- **Sandboxing:** inherited Gecko multiprocess sandbox — do **not** weaken it.
- **Signed updates:** MAR packages verified by embedded Cybrsoft public key;
  never execute unverified packages (§8).
- **No invented guarantees:** every security feature ships with documented
  limitations (spec §15).

---

## 7. Profiles, local data, backup/export

- **Profiles (C9):** Firefox's profile system provides full isolation (history,
  cookies, bookmarks, extensions, prefs, sessions). We expose create/rename/
  delete in Cybrsoft UI. Isolation is **inherited and verified**, not built.
- **Local-first (C5):** all data stays in the profile dir. No accounts, no cloud.
- **Export/import & encrypted backup:** new in-house JS module.
  - *Everyday export:* bookmarks/settings subset.
  - *Full backup:* settings, bookmarks, tab groups, workspaces, profile config,
    extension config — serialized, with **optional local encryption** and a clear
    **warning about sensitive contents**.
  - Password-manager data stays with the external manager (C15); never imported
    into a non-existent Cybrsoft store.
- **Import:** from Firefox and other browsers where Gecko's migrators allow.

---

## 8. Update & distribution

- **Installer:** Windows signed NSIS stub (Firefox's packaging produces this);
  MSIX considered later.
- **Updates:** signed **MAR** over a Cybrsoft-operated **Balrog-compatible** or
  minimal static update server. On by default; user-configurable; security
  updates prioritized. Update checks carry **no browsing data and no unique
  tracking ID** (C4/§15). Integrity/authenticity verified cryptographically
  before apply.
- **Code signing:** an **Authenticode certificate is required** for a
  trustworthy Windows installer and for updates. This is a **procurement blocker**
  (§11).

---

## 9. The honest cost & maintenance model

This is the section most "build a browser" plans omit.

- **Forking is not free maintenance.** A new Firefox version ships roughly every
  **4 weeks**, each with security fixes. Cybrsoft Browser must **rebase and
  rebuild within days** of each upstream security release or its users are
  knowingly exposed. This is a **permanent, non-negotiable treadmill** for as
  long as the product exists.
- **Build cost:** full builds need **~40 GB+ disk**, 8 GB+ RAM (more realistically
  16–32 GB), and take **tens of minutes to hours**. Practical development requires
  a dedicated Windows build machine or CI with caching (sccache).
- **Team reality:** the spec's scope (privacy stack + dashboard + workspaces +
  backups + updates + QA across Windows) is a **multi-person, multi-month**
  effort to a credible 1.0.0, then ongoing. A solo effort is possible for a
  usable build but will struggle with the security-rebase cadence.
- **This document does not promise 1.0.0 by a date.** 1.0.0 ships only when the
  release criteria (spec §23, tracked in `PROJECT_STATUS.md`) are genuinely met.

---

## 10. Licensing & open-source compliance

- **Base license:** Firefox/Gecko is **MPL 2.0** (with some components under
  other compatible licenses). The Cybrsoft fork and our additions ship
  **MPL 2.0** to stay compatible; full third-party license notices are mandatory.
- **Trademarks:** Mozilla's trademark policy means a redistributable fork **must
  remove Mozilla/Firefox branding**. Cybrsoft branding replaces it. We must not
  imply Mozilla endorsement.
- **Bundled uBlock Origin:** GPLv3 — distributed as a separate, unmodified,
  clearly-attributed add-on (not statically linked into Gecko), which keeps
  license boundaries clean. Verify at packaging time.
- **Deliverables (spec §18):** LICENSE, THIRD_PARTY_NOTICES, dependency docs,
  build instructions, CONTRIBUTING, SECURITY.md, dev docs. Tracked in roadmap.

---

## 11. Open decisions & blockers

**Decisions made 2026-11-18** (owner input):

| ID | Item | Decision |
|----|------|----------|
| B3 | Upstream channel: ESR vs stable | **Firefox ESR** — security-first, lower rebase cadence |
| B6 | Who owns the security-rebase treadmill | **Solo (owner)** → rebase **automation is a first-class design goal** |
| B5 | Cobal brand capture | **Allowlist `cobal.framer.ai`** and extract identity from the live site (pending owner enabling the host) |
| B7 | Code hosting | **Public GitHub** under a Cybrsoft org (owner creates repo; we push) |

**Still open:**

| ID | Item | Why it blocks | When needed | Recommendation |
|----|------|---------------|-------------|----------------|
| B1 | **Build infrastructure** (Windows host/CI, 40 GB+, caching) | Can't produce/test the Windows build | Before first compile (early Phase 2) | Deferred by owner; architect to present options (cloud CI vs own machine) with cost/effort |
| B2 | **Authenticode code-signing cert** | Unsigned installer/updates untrustworthy on Windows | Before any public release (Phase 8) | Procure an OV/EV cert (org identity needed) |
| B4 | **Update server** (Balrog vs static MAR) | Needed for auto-updates | Before release (Phase 7/8) | Start with a minimal signed-MAR static server |

---

## 12. Risk register (top items)

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Security-rebase treadmill not sustained | Users exposed to known CVEs | High if under-resourced | Pin ESR, automate rebase, small patch set |
| Patch set rots across upstream changes | Rising maintenance cost | Medium | Keep patches minimal; prefer prefs/CSS over C++ |
| Privacy dashboard can't get real per-item data for everything | Feature gaps | Medium | Show "not available" honestly; never fabricate (§6.4) |
| Workspaces complexity | Schedule slip | Medium | Build on native tab groups/containers; descope if needed |
| Code-signing / trademark / license missteps | Legal/distribution block | Medium | Resolve in Phase 1–2; legal review of §10 |
| Windows-build fragility (paths, toolchain) | Dev friction | Medium | Documented reproducible build + CI |

---

## 13. Phase gate

**Phase 2 may begin when:** B1 (build infra) and B3 (channel) are resolved, a
reproducible local Firefox build succeeds on the target Windows toolchain, and
ADR-0001/0002 are accepted. B2/B4 are required before any public release, not
before Phase 2 coding.

See `ROADMAP.md` for the phased plan and `PROJECT_STATUS.md` for the living
record of what is done, in progress, and not started.

---

## Appendix A — sources consulted (Phase 1 research)

- No desktop Gecko embedding API; GeckoView is Android-only:
  <https://mozilla.github.io/geckoview/javadoc/mozilla-central/index.html>,
  <https://wiki.mozilla.org/Mobile/GeckoView>,
  <https://connect.mozilla.org/t5/ideas/ability-to-embed-gecko-as-an-alternative-to-chromium-embedding/idi-p/186>
- Positron discontinued (2017), no revival:
  <https://mykzilla.org/2017/03/08/positron-discontinued/>
- Firefox fork landscape (LibreWolf/Floorp/Zen/Mullvad depend on upstream):
  <https://lwn.net/Articles/1012453/>
- Building Firefox on Windows (toolchain, ~40 GB, build time):
  <https://firefox-source-docs.mozilla.org/setup/windows_build.html>
- Fork build tooling (Surfer/Gluon lineage):
  <https://www.github.com/pulse-browser/gluon>,
  <https://npmjs.com/package/@zen-browser/surfer>,
  <https://docs.zen-browser.app/contribute/desktop/building>
