// Cybrsoft Browser — "Custom" privacy profile
// Custom has no fixed bundle: the user controls each protection individually in
// Settings → Privacy. Selecting Custom simply stops the browser from managing
// these prefs as a group, preserving whatever the user set.
//
// The tunable surface (each exposed as a control in the privacy settings UI):
//
//   Tracker blocking (ETP)        browser.contentblocking.category,
//                                 privacy.trackingprotection.*
//   Third-party cookies           network.cookie.cookieBehavior,
//                                 privacy.partition.network_state
//   Fingerprinting protection     privacy.fingerprintingProtection (FPP),
//                                 privacy.resistFingerprinting (RFP, strong)
//   Referrer trimming             network.http.referer.XOrigin*
//   Query-param stripping         privacy.query_stripping.enabled
//   HTTPS-only mode               dom.security.https_only_mode
//   DNS-over-HTTPS                 network.trr.mode
//   WebRTC IP exposure            media.peerconnection.ice.*
//
// Defaults for a freshly chosen Custom profile start from Balanced, then the
// user adjusts. This file is intentionally empty of hard prefs.
