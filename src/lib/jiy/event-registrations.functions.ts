import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const registerSchema = z.object({
  idempotencyKey: z.string().min(8),
  eventId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const registerForEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => registerSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { checkIdempotency, writeAudit } = await import("./idempotency.server");
    const { enqueueNotification } = await import("./notifications.server");

    const idem = await checkIdempotency<{ id: string }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (idem.cached) return idem.cached;

    // Capacity + event-status enforcement is handled by the DB trigger.
    const { data: row, error } = await context.supabase
      .from("event_registrations")
      .insert({
        event_id: data.eventId,
        user_id: context.userId,
        notes: data.notes ?? null,
        check_in_status: "registered",
      })
      .select("id")
      .single();
    if (error) {
      // Surface friendly errors; trigger raises 'CONFLICT: ...' messages.
      throw new Error(error.message);
    }

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "event.registered",
      entity: "event_registrations",
      entityId: row.id,
      metadata: { event_id: data.eventId },
    });

    await enqueueNotification({
      recipientId: context.userId,
      channel: "in_app",
      templateKey: "event.registration_confirmed",
      payload: { event_id: data.eventId, registration_id: row.id },
    });

    await idem.complete({ id: row.id });
    return { id: row.id };
  });

const cancelSchema = z.object({
  idempotencyKey: z.string().min(8),
  registrationId: z.string().uuid(),
});

export const cancelMyRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => cancelSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { checkIdempotency, writeAudit } = await import("./idempotency.server");
    const idem = await checkIdempotency<{ ok: true }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (idem.cached) return idem.cached;

    const { error } = await context.supabase
      .from("event_registrations")
      .update({
        check_in_status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", data.registrationId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "event.registration_cancelled",
      entity: "event_registrations",
      entityId: data.registrationId,
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const listMyRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("event_registrations")
      .select(
        "id, event_id, check_in_status, registered_at, checked_in_at, cancelled_at, notes, events(id, title, starts_at, location)",
      )
      .eq("user_id", context.userId)
      .order("registered_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { registrations: data ?? [] };
  });

const rosterSchema = z.object({ eventId: z.string().uuid() });

export const listEventRoster = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => rosterSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("event_registrations")
      .select("id, user_id, check_in_status, registered_at, checked_in_at, cancelled_at, notes")
      .eq("event_id", data.eventId)
      .order("registered_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { registrations: rows ?? [] };
  });

const checkInSchema = z.object({
  idempotencyKey: z.string().min(8),
  registrationId: z.string().uuid(),
});

export const checkInRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => checkInSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (idem.cached) return idem.cached;

    const { error } = await context.supabase
      .from("event_registrations")
      .update({
        check_in_status: "checked_in",
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", data.registrationId);
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "event.checked_in",
      entity: "event_registrations",
      entityId: data.registrationId,
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("id, channel, template_key, payload, status, scheduled_for, sent_at, created_at")
      .eq("recipient_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { notifications: data ?? [] };
  });