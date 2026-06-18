import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads ----------

export const listPublicEvents = createServerFn({ method: "GET" }).handler(async () => {
  // Public read — use admin client with explicit safe-column projection +
  // strict WHERE filter (matches knowledge guidance for public reads).
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("id, title, description, location, starts_at, ends_at, capacity, cover_image_url")
    .eq("status", "published")
    .eq("is_member_only", false)
    .order("starts_at", { ascending: true })
    .limit(100);
  if (error) throw new Error(error.message);
  return { events: data ?? [] };
});

// ---------- Member-only reads ----------

export const listMemberEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("events")
      .select("id, title, description, location, starts_at, ends_at, capacity, is_member_only, status, cover_image_url")
      .eq("status", "published")
      .order("starts_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return { events: data ?? [] };
  });

// ---------- Admin reads ----------

export const getEventAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("events")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return { event: row };
  });

// ---------- Admin mutations ----------

const audienceFields = {
  audience_visibility: z.enum(["public", "members"]).optional(),
  audience_gender: z.enum(["all", "male", "female"]).optional(),
  audience_min_age: z.number().int().min(0).max(120).nullable().optional(),
  audience_max_age: z.number().int().min(0).max(120).nullable().optional(),
};

const createEventSchema = z.object({
  idempotencyKey: z.string().min(8),
  title: z.string().min(1).max(200),
  description: z.string().max(50_000).optional(),
  location: z.string().max(500).optional(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime().optional(),
  capacity: z.number().int().min(0).optional(),
  is_member_only: z.boolean().default(false),
  cover_image_url: z.string().url().optional(),
  form_template_id: z.string().uuid().nullable().optional(),
  requires_payment: z.boolean().optional(),
  ...audienceFields,
});

export const createEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createEventSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);

    const idem = await checkIdempotency<{ id: string }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (idem.cached) return idem.cached;

    const { data: row, error } = await context.supabase
      .from("events")
      .insert({
        title: data.title,
        description: data.description ?? null,
        location: data.location ?? null,
        starts_at: data.starts_at,
        ends_at: data.ends_at ?? null,
        capacity: data.capacity ?? null,
        is_member_only: data.is_member_only,
        cover_image_url: data.cover_image_url ?? null,
        form_template_id: data.form_template_id ?? null,
        requires_payment: data.requires_payment ?? false,
        audience_visibility: data.audience_visibility ?? (data.is_member_only ? "members" : "public"),
        audience_gender: data.audience_gender ?? "all",
        audience_min_age: data.audience_min_age ?? null,
        audience_max_age: data.audience_max_age ?? null,
        created_by: context.userId,
        status: "draft",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "event.created",
      entity: "events",
      entityId: row.id,
    });
    await idem.complete({ id: row.id });
    return { id: row.id };
  });

const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().uuid(),
  idempotencyKey: z.string().min(8),
});

export const updateEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateEventSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);

    const idem = await checkIdempotency<{ ok: true }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (idem.cached) return idem.cached;

    const { id, idempotencyKey: _ik, ...patch } = data;
    const { error } = await context.supabase.from("events").update(patch).eq("id", id);
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "event.updated",
      entity: "events",
      entityId: id,
      metadata: { fields: Object.keys(patch) },
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

const transitionSchema = z.object({
  id: z.string().uuid(),
  idempotencyKey: z.string().min(8),
});

export const publishEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => transitionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { error } = await context.supabase
      .from("events")
      .update({ status: "published" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "event.published",
      entity: "events",
      entityId: data.id,
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const cancelEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => transitionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { error } = await context.supabase
      .from("events")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "event.cancelled",
      entity: "events",
      entityId: data.id,
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });
export const duplicateEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ id: string }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { data: src, error: srcErr } = await context.supabase
      .from("events").select("*").eq("id", data.id).maybeSingle();
    if (srcErr) throw new Error(srcErr.message);
    if (!src) throw new Error("NOT_FOUND");
    const { data: row, error } = await context.supabase
      .from("events")
      .insert({
        title: `${src.title} (copy)`,
        description: src.description,
        location: src.location,
        starts_at: src.starts_at,
        ends_at: src.ends_at,
        capacity: src.capacity,
        is_member_only: src.is_member_only,
        cover_image_url: src.cover_image_url,
        form_template_id: src.form_template_id,
        requires_payment: src.requires_payment,
        created_by: context.userId,
        status: "draft",
      })
      .select("id").single();
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, {
      actorId: context.userId, action: "event.duplicated",
      entity: "events", entityId: row.id, metadata: { source_id: data.id },
    });
    await idem.complete({ id: row.id });
    return { id: row.id };
  });
