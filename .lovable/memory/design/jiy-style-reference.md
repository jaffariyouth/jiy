---
name: JIY editorial design system
description: Canonical visual language for every JIY frontend — palette, typography, radius, motifs, card recipe. Reference for all future builds.
type: design
---

JIY = "classical scholastic authority meets modern architectural UI." Apply this system to every new component unless the user says otherwise. Full spec lives in the uploaded `JIY.md` reference.

## Palette (semantic tokens in src/styles.css)
- `primary-dark` #010b21 — main text, anchors
- `midnight-sapphire` #162238 — dark banners, primary solid buttons
- `damascus-gold` #caa460 — interactive accent, links, hover borders, ornaments (✥ ❖)
- `deep-garnet` #7a2230 — notification badges, categorical eyebrows ONLY
- `ash-slate` #616975 — secondary text, disabled, unselected tabs
- `horizon-mist` #dcd9d2 — borders, dividers
- `warm-silk-grey` #f3eee7 — nested surfaces, input fields
- `alabaster-parchment` #faf8f5 — page background (always paired with dotted radial overlay)

## Typography
- `font-headline` Playfair Display — major titles, italic for classical voice
- `font-body` Hanken Grotesk — body + hyper-tracked uppercase utility labels (tracking-[0.15em]–[0.25em], font-bold)
- Material Symbols Outlined for icons (use `style={{ fontVariationSettings: "'wght' 300" }}`)

## Structural rules
- 4px default radius. Square/architectural, never pill-shaped.
- Double-line borders (`editorial-double-border` utility) for important framed surfaces.
- `studio-card`: white bg + horizon-mist border + layered shadow + gold-border hover with `translateY(-4px)`.
- `interactive-btn`: gold outline fades in on hover via `::after`.
- Decorative ornaments: ❖ (section divider), ✥ (geometric break).
- Page background = parchment with radial-dot pattern (use `.jiy-dashboard` class on member-area shells).

## Max width / spacing
- Content max-width 1280px, page padding 40px (`px-10`).
