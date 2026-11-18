// Cybrsoft Browser — autoconfig loader
// Tells Firefox to read cybrsoft.cfg (the locked-pref file) and not to send the
// mandatory "obscure value" email the autoconfig system historically expected.
pref("general.config.filename", "cybrsoft.cfg");
pref("general.config.obscure_value", 0);
pref("general.config.sandbox_enabled", false);
