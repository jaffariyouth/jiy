# Muharram Theme Rebalance

The current Muharram theme overuses `#d91823` crimson-glow (it's mapped to `--role-accent`, `--color-damascus-gold`, all hover states, all borders on hover, all text accents) and many cards inherit translucent red tints from utilities like `bg-deep-garnet/10`, `bg-damascus-gold/20`, etc. Result: harsh, glowy, and washed-out instead of the balanced editorial feel of the default theme.

This plan is **CSS-only**, scoped to `.theme-muharram` in `src/styles.css`. No component code changes.

## Palette role redefinition

Introduce a clear hierarchy mirroring how the editorial theme uses sapphire/parchment/gold:

```text
parchment  → ink       (page bg)          #0a0304   (keep)
card       → charcoal  (solid surfaces)   #1a1012   NEW (replaces translucent reds)
card-hi    → raised    (nested surfaces)  #241518   NEW
border     → muted     (default rules)    #3a1f23   softened from #2b1013
muted-red  → soft      (default accents)  #8a2a32   NEW — the "everyday" red
crimson    → selection (active/hover ind) #d91823   (keep, but restrict usage)
text       → bone      (body)             #e5dada   (keep)
text-muted → ash       (secondary)        #917b7c   (keep)
```

## Changes in `src/styles.css` (`.theme-muharram` block only)

1. **Role tokens** — swap accent default to the muted soft red; keep crimson reserved:
   - `--role-accent: #8a2a32` (was `#d91823`)
   - `--role-accent-strong: #d91823` (keep — used only for "selected" states)
   - `--role-bg-surface: #1a1012` (was `#130607` — slightly warmer charcoal)
   - `--role-border-subtle: #3a1f23` (was `#2b1013`)
   - `--role-gradient-warm/cool`: dial opacity from 0.30/0.20 down to 0.12/0.08

2. **Brand token remaps** — separate the two reds:
   - `--color-deep-garnet: #8a2a32` (soft red — default usage)
   - `--color-damascus-gold: #d91823` (keep crimson, but it's now opt-in via "selected" classes only)
   - Add new utility-class overrides so `bg-deep-garnet`, `bg-deep-garnet/10`, `bg-deep-garnet/20`, `bg-damascus-gold/10`, `bg-damascus-gold/20` all resolve to **solid** `#1a1012` (card charcoal) instead of translucent crimson. This is the key fix — the dashboard's many `bg-deep-garnet/10` and `bg-damascus-gold/20` cards stop looking like red film.

3. **Studio card** — change `.studio-card` background from `#130607` to `#1a1012`; hover border from `#d91823` → `#8a2a32` (soft red), with a subtle `#d91823` glow reserved only for `.studio-card.is-selected` / `[aria-current]`.

4. **Text accents** — `text-deep-garnet` and `text-damascus-gold` currently both map to `#d91823`. Split them:
   - `.text-deep-garnet` → `#c4555f` (legible soft red on dark)
   - `.text-damascus-gold` → keep `#d91823` but only used sparingly in components

5. **Hover overrides** — `hover:bg-damascus-gold`, `hover:text-damascus-gold`, `hover:border-damascus-gold` stay crimson (these *are* the interaction indicator the user wants).

6. **Selection indicator utility** — add `.theme-muharram [data-state="active"]`, `.theme-muharram [aria-current="page"]`, `.theme-muharram [aria-selected="true"]` → border/ring uses crimson `#d91823`. This makes crimson explicitly the "selected" cue.

7. **Tabarruk banner** — unchanged (stays black per prior request).

8. **Background dots** — soften from `#1c0a0c` to `#150709` so the page texture is calmer.

## Out of scope

- No component file edits — purely a theme stylesheet refactor.
- No changes to the default (editorial) theme.
- No changes to admin pages (already exempt from theme).

## Verification

Reload `/dashboard` with Muharram on. Expect:
- Cards: solid charcoal, no red film.
- Borders/text: muted oxblood, not glowy.
- Hover: still gets the crimson interaction cue.
- Active nav item / selected tab: clearly crimson outlined.
