// Cybrsoft Browser — theme resolution
//
// Resolves the effective light/dark theme from the user's setting + the OS
// preference (spec §5: follow Windows by default, allow manual override), and
// validates the accent color. Pure + testable; the chrome applies the result by
// setting data-theme and the --cb-primary token (see theme/cybrsoft/tokens.css).

export const THEME_SETTINGS = ["system", "light", "dark"];

/** @returns {"light"|"dark"} */
export function resolveTheme(setting, systemPrefersDark) {
  if (!THEME_SETTINGS.includes(setting)) throw new Error(`invalid theme setting: ${setting}`);
  if (setting === "system") return systemPrefersDark ? "dark" : "light";
  return setting;
}

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export function isValidHex(s) { return typeof s === "string" && HEX_RE.test(s.trim()); }

/** Normalize to #rrggbb lowercase; throws if invalid. */
export function normalizeHex(s) {
  if (!isValidHex(s)) throw new Error(`invalid hex color: ${s}`);
  let h = s.trim().toLowerCase().slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return "#" + h;
}

/**
 * The effective theme decision for the chrome to apply.
 * @returns {{ theme:"light"|"dark", dataTheme:string, accent:string }}
 */
export function effectiveTheme({ setting = "system", systemPrefersDark = false, accent = "#3B6FE0" } = {}) {
  const theme = resolveTheme(setting, systemPrefersDark);
  return {
    theme,
    // when following system we leave data-theme unset so CSS media query drives it
    dataTheme: setting === "system" ? "" : theme,
    accent: normalizeHex(accent),
  };
}
