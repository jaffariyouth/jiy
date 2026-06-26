## Goal
Make the Tabarruk banner fully black in the Muharram theme only. No other elements change.

## Why it didn't show
`src/styles.css` line 563-566 sets `.theme-muharram .bg-midnight-sapphire { background-color: #7a0810 !important }`. The banner uses the `bg-midnight-sapphire` utility, so this `!important` rule beats the new `.theme-muharram .sponsor-notice` rule. Additionally, the banner has an inner overlay div with a damascus-gold radial gradient that tints it away from pure black.

## Changes (CSS only, in `src/styles.css`)
1. Update the `.theme-muharram .sponsor-notice` block to use `!important` on `background-color: #000000` and `border-bottom-color`, so it wins over the `bg-midnight-sapphire` override.
2. Add `.theme-muharram .sponsor-notice > div[class*="radial-gradient"] { display: none; }` (or target the first child overlay) to remove the gold radial tint inside the banner so the black reads true.
3. Leave the `::before` pseudo neutralized (already `background: none`).

No changes to `SponsorNotice.tsx` or any other component, and no changes outside the `.theme-muharram` scope.