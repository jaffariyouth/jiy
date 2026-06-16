import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listFeatureFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("feature_flags")
      .select("id, key, enabled, description, payload, updated_at")
      .order("key");
    if (error) throw new Error(error.message);
    return { flags: data ?? [] };
  });

export const setFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      idempotencyKey: z.string().min(8),
      key: z.string().min(1).max(120),
      enabled: z.boolean(),
      description: z.string().max(500).optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { error } = await context.supabase
      .from("feature_flags")
      .upsert(
        { key: data.key, enabled: data.enabled, description: data.description ?? null },
        { onConflict: "key" },
      );
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "feature_flag.set",
      entity: "feature_flags",
      metadata: { key: data.key, enabled: data.enabled },
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const listAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      limit: z.number().int().min(1).max(500).default(100),
      offset: z.number().int().min(0).default(0),
      action: z.string().optional(),
      entity: z.string().optional(),
    }).parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("audit_log")
      .select("id, actor_id, action, entity, entity_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);
    if (data.action) q = q.eq("action", data.action);
    if (data.entity) q = q.eq("entity", data.entity);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { entries: rows ?? [] };
  });
