/**
 * Theme registry.
 *
 * Adding a new seasonal theme is a 3-file change:
 *   1. Add a feature_flags row (e.g. key = "theme_ramadan") — done in admin UI.
 *   2. Add an entry below with the flag key and CSS class.
 *   3. Add a `.theme-<key>` block in src/styles.css that re-maps the
 *      semantic role tokens (--role-*) onto the raw palette of your choice.
 *
 * The default theme stays applied whenever no preset flag is on — its values
 * are hard-coded on `:root` in styles.css so the site renders correctly even
 * if the active-theme query fails.
 */

export type ThemeKey = "default" | "muharram";

export const THEMES: Record<
  ThemeKey,
  { label: string; description: string; flag: string | null; className: string | null }
> = {
  default: {
    label: "Default (Editorial)",
    description: "JIY editorial parchment + Damascus gold.",
    flag: null,
    className: null,
  },
  muharram: {
    label: "Muharram / Safar",
    description: "Dark crimson mourning palette for Muharram and Safar.",
    flag: "theme_muharram",
    className: "theme-muharram",
  },
};

/** Priority order — first enabled flag wins. */
export const THEME_PRIORITY: ThemeKey[] = ["muharram"];
