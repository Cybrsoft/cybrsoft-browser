// Cybrsoft branding — branding-scoped preferences
// Loaded as part of the branding set. Keep identity/endpoint prefs here;
// behavioural/privacy prefs live in prefs/cybrsoft.js.

// Homepage / new tab stay local and minimal (the new-tab page is ours).
pref("browser.startup.homepage", "about:home");

// Update endpoint is Cybrsoft's own signed-MAR server (placeholder; finalized
// with blocker B4). NEVER Mozilla's, never an unverified source.
// pref("app.update.url", "https://updates.cybrsoft.example/browser/%CHANNEL%/update.xml");

// No Mozilla telemetry/server identifiers are configured anywhere in this fork.
