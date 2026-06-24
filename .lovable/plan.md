## What's wrong now

1. **Stats card surface.** `<Metrics>` uses `bg-persian-indigo`. My current `.theme-muharram` remaps `bg-persian-indigo` → `#7a0810` (blood-ruby) because the same class is used on solid buttons. So the stats strip becomes pure red instead of the deep card surface (`#130607`) shown in your mock.
2. **Stats card divider** uses `border-white/10` — stays white-on-red instead of `muharram-border #2b1013`.
3. **Hero ambient gradients** use `from-deep-garnet/10` and `from-damascus-gold/15`. The mock uses 30 % / 20 % opacities, so they barely show in Muharram.
4. **Event-card image fade.** Mock uses `bg-gradient-to-t from-muharram-bg/90 via-muharram-bg/20 to-transparent` over event covers; the app card has no such fade.

These exist because a single brand class (e.g. `bg-persian-indigo`) plays two roles (deep surface AND button). One CSS-variable swap can't satisfy both — that's the same constraint that's about to bite us every time we add a new theme.

## Architecture: base tokens + role tokens + theme presets

Restructure tokens into three layers in `src/styles.css`:

```text
┌───────────────────────────────────────────────────────────────┐
│ LAYER 1  Brand palette (raw colors)                           │
│   --color-midnight-sapphire, --color-damascus-gold, …         │
│   --color-blood-ruby, --color-crimson-glow, --color-parchment │
│   (NEW raw entries for every preset's hexes, never reassigned)│
├───────────────────────────────────────────────────────────────┤
│ LAYER 2  Semantic role tokens (what components consume)       │
│   --role-bg-page          page background                     │
│   --role-bg-surface       elevated card / header              │
│   --role-bg-deep          dark stat strip / footer            │
│   --role-bg-button        primary button fill                 │
│   --role-text-strong      headlines                           │
│   --role-text-muted       captions                            │
│   --role-text-on-deep     text on the deep strip              │
│   --role-accent           default accent (gold / crimson-glow)│
│   --role-accent-strong    hover accent                        │
│   --role-border-subtle    hairlines                           │
│   --role-border-deep      divider on deep strip               │
│   --role-gradient-warm    radial wash A                       │
│   --role-gradient-cool    radial wash B                       │
├───────────────────────────────────────────────────────────────┤
│ LAYER 3  Theme presets (map L1 raws into L2 roles)            │
│   :root / .theme-default  → gold + parchment                  │
│   .theme-muharram         → crimson + obsidian                │
│   .theme-ramadan / …      → add in future, one block each     │
└───────────────────────────────────────────────────────────────┘
```

Layer 1 stays hard-coded so the site has a working fallback even if the preset never loads. Layer 2 names are stable — they're what components import. Layer 3 is what we swap.

Each preset is one CSS block:

```css
.theme-muharram {
  --role-bg-page:        var(--color-obsidian-black);   /* #0a0304 */
  --role-bg-surface:     var(--color-muharram-card);    /* #130607 */
  --role-bg-deep:        var(--color-muharram-card);
  --role-bg-button:      var(--color-blood-ruby);       /* #7a0810 */
  --role-text-strong:    var(--color-parchment);        /* #e5dada */
  --role-text-muted:     var(--color-ash-rose);         /* #917b7c */
  --role-text-on-deep:   var(--color-parchment);
  --role-accent:         var(--color-crimson-glow);     /* #d91823 */
  --role-accent-strong:  var(--color-crimson-glow);
  --role-border-subtle:  var(--color-muharram-border);  /* #2b1013 */
  --role-border-deep:    var(--color-muharram-border);
  --role-gradient-warm:  rgba(122, 8, 16, 0.30);        /* blood-ruby /30 */
  --role-gradient-cool:  rgba(217, 24, 35, 0.20);       /* crimson-glow /20 */
  color-scheme: dark;
}
```

Default preset is the same shape with parchment / sapphire / gold raws.

For migration speed we keep the existing brand-token utilities working (`text-persian-indigo`, `bg-damascus-gold`, etc.) by mapping them inside each preset block (this is what's there today). New components added going forward use the role tokens.

## Persisting the active preset (no schema change)

Themes live in a registry in code:

```ts
// src/lib/jiy/themes.ts
export const THEMES = {
  default:  { label: "Default (Editorial)", flag: null,             className: null },
  muharram: { label: "Muharram / Safar",    flag: "theme_muharram", className: "theme-muharram" },
  // future: ramadan, eid, ashura-night, …
} as const;
```

The existing `feature_flags` boolean (`theme_muharram`) is kept. New themes = add a new boolean flag + a registry entry + a `.theme-{key}` CSS block. `getActiveTheme()` walks the registry in priority order and returns the first enabled one (default if none).

Admin page becomes a **single-select radio list of themes** instead of a per-flag toggle. Switching themes flips the right flag on and the others off in one server call. This keeps every existing migration intact and makes adding "Ramadan" a 3-file diff.

## Specific fixes (apply during refactor)

1. `<Metrics>` (`src/routes/index.tsx:407-419`):
   - `bg-persian-indigo` → `bg-[var(--role-bg-deep)]`
   - `text-damascus-gold` (the number) → `text-[var(--role-accent)]`
   - `text-white/80` → `text-[var(--role-text-on-deep)]/80`
   - `border-white/10` → `border-[var(--role-border-deep)]`
   - Overlay gradient `from-deep-garnet/30` → use `--role-gradient-warm`
2. Hero ambient gradients (`src/routes/index.tsx:305-306`): bump default opacities from `/10` and `/15` to `/30` and `/20` to match the mock — they read correctly in both themes because the tokens still resolve to gold (default) or crimson (Muharram).
3. Event card cover (`EventCard.tsx` if present, else inline): add `bg-gradient-to-t from-[var(--role-bg-page)]/90 via-[var(--role-bg-page)]/20 to-transparent` overlay so titles stay legible on dark images in Muharram and on light images otherwise.
4. Drop the per-class `!important` overrides in `.theme-muharram` once the role tokens are in place — components that consume role tokens don't need them.

## Verification

- `/` in default theme: looks identical to today (gold + parchment + sapphire stats strip).
- `/` in Muharram: stats strip is `#130607` card surface with crimson `1,200+` numbers, hairlines in `#2b1013`, hero glow visible in blood-ruby / crimson-glow.
- Admin → Appearance: single radio (Default · Muharram). Switching writes one `feature_flags` row, reload paints the new theme everywhere.
- Add a placeholder `theme_ramadan` flag + a green `.theme-ramadan` block locally and confirm it appears in the radio without any other code change.

## Files touched

- `src/styles.css` — restructure tokens into the 3 layers; rewrite `.theme-muharram` against role tokens; add `.theme-default` block.
- `src/lib/jiy/themes.ts` (new) — registry.
- `src/lib/jiy/theme.functions.ts` — return active theme key (not just boolean).
- `src/routes/__root.tsx` — apply `THEMES[key].className` to `<html>`.
- `src/routes/_authenticated/admin.flags.tsx` (or new `admin.appearance.tsx`) — radio selector backed by registry.
- `src/routes/index.tsx` — Metrics + hero gradient classes.
- `src/components/dashboard/EventCard.tsx` — image fade overlay.

No migration. No breaking change to existing brand-class usage.