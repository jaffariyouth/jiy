## What's actually wrong

The "redirect" on `/admin/events/new` and the "no complexity" on the forms editor are the **same bug**, and it isn't a redirect at all.

In TanStack Router's flat file convention, `admin.events.tsx` and `admin.events.new.tsx` are not siblings — the second's path extends the first's, so `admin.events.tsx` becomes the **layout** for `/admin/events/*`. The same is true for `admin.forms.tsx` → `admin.forms.$id.tsx`.

Both layout files currently render a full page component (the list) and **no `<Outlet />`**. Result:

- `/admin/events/new` → layout matches, child matches, but layout has no `<Outlet />`, so React renders the events **list** at that URL. Looks like a redirect.
- `/admin/forms/<id>` → same thing. User clicks a form card, lands back on the forms list, and concludes "no complexity / no builder".

The form builder, settings panel, conditional visibility, new event fields, etc. are all already wired — they just never get mounted.

## Fix

Split each parent into a pathless layout + an index leaf:

```text
src/routes/_authenticated/
  admin.events.tsx          → layout: `() => <Outlet />`
  admin.events.index.tsx    → NEW: current list UI (moved from admin.events.tsx)
  admin.events.new.tsx      → unchanged
  admin.events.$id.tsx      → unchanged

  admin.forms.tsx           → layout: `() => <Outlet />`
  admin.forms.index.tsx     → NEW: current list + "New form" dialog
  admin.forms.$id.tsx       → unchanged
```

Steps:
1. Create `admin.events.index.tsx` with the current `AdminEventsList` body and `createFileRoute("/_authenticated/admin/events/")`.
2. Replace `admin.events.tsx` with a minimal layout: `component: () => <Outlet />`.
3. Same split for `admin.forms.tsx` → new `admin.forms.index.tsx`.
4. Let the Vite plugin regenerate `src/routeTree.gen.ts` (no manual edit).

## Verification

- Visit `/admin/events` → list still renders.
- Visit `/admin/events/new` → new-event form renders (cover upload, ends_at, form picker, payment toggle).
- Visit `/admin/forms` → list with "New form" dialog.
- Click a form card → editor with Fields / Settings tabs, drag-and-drop, radio/file/section/paragraph types, visibility rules.

## Out of scope

No changes to server functions, schemas, FormBuilder, or `admin.events.new.tsx` — those are already complete; they were just unreachable.
