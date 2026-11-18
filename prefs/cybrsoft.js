// Cybrsoft Browser — default preferences
// Copied to browser/app/profile/cybrsoft.js by apply-patches.sh and loaded at
// startup. These set DEFAULTS (user-overridable). Prefs that must be LOCKED
// (not overridable) live in autoconfig/ instead.
//
// Rationale lives in docs/ARCHITECTURE.md §6. Keep this list auditable: every
// entry below exists to serve "no telemetry / privacy by default".

/* ---- Telemetry & data reporting: OFF ---- */
pref("toolkit.telemetry.enabled", false);
pref("toolkit.telemetry.unified", false);
pref("toolkit.telemetry.archive.enabled", false);
pref("toolkit.telemetry.newProfilePing.enabled", false);
pref("toolkit.telemetry.shutdownPingSender.enabled", false);
pref("toolkit.telemetry.updatePing.enabled", false);
pref("toolkit.telemetry.bhrPing.enabled", false);
pref("toolkit.telemetry.firstShutdownPing.enabled", false);
pref("toolkit.telemetry.coverage.opt-out", true);
pref("datareporting.healthreport.uploadEnabled", false);
pref("datareporting.policy.dataSubmissionEnabled", false);
pref("app.shield.optoutstudies.enabled", false);
pref("app.normandy.enabled", false);
pref("app.normandy.api_url", "");

/* ---- Experiments / Nimbus: OFF ---- */
pref("messaging-system.rsexperimentloader.enabled", false);
pref("browser.ping-centre.telemetry", false);

/* ---- Crash reporting: no auto-submit ---- */
pref("breakpad.reportURL", "");
pref("browser.tabs.crashReporting.sendReport", false);

/* ---- Pocket / sponsored content: OFF ---- */
pref("extensions.pocket.enabled", false);
pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.newtabpage.activity-stream.telemetry", false);

/* ---- Accounts / Sync: not wired to any Cybrsoft cloud (none exists) ---- */
pref("identity.fxaccounts.enabled", false);

/* ---- Location services: OFF by default ---- */
pref("geo.provider.network.url", "");
pref("browser.region.network.url", "");
pref("browser.region.update.enabled", false);

/* ---- Privacy protections: strong defaults (Strict profile baseline) ---- */
// Enhanced Tracking Protection: strict
pref("browser.contentblocking.category", "strict");
pref("privacy.trackingprotection.enabled", true);
pref("privacy.trackingprotection.socialtracking.enabled", true);
// Total Cookie Protection / state partitioning
pref("network.cookie.cookieBehavior", 5);
pref("privacy.partition.network_state", true);
// Fingerprinting protection (FPP). resistFingerprinting is stronger but breaks
// more sites; Strict profile may enable it — see privacy-profiles mapping.
pref("privacy.fingerprintingProtection", true);
// Query-param stripping
pref("privacy.query_stripping.enabled", true);
// HTTPS-only + DoH
pref("dom.security.https_only_mode", true);
pref("network.trr.mode", 2);

/* ---- Safe Browsing: keep LOCAL malware/phishing list protection, no remote
       lookups that leak URLs (see ARCHITECTURE §6.5) ---- */
pref("browser.safebrowsing.malware.enabled", true);
pref("browser.safebrowsing.phishing.enabled", true);
pref("browser.safebrowsing.downloads.remote.enabled", false);

/* ---- Search: no imposed default; the first-run wizard sets this ---- */
pref("browser.urlbar.suggest.quicksuggest.sponsored", false);
pref("browser.urlbar.suggest.quicksuggest.nonsponsored", false);
