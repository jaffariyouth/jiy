import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const fieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["text", "email", "phone", "textarea", "select", "checkbox", "number", "date"]),
  label: z.string().min(1).max(200),
  required: z.boolean().default(false),
  helpText: z.string().max(500).optional(),
  options: z.array(z.string().min(1).max(200)).optional(),
  placeholder: z.string().max(200).optional(),
});

export const formSchemaShape = z.object({ fields: z.array(fieldSchema) });
export type FormFieldDef = z.infer<typeof fieldSchema>;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const baseSchema = z.object({
  idempotencyKey: z.string().min(8),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex),
  schema: formSchemaShape,
});

export const listFormTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("form_templates")
      .select("id, name, slug, schema, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { templates: data ?? [] };
  });

export const getFormTemplate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("form_templates")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return { template: row };
  });

export const createFormTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => baseSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ id: string }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { data: row, error } = await context.supabase
      .from("form_templates")
      .insert({ name: data.name, slug: data.slug, schema: data.schema, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "form_template.created", entity: "form_templates", entityId: row.id });
    await idem.complete({ id: row.id });
    return { id: row.id };
  });

export const updateFormTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => baseSchema.partial().extend({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { id, idempotencyKey: _ik, ...patch } = data;
    const { error } = await context.supabase.from("form_templates").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "form_template.updated", entity: "form_templates", entityId: id });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const deleteFormTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { error } = await context.supabase.from("form_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "form_template.deleted", entity: "form_templates", entityId: data.id });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const submitForm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      idempotencyKey: z.string().min(8),
      templateId: z.string().uuid().nullable(),
      eventId: z.string().uuid().nullable(),
      data: z.record(z.string(), z.any()),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { checkIdempotency, writeAudit } = await import("./idempotency.server");
    const idem = await checkIdempotency<{ id: string }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { data: row, error } = await context.supabase
      .from("form_submissions")
      .insert({
        template_id: data.templateId,
        event_id: data.eventId,
        user_id: context.userId,
        data: data.data as never,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "form.submitted", entity: "form_submissions", entityId: row.id });
    await idem.complete({ id: row.id });
    return { id: row.id };
  });

export const listSubmissionsForEvent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ eventId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("form_submissions")
      .select("id, user_id, data, created_at")
      .eq("event_id", data.eventId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { submissions: rows ?? [] };
  });
