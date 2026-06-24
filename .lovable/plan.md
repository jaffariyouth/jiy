## Problem

The current `.theme-muharram` only overrides the JIY brand tokens (`--color-midnight-sapphire`, `--color-damascus-gold`, etc.) and a couple of `.jiy-dashboard` rules. It does NOT override:

1. The **Material surface palette** (`--color-surface*`, `--color-on-surface*`, `--color-primary-container`, `--color-on-primary`, `--color-outline*`, `--color-secondary*`, `--color-tertiary*`) — these still resolve to the light blue/grey defaults, so any component using `bg-surface`, `bg-primary-container`, `text-on-surface`, etc. stays light.
2. The **shadcn `:root` tokens** (`--card`, `--popover`, `--border`, `--input`, `--muted`, `--accent`, `--sidebar*`) — every shadcn primitive (cards, inputs, popovers, sidebar) stays white-on-light.
3. The **hardcoded JIY rule colors** inside `.jiy-dashboard` (e.g. `value-tab.is-active { color: #14243b }`, `interactive-btn::after { border: #caa460 }`, the dotted-parchment background uses literal hexes, the mosque-mask is unchanged).
4. The homepage uses one inline hex: `radial-gradient(... #caa460 ...)` in `src/routes/index.tsx:301` (mosque silhouette dotting).

Result: the page is mostly still in the parchment palette with only a handful of tokens swapped, which is why it doesn't match your uploaded `timeless_high_contrast_dashboard_4.html`.

## Reference palette (from your upload, verified)

```
muharram-bg       #0a0304   page background (obsidian black-red)
muharram-card     #130607   elevated surfaces
muharram-border   #2b1013   borders
blood-ruby        #7a0810   deep accent
crimson-glow      #d91823   primary accent (replaces damascus-gold)
ash-rose          #917b7c   muted text
parchment-white   #e5dada   primary text
dot-texture       #1c0a0c   on #0a0304, 24px radial-gradient grid
```

## Fix

Rewrite the `.theme-muharram` block in `src/styles.css` so it remaps EVERY token the app reads, not just the JIY brand subset.

### 1. JIY brand tokens (keep — already correct)

```
--color-alabaster-parchment: #0a0304
--color-warm-silk-grey:      #130607
--color-horizon-mist:        #2b1013
--color-midnight-sapphire:   #e5dada
--color-primary-dark:        #e5dada
--color-persian-indigo:      #130607
--color-deep-garnet:         #7a0810
--color-damascus-gold:       #d91823
--color-ash-slate:           #917b7c
--color-muted-dusk:           #917b7c
```

### 2. Material surface palette (NEW — required for any non-JIY component)

```
--color-surface, --color-surface-bright, --color-background: #0a0304
--color-surface-dim:                                          #050102
--color-surface-container-lowest:                             #050102
--color-surface-container-low:                                #100506
--color-surface-container:                                    #130607
--color-surface-container-high:                               #1a080a
--color-surface-container-highest:                            #21090c
--color-surface-variant:                                      #2b1013
--color-on-surface, --color-on-background:                    #e5dada
--color-on-surface-variant:                                   #917b7c
--color-inverse-surface:                                      #e5dada
--color-inverse-on-surface:                                   #130607
--color-outline:                                              #2b1013
--color-outline-variant:                                      #21090c

--color-primary:                                              #e5dada
--color-on-primary:                                           #0a0304
--color-primary-container:                                    #130607
--color-on-primary-container:                                 #d91823
--color-inverse-primary:                                      #7a0810

--color-secondary:                                            #917b7c
--color-on-secondary:                                         #0a0304
--color-secondary-container:                                  #1a080a
--color-on-secondary-container:                               #e5dada

--color-tertiary:                                             #d91823
--color-on-tertiary:                                          #0a0304
--color-tertiary-container:                                   #7a0810
--color-on-tertiary-container:                                #e5dada

--color-error:                                                #d91823
--color-on-error:                                             #0a0304
--color-error-container:                                      #2b1013
--color-on-error-container:                                   #e5dada
```

### 3. shadcn `:root` tokens (NEW)

Inside `.theme-muharram`, override:

```
--card / --popover                  → oklch equivalent of #130607
--card-foreground / --popover-fg    → #e5dada
--muted                              → #1a080a
--muted-foreground                   → #917b7c
--accent                             → #2b1013
--accent-foreground                  → #e5dada
--border / --input                   → #2b1013
--ring                               → #d91823
--destructive                        → #d91823
--sidebar / --sidebar-foreground / --sidebar-border / etc. → matching dark crimson tones
```

### 4. `.jiy-dashboard` rule colors

Replace the hardcoded `#14243b`, `#caa460`, `#7a2230`, `#F8F6EF`, `#FFFFFF` references inside scoped rules (dotted background, value-tab active/hover, interactive-btn ring, ::selection) so under `.theme-muharram` they resolve to the crimson palette.

### 5. Homepage inline gradient

In `src/routes/index.tsx:301`, change the literal `#caa460` to `currentColor` or read `var(--color-damascus-gold)` so the mosque-silhouette dots reskin too.

## Verification

After the change, with the Muharram flag on:
- `/` (homepage) — body bg `#0a0304`, dotted texture in `#1c0a0c`, mosque silhouette dots in crimson, headlines in `#e5dada`, buttons/links accent in `#d91823`.
- `/events`, `/team`, `/press`, `/scholar-qa` — all dark crimson.
- `/dashboard`, `/account`, `/admin/*` — studio cards `#130607` on `#0a0304`, borders `#2b1013`, hover ring `#d91823`.
- Shadcn primitives (inputs on `/auth`, dropdowns, popovers) — dark crimson surfaces, not white.

Toggle off → returns to JIY parchment palette unchanged.

No component code changes other than the one inline-hex fix in `index.tsx`. Everything else is a single rewrite of the `.theme-muharram` block in `src/styles.css`.