## Goal

- Split press and events into **public** (`/press`, `/events`) and **member** (`/dashboard/press`, `/dashboard/events`) views. Members see public + member-only content; public visitors see only public.
- Gate scholar-qa, opportunities, shop (and future resource pages) behind auth and move them under `/dashboard/*` with the member TopNavBar.
- When a signed-in user hits a member-only URL's old public path, redirect to the `/dashboard/*` equivalent.

## Route changes

New member routes (all wrapped by existing `_authenticated` gate, render `TopNavBar` + content):

```
src/routes/_authenticated/
  dashboard.press.tsx          → /dashboard/press         (list, public + member-only)
  dashboard.press.$slug.tsx    → /dashboard/press/:slug
  dashboard.events.index.tsx   → /dashboard/events        (list, public + member-only)
  dashboard.events.$eventId.tsx→ /dashboard/events/:id
  dashboard.scholar-qa.tsx     → /dashboard/scholar-qa
  dashboard.opportunities.tsx  → /dashboard/opportunities
  dashboard.opportunities.$slug.tsx
  dashboard.shop.tsx           → /dashboard/shop
```

Existing `src/routes/_authenticated/dashboard.tsx` (the `/dashboard` index) becomes a layout-friendly leaf — convert to `dashboard.index.tsx` and add `dashboard.tsx` parent rendering `<Outlet />` (so child segments mount).

### Public routes — behavior changes

- `/press`, `/press/:slug`, `/events`, `/events/:eventId`: stay public, public-only content (current filtering already excludes `audience_visibility != 'public'`). Add a small `beforeLoad` redirect: if the user is signed in, `redirect({ to: '/dashboard/press' })` etc.
- `/scholar-qa`, `/opportunities`, `/opportunities/:slug`, `/shop`: **delete** the public files. Add lightweight redirect-only routes (`beforeLoad` → `/dashboard/...`) so old links/bookmarks still work. Unauthenticated visitors hitting these get bounced through `_authenticated` → `/auth`.

## Data layer

`src/lib/jiy/youth-press.functions.ts` and `events.functions.ts` already filter to public via `audience_visibility = 'public'`. Add member-scoped siblings that return public + member content:

- `listMemberArticles()` — same select, drop the public-only filters, still `status = 'published'`.
- `getMemberArticleBySlug(slug)` — same as public but no audience filter.
- `listMemberEvents()` / `getMemberEvent(id)` — same pattern.

Both use `requireSupabaseAuth` middleware so RLS enforces the member gate. No schema changes.

`scholar-questions.functions.ts`, `opportunities.functions.ts`, `shop.functions.ts` stay as-is — they're already used from authenticated context.

## TopNavBar

Update `NAV` in `src/components/dashboard/TopNavBar.tsx` to point at the new URLs:

- Events → `/dashboard/events`
- Scholar Q&A → `/dashboard/scholar-qa`
- The Press → `/dashboard/press`
- RESOURCES → Opportunity Board `/dashboard/opportunities`
- Merch Shop → `/dashboard/shop`

Logo link stays `/dashboard`.

## Member page wrappers

Each `_authenticated/dashboard.*` route renders:

```
<TopNavBar />
<SponsorNotice /> (optional — same as DashboardShell)
<main>{/* reuse existing page body, swap data fn for member variant */}</main>
<DashboardFooter />
```

Press/events list & detail bodies copy the existing public component bodies but call the member data fns. Scholar-qa/opportunities/shop bodies are lifted from the current public files mostly unchanged.

## Redirect helpers

Tiny pattern for public→member redirect when signed-in:

```ts
beforeLoad: async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) throw redirect({ to: "/dashboard/press" });
}
```

Used on `/press`, `/events`. The replaced shop/opportunities/scholar-qa public routes redirect unconditionally to the dashboard equivalent.

## Out of scope

- No DB migrations.
- No changes to admin pages.
- No email/notification work.
- Public `SiteHeader` unchanged (still lists Events/Press for visitors).