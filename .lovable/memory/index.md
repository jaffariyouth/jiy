# Project Memory

## Core
All screens responsive 320px → 1536px+. Use fluid tokens from styles.css (margin-safe, gap-section, headline-*, form-title); never hardcode `px` for layout spacing or H1 sizes. Header rows mixing text+widgets use `grid-cols-[minmax(0,1fr)_auto] sm:flex` with `min-w-0`/`shrink-0`/`truncate`. Tables go in `overflow-x-auto` wrappers. Any flex row with >2 items must `flex-wrap`.

JIY editorial design system is the canonical visual language for ALL frontend work (Playfair Display + Hanken Grotesk; midnight-sapphire/damascus-gold/deep-garnet/ash-slate/horizon-mist on parchment; 4px radius, double-line borders, dotted parchment bg, `studio-card` + `interactive-btn` utilities scoped via `.jiy-dashboard`). See mem://design/jiy-style-reference. Backend wiring is pre-done; new auth/profile fields use existing `updateMyProfile` server fn.

## Memories
- [Responsive rules](mem://design/responsive-rules) — Full patterns for mobile/tablet/desktop, table wrappers, header grid pattern
- [JIY style reference](mem://design/jiy-style-reference) — Full palette, typography, structural rules, motifs
