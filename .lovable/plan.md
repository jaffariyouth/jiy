## Draft/Publish for public pages + reliable image uploads with gallery

Three changes, all scoped to the admin side. Public pages keep using `getHomepageData` / `getTeamPageData` — they'll just read from a "published" column instead of the live one.

### 1. Draft + Publish workflow for site content

Today `site_content.content` is what `/` and `/team` render. Saving in admin overwrites it immediately. Split that into two states so admin work stays private until explicitly published.

**Schema (migration on `public.site_content`)**:
- Add `draft_content jsonb default '{}'::jsonb not null`
- Add `published_content jsonb default '{}'::jsonb not null`
- Add `draft_updated_at timestamptz`, `published_at timestamptz`, `published_by uuid`
- Backfill: `update site_content set published_content = content, draft_content = content`
- Drop the old `content` column once backfilled

**Server functions (`site-content.functions.ts`)**:
- `getHomepageData` / `getTeamPageData` → read `published_content` (public never sees drafts)
- `getSectionContent` (admin) → return both `draft_content` and `published_content` plus a `has_unpublished_changes` flag
- `updateSectionContent` (admin) → writes to `draft_content` only; no public impact
- New `publishSectionContent` (admin) → copies `draft_content` → `published_content`, sets `published_at` / `published_by`, audit-logs `site_content.published`

**Admin UI (`SectionEditor`)**:
- Keep "Save changes" button (saves draft).
- Add "Publish" button next to it. Disabled when draft matches published.
- Status pill: "Draft" / "Published" / "Unpublished changes" with the last-published timestamp.
- Invalidate `["site_content", key]` after save, plus `["homepage"]` / `["team-page"]` only after publish.

### 2. Storage RLS for `editorial-media`

`storage.objects` has RLS enabled but **zero policies** for this bucket, which is why uploads silently fail in some browser sessions (the dashboard works because it uses service role). Add policies via migration:

- `SELECT` to `anon, authenticated` for any object in `editorial-media` (bucket is public).
- `INSERT / UPDATE / DELETE` to `authenticated` where `public.has_role(auth.uid(), 'admin')`.

This makes admin uploads work consistently and keeps non-admins out.

### 3. Image gallery picker

New component `MediaGalleryPicker` (modal) used by `ImageField`:
- "Choose from gallery" button next to the file input.
- Lists objects from `supabase.storage.from("editorial-media").list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } })`.
- Grid of thumbnails (using `getPublicUrl`), filename and date underneath.
- Click thumbnail → calls `onChange(url)` and closes.
- Optional search box and "All folders / this folder only" toggle (defaults to the editor's folder so e.g. team editors see team images first).
- A small delete (trash) button per image with confirm, calling `storage.remove([path])`. Gated by the same admin storage policy from §2.

`ImageField` keeps file upload, URL paste, and remove; gallery is the new third option.

### Technical notes

- Public loaders are unchanged in shape — just the column they project from changes. No public route needs to opt into "drafts".
- `SectionEditor`'s mutation invalidates the section query on save; publishing additionally invalidates `["homepage"]` and `["team-page"]` so the public page picks it up on next nav.
- Press articles and events already have their own draft/publish flow — no changes needed there.
- The `has_unpublished_changes` flag is computed server-side via `draft_content <> published_content` so we don't need to ship two payloads to compare on the client beyond what the editor already loads.

### Files touched

- `supabase/migrations/*` — schema + storage policies
- `src/lib/jiy/site-content.functions.ts` — column rename, new `publishSectionContent`, return shape
- `src/components/admin/SectionEditor.tsx` — Save/Publish buttons, status pill, smarter invalidation
- `src/components/admin/MediaGalleryPicker.tsx` — new modal component
- `src/components/admin/SectionEditor.tsx` (`ImageField`) — wire up gallery button
