## 1. Homepage section background swap

Current homepage section order and bgs (`src/routes/index.tsx`):

```text
Hero            bg-white                       ← "hero bg"
Metrics         var(--role-bg-deep)            (deep band, unchanged)
About           bg-white                       ← "hero bg"
UpcomingEvents  bg-alabaster-parchment/60      ← "upcoming bg"
OngoingEvents   bg-white                       ← "hero bg"
CoreValues      bg-alabaster-parchment         (in-between)
Press           bg-white                       ← "hero bg"
```

New mapping you asked for:

- **Group A — "upcoming-events bg"** → Hero, About (Mission & Vision), OngoingEvents, Press
- **Group B — "main-hero bg"** → the in-between sections (Metrics, UpcomingEvents, CoreValues)

Concretely, swap the two parchment tones across these sections:

| Section         | Before                       | After                            |
| --------------- | ---------------------------- | -------------------------------- |
| Hero            | `bg-white`                   | `bg-alabaster-parchment`         |
| About           | `bg-white`                   | `bg-alabaster-parchment`         |
| OngoingEvents   | `bg-white`                   | `bg-alabaster-parchment`         |
| Press           | `bg-white`                   | `bg-alabaster-parchment`         |
| UpcomingEvents  | `bg-alabaster-parchment/60`  | `bg-white`                       |
| CoreValues      | `bg-alabaster-parchment`     | `bg-white`                       |
| Metrics         | `--role-bg-deep` (deep band) | unchanged                        |

Because `bg-white` and `bg-alabaster-parchment` are both already remapped in `.theme-muharram` (Layer 2 → role tokens via the `--surface` overrides in `src/styles.css`), this swap automatically lands the correct dark/obsidian + crimson tones in the Muharram theme while staying parchment/white in the default theme. No new tokens required.

Also touch the `StarBreak` divider so its inline `bg-alabaster-parchment` chip matches whichever side it sits between (use `bg-[var(--role-bg-page)]` or simply keep `bg-alabaster-parchment` — both resolve correctly per theme; pick parchment to match the surrounding Press/Ongoing sections).

## 2. Rebuild Press pages 1:1 from uploaded HTML

The uploaded `JIY_Press_SCREENS_htmls.txt` contains two screens:

1. **Press catalog** (list of articles) — used for BOTH `/press` (public) and `/dashboard/press` (members). Layout is identical; only the data source differs (public uses `listPublishedArticles`, members use `listMemberArticles`, which already filters by audience).
2. **Article reader** (full article view) — used for BOTH `/press/$slug` (public) and `/dashboard/press/$slug` (members). Same layout; member route uses `getMemberArticleBySlug`, public uses `getArticleBySlug`.

### Shared components (new files)

- `src/components/press/PressHero.tsx` — Featured-issue hero band (dark sapphire / Muharram-obsidian) with eyebrow + headline + body + CTA + framed cover image. Driven by the first article in the list (newest published) or a chosen "featured" article.
- `src/components/press/PressFeedItem.tsx` — Editorial feed row with three variants: `image-right`, `centered-no-image`, `image-left`. Pick variant by index (`i % 3`) to mirror the uploaded HTML rhythm. Each row links to the correct slug route depending on `mode` prop (`public` → `/press/$slug`, `member` → `/dashboard/press/$slug`). Members-only items show a small "MEMBERS" eyebrow.
- `src/components/press/PressDivider.tsx` — Hairline + crescent divider between feed rows.
- `src/components/press/ArticleHero.tsx` — Dark band with eyebrow + display headline + subhead; tall enough that an outset image overlaps the next section by `-mt-32`.
- `src/components/press/ArticleOutsetImage.tsx` — `max-w-[1024px]` aspect-video framed cover with double damascus-gold border rings, grayscale + hover scale.
- `src/components/press/ArticleReadingCanvas.tsx` — Two-column layout: sticky left sidebar (back link, author avatar/name/bio, share button) + right reading column with `drop-cap`, justified body, generous spacing. Accepts `backTo` prop so it can route to `/press` or `/dashboard/press`.
- `src/components/press/ArticleEndmark.tsx` — Crescent dingbat.

All components use the existing semantic classes (`bg-midnight-sapphire`, `bg-alabaster-parchment`, `text-damascus-gold`, `text-deep-garnet`, `border-horizon-mist`, `font-headline`, `font-body`, `text-persian-indigo`, `text-ash-slate`) so the Muharram theme remap in `src/styles.css` recolors them automatically — no per-component theme branching.

The HTML uses Inter; project standard is **Hanken Grotesk** (body) + **Playfair Display** (headline). Keep project fonts — do NOT introduce Inter (this is one of the project-memory rules). All other dimensions, spacing, ornament details, and class rhythm follow the HTML 1:1.

### Route rewrites (existing files, no new routes)

- `src/routes/press.tsx` — replace the current list UI with `<PressHero featured={data.articles[0]} /> + <PressFeedItem mode="public" />` rows. Keep current `beforeLoad` redirect (logged-in → dashboard) and `head()`.
- `src/routes/press.$slug.tsx` — replace the current reader UI with `<ArticleHero> + <ArticleOutsetImage> + <ArticleReadingCanvas backTo="/press">`. Keep loader, redirect, and meta logic.
- `src/routes/_authenticated/dashboard.press.index.tsx` — same `<PressHero>` + `<PressFeedItem mode="member">` rows, still inside `<MemberPageShell>`. Members-only items show the "MEMBERS ONLY" eyebrow already present in the data.
- `src/routes/_authenticated/dashboard.press.$slug.tsx` — `<ArticleHero> + <ArticleOutsetImage> + <ArticleReadingCanvas backTo="/dashboard/press">` inside `<MemberPageShell>`.

### Data fields used

From existing functions (no migration): `id, slug, title, excerpt, body_md, cover_image_url, published_at, audience_visibility`. The author sidebar shows the article author when present (`author_name`, `author_bio`, `author_avatar_url` if those columns exist; otherwise hide gracefully — confirm shape during implementation by reading `youth-press.functions.ts` types).

## 3. Out of scope

- No backend / migration changes.
- No new admin UI.
- No new theme tokens — relies on the existing 3-layer system already in `src/styles.css` and `src/lib/jiy/themes.ts`.

## Files

**Edited:** `src/routes/index.tsx`, `src/routes/press.tsx`, `src/routes/press.$slug.tsx`, `src/routes/_authenticated/dashboard.press.index.tsx`, `src/routes/_authenticated/dashboard.press.$slug.tsx`

**Created:** `src/components/press/PressHero.tsx`, `PressFeedItem.tsx`, `PressDivider.tsx`, `ArticleHero.tsx`, `ArticleOutsetImage.tsx`, `ArticleReadingCanvas.tsx`, `ArticleEndmark.tsx`
