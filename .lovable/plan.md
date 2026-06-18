## Audience targeting for published content

Give admins per-item audience controls (visibility, gender, age range) on events, announcements, press articles, and recurring events. Non-matching users don't see the item at all (RLS-enforced).

### 1. Profile additions

Add to `profiles`:
- `gender` text — `'male' | 'female' | 'prefer_not_to_say'`
- `date_of_birth` date (nullable)

Add a computed helper:
- `public.profile_age(_user_id uuid)` → int, SECURITY DEFINER, from `date_of_birth`.
- `public.profile_age_bucket(_user_id uuid)` → text, returns `'junior' | '18_24' | '25_plus'` (12–17 / 18–24 / 25+).

Onboarding (step-1 or step-2): add gender select and DOB picker. Existing profiles without these values are treated as "unknown" and only see items targeted to "all".

### 2. Audience columns on each content table

Add the same three columns to `events`, `announcements`, `youth_press_articles`, `recurring_events`:

- `audience_visibility` text — `'public' | 'members'` (default `'members'`; `events` keeps existing `is_member_only` in sync via trigger for back-compat, then we deprecate it).
- `audience_gender` text — `'all' | 'male' | 'female'` (default `'all'`).
- `audience_min_age` int (nullable)
- `audience_max_age` int (nullable)

Min/max age supports the requested presets (12–17, 18–24, 25+) AND arbitrary custom ranges. Admin UI offers preset chips + a "Custom range" option. Multiple categories = leave min/max wide and use chip multi-select that resolves to the encompassing range (v1 keeps it as a single range; multi-bucket support can come later if needed).

### 3. Server-side gate (SECURITY DEFINER)

```sql
public.can_view_audience(_user_id uuid, _vis text, _gender text, _min int, _max int) returns boolean
```

Rules:
- `_vis = 'public'` → true for everyone (anon too).
- `_vis = 'members'` → caller must be authenticated.
- Gender: `'all'` passes; otherwise profile gender must match.
- Age: if min/max set, profile DOB must produce an age inside the range. Profiles with no DOB fail any age-restricted check.

### 4. RLS updates

Replace existing "published & not member-only / member" SELECT policies on the four tables with:

```sql
USING (
  status = 'published'  -- or equivalent per table
  AND public.can_view_audience(auth.uid(), audience_visibility, audience_gender, audience_min_age, audience_max_age)
)
```

Admin policies (`has_role(... 'admin')`) stay unchanged so editors still see drafts.

For `announcements` and `recurring_events` (no public anon path today), keep `TO authenticated`. For `events` and `youth_press_articles` (already have public reads), add `TO anon, authenticated` only when `audience_visibility='public'`.

### 5. Server function updates

In `events.functions.ts`, `announcements.functions.ts`, `youth-press.functions.ts`, `recurring-events.functions.ts`:

- Extend create/update Zod schemas with the four audience fields.
- Public list fns (`listPublicEvents`, public press list) filter on `audience_visibility='public'` and pass age/gender filters through RLS automatically (using the publishable-key server client, which respects RLS as anon).
- Member list fns rely on RLS; no extra filtering needed.

### 6. Admin UI

New reusable `<AudiencePanel />` in `src/components/admin/AudiencePanel.tsx` with:
- Visibility radio: Public / Members only
- Gender radio: Everyone / Men / Women
- Age: preset chips (Juniors 12–17, 18–24, 25+, All ages) + Custom (two number inputs)

Mount it in:
- `admin.events.new.tsx`, `admin.events.$id.tsx`
- `admin.announcements.tsx` (in the edit dialog/form)
- `admin.press.$id.tsx`, `admin.press.new.tsx`
- `admin.recurring.tsx` create/edit form

### 7. Onboarding

Update `onboarding.step-1.tsx` (or wherever profile basics are captured) to collect `gender` + `date_of_birth`. `updateMyProfile` server fn already accepts arbitrary profile patches — extend its Zod schema.

### Out of scope (v1)

- Multi-bucket targeting (e.g. "Juniors AND 25+ but not 18–24"). Single contiguous range only.
- Country/region targeting.
- Per-user override lists.

### Files touched

- Migration: profiles columns, four content-table columns, `profile_age`, `profile_age_bucket`, `can_view_audience`, updated RLS policies.
- `src/lib/jiy/profiles.functions.ts` — extend update schema.
- `src/lib/jiy/events.functions.ts`, `announcements.functions.ts`, `youth-press.functions.ts`, `recurring-events.functions.ts` — extend schemas.
- `src/components/admin/AudiencePanel.tsx` (new).
- `src/routes/_authenticated/admin.events.new.tsx`, `admin.events.$id.tsx`, `admin.announcements.tsx`, `admin.press.$id.tsx`, `admin.press.new.tsx`, `admin.recurring.tsx`, `onboarding.step-1.tsx`.
