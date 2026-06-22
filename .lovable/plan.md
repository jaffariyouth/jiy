## Goals

1. Make event cover-image upload work like the homepage editor: file picker **plus** a "Browse gallery" button that opens `MediaGalleryPicker` (scoped to `events/` in the `editorial-media` bucket).
2. Verify the saved `cover_image_url` flows through to the Upcoming Events cards and the event detail poster (they already read `cover_image_url`, but I'll confirm and tighten the fallback).
3. Add **Save Draft** as a separate action from **Publish**, plus **Schedule publish** (pick a future date/time; event auto-publishes then).

## What changes

### A. Shared event cover uploader
- New component `src/components/admin/EventCoverPicker.tsx`:
  - Preview of current image
  - "Upload new" file input → uploads to `editorial-media/events/{eventId|new}/...`
  - "Browse gallery" button → opens `MediaGalleryPicker` with `defaultFolder="events"` (gallery already supports remove/select)
  - "Remove" button
- Use it in both `admin.events.new.tsx` and `admin.events.$id.tsx` in place of the bare `<input type="file">`.
- Small tweak to `MediaGalleryPicker`: allow folders outside `homepage/` (currently the "All" scope walks `homepage/` only — add an `allFolderPrefix` prop so events use `events/`).

### B. Cover image rendering
- `UpcomingEvents.tsx`, `dashboard.events.index.tsx`, `events.index.tsx`, `events.$eventId.tsx`, `dashboard.events.$eventId.tsx` already render `cover_image_url`. Audit each: when missing, show the existing JIY placeholder (already in place on most). No data-shape changes needed — fix is just confirming the URL persists end-to-end after the picker change.

### C. Draft / Publish / Schedule

DB migration:
```sql
alter table public.events
  add column if not exists publish_at timestamptz;
create index if not exists events_publish_at_idx
  on public.events (publish_at) where status = 'draft' and publish_at is not null;
```
No enum change — scheduled events stay `status='draft'` until cron flips them, so existing member/public reads keep working unchanged.

Server functions (`src/lib/jiy/events.functions.ts`):
- Extend `createEventSchema` / `updateEventSchema` with optional `publish_at: string | null`.
- `createEvent` already inserts as `draft` → reused for "Save draft".
- New `schedulePublish` server fn: admin-only, sets `publish_at` and ensures `status='draft'`.
- New `unschedulePublish` server fn: clears `publish_at`.
- `publishEvent` stays as the immediate-publish path; also clears `publish_at`.

Cron route (`src/routes/api/public/cron/publish-scheduled-events.ts`):
- Verifies Supabase anon key in `apikey` header.
- Uses `supabaseAdmin` to `update events set status='published', publish_at=null where status='draft' and publish_at is not null and publish_at <= now()`.
- pg_cron entry runs every 5 min (added via `supabase--insert`, not migration, since URL/key are env-specific).

Admin UI:
- `admin.events.new.tsx`: button row becomes **Save draft** | **Save & publish now** | **Schedule…** (opens datetime input).
- `admin.events.$id.tsx`: header actions become
  - **Save draft** (always)
  - **Publish now** (when `draft`)
  - **Schedule publish** / **Reschedule** / **Unschedule** (shows current `publish_at` if set)
  - **Cancel** (when `published`)
  - **Duplicate**
- Subtitle shows "Draft", "Scheduled for {date}", "Published", or "Cancelled".

### Out of scope
- Image cropping/resizing.
- Sending notifications when scheduled events auto-publish (can add later).
- Changing public/member route filtering — scheduled events appear automatically once cron flips them.

## Files

- create `src/components/admin/EventCoverPicker.tsx`
- create `src/routes/api/public/cron/publish-scheduled-events.ts`
- edit `src/components/admin/MediaGalleryPicker.tsx` (add `allFolderPrefix` prop)
- edit `src/lib/jiy/events.functions.ts` (schemas + `schedulePublish` / `unschedulePublish`, clear `publish_at` on publish/cancel)
- edit `src/routes/_authenticated/admin.events.new.tsx`
- edit `src/routes/_authenticated/admin.events.$id.tsx`
- migration: add `publish_at` column + partial index
- supabase insert: pg_cron schedule calling the new route every 5 min
