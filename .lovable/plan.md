# Stage A2 — Opportunities & Shop Waitlist

Build out the two remaining public/member content surfaces from the original plan. No email work in this stage.

## 1. Opportunities

A curated board of external scholarships, fellowships, jobs, and calls-for-papers that the JIY team posts for members.

**New table `opportunities`:**
- `title`, `slug`, `summary`, `body` (markdown), `category` (enum: scholarship | fellowship | job | cfp | other), `organization`, `location`, `url` (external apply link), `deadline` (timestamptz, nullable), `cover_image_url`, `status` (draft | published | archived), `published_at`, `created_by`.
- Standard `created_at` / `updated_at` + trigger.
- GRANTs: `authenticated` full; `service_role` all; `anon` SELECT (board is public-readable when published).
- RLS:
  - Anyone (anon + authenticated) can read rows where `status='published'`.
  - Admins (`has_role(auth.uid(),'admin')`) can do everything.

**Server functions** in `src/lib/jiy/opportunities.functions.ts`:
- `listPublishedOpportunities({ category?, limit?, offset? })` — public.
- `getOpportunityBySlug(slug)` — public, published only.
- `listAllOpportunitiesAdmin()` — admin-only via `requireSupabaseAuth` + role check.
- `upsertOpportunity(input)` — admin.
- `deleteOpportunity(id)` — admin.

**Routes:**
- Replace placeholder `src/routes/opportunities.tsx` with real listing (filter chips by category, deadline sort, card grid using JIY editorial tokens).
- `src/routes/opportunities.$slug.tsx` — detail page with cover, summary, body, deadline, "Apply" CTA opening `url` in new tab. Head metadata derived from row (title, description, og:image = cover).
- `src/routes/admin/opportunities.tsx` — admin list + create/edit drawer mirroring the existing `admin/announcements` pattern (table, status badges, publish toggle, slug auto-gen).

**Navigation:** add "Opportunities" link in admin sidebar (where Announcements/Events live).

## 2. Shop — Coming Soon + Waitlist

No commerce yet. A teaser page that collects emails for launch notification.

**New table `shop_waitlist`:**
- `email` (citext, unique), `user_id` (nullable fk to auth.users), `source` (text, default 'shop_page'), `created_at`.
- GRANTs: `anon` + `authenticated` INSERT; `service_role` all. No SELECT for anon/authenticated (admin-only via service_role / admin policy).
- RLS:
  - Insert allowed for anyone (anon + authenticated) with a valid email.
  - Select restricted to admins.

**Server fn** `src/lib/jiy/shop.functions.ts`:
- `joinShopWaitlist({ email })` — public, zod-validates email, inserts with `on conflict do nothing`, attaches `user_id` when session present.
- `listShopWaitlistAdmin()` — admin only.

**Route:** replace placeholder `src/routes/shop.tsx` with editorial "Coming Soon" hero + waitlist form (email field, submit, success state). Optional admin view at `src/routes/admin/shop-waitlist.tsx` (simple table + CSV export button using client-side blob).

## 3. Out of scope (intentionally deferred)

- All Track B email work (pgmq drain worker, React Email templates, transactional sends, auth email templates, notification prefs). Stays paused until DNS is ready.
- Real Stripe checkout for the shop.
- Saving/bookmarking opportunities per member (can add later if requested).

## Technical notes

- Migration runs first (single call) creating both tables with GRANTs + RLS + admin policies using existing `has_role` security-definer.
- Server fns follow existing `src/lib/jiy/*.functions.ts` patterns (`createServerFn`, zod `inputValidator`, `requireSupabaseAuth` middleware for admin/mutation fns).
- UI reuses JIY tokens (`headline-*`, `form-title`, `margin-safe`, `gap-section`, midnight-sapphire / damascus-gold) and shadcn primitives already in the project. Responsive header rows use the `grid-cols-[minmax(0,1fr)_auto] sm:flex` pattern per project memory.
- Admin opportunity editor uses the same markdown textarea + cover image upload helper as announcements.

## Open question

For `opportunities.cover_image_url`: reuse the existing `site-content` storage bucket pattern (admin upload + signed/public URL), or skip cover images for v1 and ship text-only cards? Default if you don't answer: reuse existing bucket, cover image optional.
