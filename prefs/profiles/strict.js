// Cybrsoft Browser — "Strict" privacy profile (DEFAULT)
// Maximum practical protection. These prefs are applied when the user selects
// Strict (the out-of-box default; prefs/cybrsoft.js already ships these values).
// Expect some site breakage — surfaced to the user with scoped exceptions,
// never silently disabled (ARCHITECTURE §6.3).

// Enhanced Tracking Protection: strict
pref("browser.contentblocking.category", "strict");
pref("privacy.trackingprotection.enabled", true);
pref("privacy.trackingprotection.socialtracking.enabled", true);
pref("privacy.trackingprotection.cryptomining.enabled", true);
pref("privacy.trackingprotection.fingerprinting.enabled", true);

// Cookies: reject trackers + full state partitioning (Total Cookie Protection)
pref("network.cookie.cookieBehavior", 5);
pref("privacy.partition.network_state", true);
pref("privacy.partition.serviceWorkers", true);

// Fingerprinting: both FPP and resistFingerprinting (RFP is strongest; it
// breaks more sites — acceptable at Strict).
pref("privacy.fingerprintingProtection", true);
pref("privacy.resistFingerprinting", true);
pref("privacy.resistFingerprinting.letterboxing", true);

// Referrers: trim aggressively
pref("network.http.referer.XOriginPolicy", 2);
pref("network.http.referer.XOriginTrimmingPolicy", 2);

// Query-param stripping (utm_*, fbclid, etc.)
pref("privacy.query_stripping.enabled", true);
pref("privacy.query_stripping.enabled.pbmode", true);

// Transport security
pref("dom.security.https_only_mode", true);
pref("network.trr.mode", 2);            // DoH on, fall back to DNS

// WebRTC: don't leak local/real IP via ICE
pref("media.peerconnection.ice.default_address_only", true);
pref("media.peerconnection.ice.no_host", true);
