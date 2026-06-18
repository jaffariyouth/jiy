# Admin Console — Event creation + Form builder pass

## 1. Diagnose the broken Create button

The session replay shows a Vite error overlay appearing right after navigating to `/admin/events/new`. The most likely causes (will confirm in step 2 by invoking the server fn):

- `createEvent` validator requires `starts_at` as a full ISO 8601 datetime, but `<input type="datetime-local">` returns `"2026-06-20T19:30"` — passing that through `new Date(...).toISOString()` only works if a value was entered; with an empty string it returns `Invalid Date` and the submit throws before reaching the server.
- No client-side `try/catch` around `mut.mutate()`, so a thrown validation error inside `mutationFn` surfaces as an unhandled error overlay instead of a toast.
- The form sends `description: undefined` etc., but the server validator uses `.optional()` which is fine — not the cause.

**Fix:** guard the date conversion, wrap the submit in try/catch surfacing toast, and only send keys that have values.

## 2. Rebuild `/admin/events/new` so it matches the editor

Add the missing fields admins need at creation time (currently only on the edit page):

- Ends at (`datetime-local`, optional, must be after starts)
- Cover image upload → reuses `editorial-media` bucket and stores the public URL in `cover_image_url`
- Attach form template (select populated from `listFormTemplates`, allows "None")
- Requires payment toggle (no price field yet — Stripe scaffolding stays placeholder)
- Members-only stays

Behavior:
- Submit creates a **draft** event (current behavior preserved).
- After success, redirect to `/admin/events/$id` so admin can publish from the editor.
- All errors → `toast.error(message)`.

## 3. Expand the form builder (Gravity-Forms-but-easier)

### New field types
Extend `FormFieldDef.type` enum in `src/lib/jiy/form-templates.functions.ts` and `FormBuilder.tsx`:

- `radio` — single-choice (options[])
- `file` — single file upload to `editorial-media`, stores URL in submission
- `section` — section header (label + optional description, not a real input)
- `paragraph` — read-only rich text block (markdown rendered, no input)

The public renderer at `/forms/$templateId` extends Zod schema generation to handle each new type (`section`/`paragraph` skipped from validation).

### Per-form settings
Add a `settings` JSONB column to `form_templates` (or nest under `schema.settings`) with:

- `confirmationMessage` (markdown shown after submit; defaults to "Thank you.")
- `redirectUrl` (optional internal path like `/dashboard` or external URL; replaces confirmation when set)
- `notificationEmail` (optional admin email; **stored only**, real send wired when Resend is configured — same pattern as Stripe scaffolding)

UI: new "Settings" tab on `/admin/forms/$id` alongside the existing Fields tab.

### Conditional logic
Per-field `visibility` rule:

```ts
visibility?: { fieldId: string; operator: "equals" | "not_equals" | "is_empty" | "is_not_empty"; value?: string }
```

- Editor: small "Show this field when…" panel under each field, with a dropdown of prior field IDs + operator + value input (auto-hidden for `is_empty`/`is_not_empty`).
- Live preview + public renderer evaluate the rule against current form values; hidden fields skip validation.
- One level of dependency only (no chained/AND/OR) to keep it "easier than Gravity".

## 4. Wire the form picker into events

- New-event page and edit page both use the same `<FormTemplatePicker />` (queries `listFormTemplates`).
- Selecting a template stores `form_template_id` on the event.
- Existing public form route already supports `?event=<id>` → no server changes needed there.

## 5. Verification

After the build flips back to build mode I will:

1. `invoke-server-function` → `createEvent` with a valid payload, confirm 200 + audit row.
2. Open `/admin/events/new`, fill all fields, submit, confirm redirect to `/admin/events/$id`.
3. Open `/admin/forms`, create "Test form", add a radio + file + section + a conditional field, save.
4. Attach that template to the event, visit the public `/forms/<id>?event=<id>` link, submit, confirm row in `form_submissions` and registration created.

## Technical notes (for reference)

- **Migration:** add `settings JSONB DEFAULT '{}'::jsonb` to `form_templates` (only schema change). No new tables.
- **Files touched:**
  - `src/routes/_authenticated/admin.events.new.tsx` — rewrite
  - `src/components/admin/FormTemplatePicker.tsx` — new
  - `src/components/admin/FormBuilder.tsx` — new types + visibility editor + settings tab host
  - `src/components/admin/FormSettingsPanel.tsx` — new
  - `src/routes/_authenticated/admin.forms.$id.tsx` — Tabs (Fields / Settings)
  - `src/routes/forms.$templateId.tsx` — new field types + visibility eval + redirect/confirmation handling
  - `src/lib/jiy/form-templates.functions.ts` — extend Zod schema, accept `settings`
  - 1 migration file
- **Out of scope:** Stripe price collection UI, Resend wiring, multi-page forms, file-upload virus scanning, multi-level conditional chains.

## Open question (won't block)

For file-upload fields: limit to images only, or accept any file type (PDF, docs)? I'll default to "any file ≤ 10 MB" unless you say otherwise.
