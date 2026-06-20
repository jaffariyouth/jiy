## Scan results — admin editing of public pages

Reviewed every public-page editor, the shared `SectionEditor`, the `site_content` server functions, and the storage flow. Coverage is comprehensive and correct, with one small gap worth fixing.

### What works (no change needed)

**Homepage (`/`)** — every section on the public page has a matching editor at `/admin/homepage/*`:

| Public section   | Editor route                | Text / paragraphs | Images                |
| ---------------- | --------------------------- | ----------------- | --------------------- |
| Hero             | `/admin/homepage/hero`      | ✓ kicker, headlines, body, quote, CTAs, socials | ✓ hero photo |
| Metrics          | `/admin/homepage/metrics`   | ✓ value/label, add/remove | — |
| About            | `/admin/homepage/about`     | ✓ all paragraphs, directives | ✓ 3 photos |
| Ongoing          | `/admin/homepage/ongoing`   | ✓ narrative, CTA, initiatives | ✓ center photo |
| Strategic Values | `/admin/homepage/values`    | ✓ items add/remove | — |
| Press            | `/admin/homepage/press`     | ✓ kickers/labels  | — (uses Press articles) |
| Footer           | `/admin/homepage/footer`    | ✓ tagline, nav, socials, copyright | — |

**Team (`/team`)** — full coverage at `/admin/team/*`: hero (with arch photo), intro, leadership (bio + photo + email + linkedin, reorder/remove), members (photo + name + role + region, reorder/remove), join CTA.

**Press articles** — `/admin/press` list + `/admin/press/new` + `/admin/press/$id` cover full markdown body, excerpt, cover image upload, audience targeting, featured-on-home toggle, publish/unpublish/delete.

**Events** — `/admin/events/new` and `/admin/events/$id` support cover image upload + all event fields.

**Infrastructure that's already correct:**
- All uploads go to the `editorial-media` Supabase Storage bucket (already public).
- `SectionEditor` is gated by `requireSupabaseAuth` + `assertAdmin` on the server.
- `updateSectionContent` writes to `site_content` and audit-logs the change.
- The `ImageField` supports both file upload and pasting a URL, with a remove button.
- Saves invalidate React Query caches so the editor reflects the new state immediately.

### One gap to fix

`SectionEditor` invalidates `["site_content", key]` and `["homepage"]` after a save, but **not** `["team-page"]`. That means after an admin saves a Team Hero / Intro / Leadership / Members / CTA / Footer section, the public `/team` page still shows the old content until a hard refresh.

**Fix:** in `src/components/admin/SectionEditor.tsx` `onSuccess`, also invalidate `["team-page"]`. One-line change.

### Technical detail

```ts
// src/components/admin/SectionEditor.tsx, inside mutation onSuccess
qc.invalidateQueries({ queryKey: ["site_content", sectionKey] });
qc.invalidateQueries({ queryKey: ["homepage"] });
qc.invalidateQueries({ queryKey: ["team-page"] }); // add this
```

No schema, RLS, or storage changes required. After this fix, every public-page text/image/paragraph an admin edits will appear on the live site on the next navigation without a manual reload.
