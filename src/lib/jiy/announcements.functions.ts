import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const baseSchema = z.object({
  idempotencyKey: z.string().min(8),
  title: z.string().min(1).max(200),
  body_md: z.string().max(50_000).default(""),
  pinned: z.boolean().optional(),
  audience_visibility: z.enum(["public", "members"]).optional(),
  audience_gender: z.enum(["all", "male", "female"]).optional(),
  audience_min_age: z.number().int().min(0).max(120).nullable().optional(),
  audience_max_age: z.number().int().min(0).max(120).nullable().optional(),
});

export const listPublishedAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("announcements")
      .select("id, title, body_md, pinned, published_at, created_at")
      .eq("status", "published")
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { announcements: data ?? [] };
  });

export const listAllAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("announcements")
      .select("id, title, body_md, status, pinned, published_at, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { announcements: data ?? [] };
  });

export const getAnnouncement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("announcements")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return { announcement: row };
  });

export const createAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => baseSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ id: string }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { data: row, error } = await context.supabase
      .from("announcements")
      .insert({
        title: data.title,
        body_md: data.body_md,
        pinned: data.pinned ?? false,
        status: "draft",
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "announcement.created", entity: "announcements", entityId: row.id });
    await idem.complete({ id: row.id });
    return { id: row.id };
  });

export const updateAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => baseSchema.partial().extend({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { id, idempotencyKey: _ik, ...patch } = data;
    const { error } = await context.supabase.from("announcements").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "announcement.updated", entity: "announcements", entityId: id });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const publishAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { error } = await context.supabase
      .from("announcements")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "announcement.published", entity: "announcements", entityId: data.id });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const deleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { error } = await context.supabase.from("announcements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "announcement.deleted", entity: "announcements", entityId: data.id });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });
