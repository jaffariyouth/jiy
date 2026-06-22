# Muharram Theme — Site-Wide Toggle

Import the Muharram color scheme from the uploaded HTML and let admins switch the entire site (public + dashboard + admin) into it during Muharram/Safar.

## 1. Theme tokens (CSS)

In `src/styles.css`, add a `.theme-muharram` scope class with overridden CSS variables mapped to the uploaded palette:

- `--color-alabaster-parchment` → `#0a0304` (page bg)
- `--color-warm-silk-grey` → `#130607` (elevated surface)
- `--color-horizon-mist` → `#2b1013` (borders)
- `--color-midnight-sapphire` / `--color-primary-dark` / `--color-primary` → `#e5dada` (primary text on dark)
- `--color-deep-garnet` → `#7a0810` (blood-ruby)
- `--color-damascus-gold` → `#d91823` (crimson-glow accent — replaces gold)
- `--color-ash-slate` → `#917b7c` (muted text)
- `--color-persian-indigo` → `#130607`

Override the `.jiy-dashboard` dotted-parchment background + `studio-card` colors when nested under `.theme-muharram` so cards become `#130607` with `#2b1013` borders and the crimson glow replaces gold on hover/focus rings.

Add a body-level background override for `.theme-muharram` matching the uploaded radial-dot pattern (`#1c0a0c` on `#0a0304`).

## 2. Persisting the toggle

Store as a `feature_flags` row with key `theme_muharram` (table + admin UI already exist at `/admin/flags`). No schema change needed — reuse existing flag infrastructure.

Add a lightweight public server fn `getActiveTheme()` that reads the flag with the server publishable client (anon SELECT on `feature_flags` already allowed for enabled flags — verify; if not, add a `TO anon` SELECT policy via migration restricted to `key = 'theme_muharram'`).

## 3. Applying the class globally

In `src/routes/__root.tsx`:
- Add a loader that calls `getActiveTheme()` and returns `{ muharram: boolean }`.
- In `RootComponent`, read it via `Route.useLoaderData()` and add `theme-muharram` to the `<body>` className (or to the top-level wrapper div) conditionally. This covers public pages, `_authenticated/dashboard`, and `_authenticated/admin` in one place.

## 4. Admin toggle UI

Add a dedicated card to `/admin/flags` (or a new `/admin/appearance` tab) labeled **"Muharram Theme"** with:
- Toggle switch (reusing `ToggleSwitch` component)
- Helper copy: "Switch the entire site to the Muharram/Safar mourning palette."
- Wires to an `updateFeatureFlag({ key: 'theme_muharram', enabled })` server fn (gated by `requireSupabaseAuth` + `has_role(admin)`).

## 5. Verification

- Toggle on → reload `/`, `/events`, `/dashboard`, `/admin` → confirm dark crimson palette applies everywhere, cards/borders/text legible.
- Toggle off → site returns to JIY editorial parchment palette.
- Build passes.

## Technical notes

- No new color tokens — we override existing semantic tokens under `.theme-muharram` so every component (studio-card, interactive-btn, ogee mask, footer, auth pages) reskins automatically without touching component code.
- Damascus-gold accents become crimson-glow (`#d91823`) in Muharram mode — intentional, matches the source design.
- Mosque silhouette and arch motifs stay; only colors swap.
