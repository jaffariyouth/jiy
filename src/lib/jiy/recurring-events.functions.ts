import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const baseSchema = z.object({
  idempotencyKey: z.string().min(8),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex),
  description_md: z.string().max(20_000).default(""),
  cadence_rrule: z.string().max(500).optional(),
  cadence_label: z.string().max(200).optional(),
  location: z.string().max(500).optional(),
  default_capacity: z.number().int().min(0).optional(),
  cover_image_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
});

export const listActiveRecurringEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("recurring_events")
      .select("*")
      .eq("is_active", true)
      .order("title");
    if (error) throw new Error(error.message);
    return { recurring: data ?? [] };
  });

export const listAllRecurringEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("recurring_events")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { recurring: data ?? [] };
  });

export const getRecurringEvent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("recurring_events")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return { recurring: row };
  });

export const createRecurringEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => baseSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ id: string }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { idempotencyKey: _ik, ...insert } = data;
    const { data: row, error } = await context.supabase
      .from("recurring_events")
      .insert(insert)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "recurring.created", entity: "recurring_events", entityId: row.id });
    await idem.complete({ id: row.id });
    return { id: row.id };
  });

export const updateRecurringEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => baseSchema.partial().extend({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { id, idempotencyKey: _ik, ...patch } = data;
    const { error } = await context.supabase.from("recurring_events").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "recurring.updated", entity: "recurring_events", entityId: id });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });
