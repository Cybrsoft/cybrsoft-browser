// Cybrsoft Browser — "Balanced" privacy profile
// Strong protection with better site compatibility. The main difference from
// Strict: resistFingerprinting (RFP) is OFF (it's the biggest source of
// breakage); the lighter Fingerprinting Protection (FPP) stays on.

// Enhanced Tracking Protection: strict category kept, but RFP off (below)
pref("browser.contentblocking.category", "strict");
pref("privacy.trackingprotection.enabled", true);
pref("privacy.trackingprotection.socialtracking.enabled", true);
pref("privacy.trackingprotection.cryptomining.enabled", true);
pref("privacy.trackingprotection.fingerprinting.enabled", true);

// Cookies: still reject trackers + partition (low breakage, high value)
pref("network.cookie.cookieBehavior", 5);
pref("privacy.partition.network_state", true);

// Fingerprinting: FPP on, RFP OFF (compatibility)
pref("privacy.fingerprintingProtection", true);
pref("privacy.resistFingerprinting", false);
pref("privacy.resistFingerprinting.letterboxing", false);

// Referrers: trim cross-origin but keep origin (less breakage than Strict)
pref("network.http.referer.XOriginPolicy", 0);
pref("network.http.referer.XOriginTrimmingPolicy", 1);

// Query-param stripping on
pref("privacy.query_stripping.enabled", true);

// Transport: HTTPS-only prompts rather than hard-blocks is a UX choice; keep on
pref("dom.security.https_only_mode", true);
pref("network.trr.mode", 2);            // DoH on

// WebRTC: restrict host candidates but allow default address (compat)
pref("media.peerconnection.ice.default_address_only", true);
pref("media.peerconnection.ice.no_host", false);
