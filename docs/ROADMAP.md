# Cybrsoft Browser — Implementation Roadmap

Phased plan aligned to the master spec (§19). Each phase ends with a working,
non-broken state and tested deliverables. Effort estimates are **order-of-
magnitude for a small team** and assume the engine decision in `ARCHITECTURE.md`.

> Rule: **nothing is marked "done" without executed tests** (spec §20). Status is
> tracked in `PROJECT_STATUS.md`, not here.

---

## Phase 1 — Research & architecture  *(this phase)*
**Goal:** prove the architecture before building UI.
- [x] Evaluate Gecko integration approaches → **soft-fork of Firefox** (ADR-0001)
- [x] Select technology stack (dictated by Gecko; §3)
- [x] Confirm WebExtension compatibility strategy (inherited; §5/§10)
- [x] Identify limitations, risks, blockers (§9, §11, §12)
- [x] Architecture document + ADRs + roadmap + status tracker
- [ ] **Stakeholder decisions:** B1–B6 (`ARCHITECTURE.md §11`)
**Exit:** architecture accepted; build infra + channel decided.

## Phase 2 — Browser foundation
**Goal:** a genuinely working, buildable Cybrsoft-named Firefox fork.
- [ ] Stand up fork tooling (fetch upstream → apply patches → build) — ADR-0002
- [ ] Reproducible **Windows build** of pinned upstream (green CI)
- [ ] Minimal branding swap (name/icons/about) + trademark removal
- [ ] Strip/lock telemetry & Mozilla services (§6.2) — first pass
- [ ] Verify core browsing, address bar, tabs, history, bookmarks, profile store
**Exit:** installable dev build that browses the web as "Cybrsoft Browser".
*Effort: weeks (dominated by build infra + toolchain).*

## Phase 3 — Cybrsoft interface
- [ ] Cobal design system in chrome CSS (light + purpose-built dark)
- [ ] Toolbar restyle + privacy control
- [ ] New-tab page (minimal default, opt-in widgets)
- [ ] Settings UI
- [ ] First-run onboarding (search-engine choice, profile, theme, tab layout)
**Exit:** the browser *looks and onboards* like a Cybrsoft product.
*Effort: weeks–months (most net-new UI work).*

## Phase 4 — Privacy foundation
- [ ] Bundle & pin uBlock Origin; filter-list update path (no tracking)
- [ ] Privacy profiles Strict/Balanced/Custom → pref/uBO bundles (§6.3)
- [ ] ETP/TCP/FPP/DoH/HTTPS-only wiring + per-site exceptions
- [ ] Cookie-popup reduction (via uBO lists) with site exceptions
- [ ] Permission management UI
**Exit:** Strict-by-default privacy that degrades gracefully with visible reasons.

## Phase 5 — Extensions & profiles
- [ ] Verify WebExtension install/remove/enable/permissions/update
- [ ] **Test with real extensions:** uBlock Origin, Bitwarden, Proton Pass,
      Dark Reader, SponsorBlock, Privacy Badger
- [ ] Extension management UI
- [ ] Multi-profile create/rename/delete + isolation verification
**Exit:** documented real-extension compatibility; isolated profiles.

## Phase 6 — Advanced features
- [ ] **Privacy dashboard** (real data; toolbar + full page) — flagship
- [ ] Workspaces (real state over native tab groups/containers)
- [ ] Vertical tabs (enable + restyle native)
- [ ] Verify inherited: Reader, pdf.js, PiP, translation (Bergamot), downloads
- [ ] Import/export + encrypted local backup module
**Exit:** defining features working on real data.

## Phase 7 — Security & optimization
- [ ] Security review + dependency audit
- [ ] **Network audit:** packet-prove no browsing data / IDs leave device (§6.2)
- [ ] Performance + memory testing under realistic multi-tab load
- [ ] Signed-update pipeline (MAR + server) end-to-end
- [ ] Backup/recovery + website-compatibility testing
**Exit:** measured performance, verified-clean network, working signed updates.

## Phase 8 — Release preparation
- [ ] Windows installer (signed), app icon, version metadata
- [ ] Docs: README, build, CONTRIBUTING, SECURITY.md, THIRD_PARTY_NOTICES
- [ ] Release notes + final regression pass
- [ ] Verify **all** spec §23 criteria in `PROJECT_STATUS.md`
**Exit:** **1.0.0** — only when every release criterion is genuinely met.

---

## Cross-cutting, every phase
- Rebase onto latest upstream security release (the §9 treadmill) from Phase 2 on.
- Keep the patch set minimal; prefer prefs/CSS over C++.
- Update `PROJECT_STATUS.md` after each change; never leave the tree unusable.
