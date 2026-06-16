import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const isStripeConfigured = createServerFn({ method: "GET" }).handler(async () => {
  return { configured: Boolean(process.env.STRIPE_SECRET_KEY) };
});

export const setEventPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      idempotencyKey: z.string().min(8),
      eventId: z.string().uuid(),
      requires_payment: z.boolean(),
      price_cents: z.number().int().min(0).default(0),
      currency: z.string().length(3).default("usd"),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;

    const { error: payErr } = await context.supabase
      .from("event_payments")
      .upsert(
        {
          event_id: data.eventId,
          requires_payment: data.requires_payment,
          price_cents: data.price_cents,
          currency: data.currency,
        },
        { onConflict: "event_id" },
      );
    if (payErr) throw new Error(payErr.message);

    const { error: evErr } = await context.supabase
      .from("events")
      .update({ requires_payment: data.requires_payment })
      .eq("id", data.eventId);
    if (evErr) throw new Error(evErr.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "event.payment_configured",
      entity: "events",
      entityId: data.eventId,
      metadata: { requires_payment: data.requires_payment, price_cents: data.price_cents },
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ eventId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Payments not configured — ask an admin to add Stripe keys.");
    }
    const { data: pay, error } = await context.supabase
      .from("event_payments")
      .select("price_cents, currency, requires_payment")
      .eq("event_id", data.eventId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!pay || !pay.requires_payment) throw new Error("This event is free.");

    // Stripe SDK call lives here once keys are added. Scaffold returns
    // a placeholder so the UI flow is wired end-to-end.
    return {
      pending: true as const,
      message: "Stripe configured. Implement Checkout session creation here.",
    };
  });
