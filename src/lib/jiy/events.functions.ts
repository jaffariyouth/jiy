import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// ---------- Public reads ----------

export const listPublicEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabasePublic = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabasePublic
    .from("events")
    .select("id, title, description, location, starts_at, ends_at, capacity, cover_image_url")
    .eq("status", "published")
    .eq("audience_visibility", "public")
    .eq("audience_gender", "all")
    .is("audience_min_age", null)
    .is("audience_max_age", null)
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

export const getMemberEvent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: event, error } = await context.supabase
      .from("events")
      .select(
        "id, title, description, location, starts_at, ends_at, capacity, cover_image_url, category_label, speakers, requires_payment, status, audience_visibility, audience_gender, audience_min_age, audience_max_age, is_member_only",
      )
      .eq("id", data.id)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!event) throw new Error("NOT_FOUND");

    const { data: pay } = await context.supabase
      .from("event_payments")
      .select("price_cents, currency, requires_payment")
      .eq("event_id", data.id)
      .maybeSingle();

    return {
      event,
      payment: pay ?? { price_cents: 0, currency: "usd", requires_payment: false },
    };
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

const speakerSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().max(160).optional().default(""),
  bio: z.string().max(2000).optional().default(""),
  photo_url: z.string().url().or(z.literal("")).optional().default(""),
});

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
  featured_on_home: z.boolean().optional(),
  category_label: z.string().max(120).nullable().optional(),
  speakers: z.array(speakerSchema).max(20).optional(),
  publish_at: z.string().datetime().nullable().optional(),
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
        featured_on_home: data.featured_on_home ?? false,
        audience_visibility: data.audience_visibility ?? (data.is_member_only ? "members" : "public"),
        audience_gender: data.audience_gender ?? "all",
        audience_min_age: data.audience_min_age ?? null,
        audience_max_age: data.audience_max_age ?? null,
        category_label: data.category_label ?? null,
        speakers: data.speakers ?? [],
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
        audience_visibility: src.audience_visibility,
        audience_gender: src.audience_gender,
        audience_min_age: src.audience_min_age,
        audience_max_age: src.audience_max_age,
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

// ---------- Public detail + public registration ----------

function makePublicClient() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    ),
  );
}

export const getPublicEvent = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await makePublicClient();
    const { data: event, error } = await sb
      .from("events")
      .select(
        "id, title, description, location, starts_at, ends_at, capacity, cover_image_url, category_label, speakers, requires_payment, status, audience_visibility, audience_gender, audience_min_age, audience_max_age",
      )
      .eq("id", data.id)
      .eq("status", "published")
      .eq("audience_visibility", "public")
      .eq("audience_gender", "all")
      .is("audience_min_age", null)
      .is("audience_max_age", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!event) throw new Error("NOT_FOUND");

    const { data: pay } = await sb
      .from("event_payments")
      .select("price_cents, currency, requires_payment")
      .eq("event_id", data.id)
      .maybeSingle();

    return {
      event,
      payment: pay ?? { price_cents: 0, currency: "usd", requires_payment: false },
    };
  });

const publicRegisterSchema = z.object({
  eventId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  quantity: z.number().int().min(1).max(10).default(1),
});

export const registerPublicForEvent = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => publicRegisterSchema.parse(i))
  .handler(async ({ data }) => {
    const sb = await makePublicClient();
    // Re-validate event eligibility server-side.
    const { data: event, error: evErr } = await sb
      .from("events")
      .select("id, status, audience_visibility, audience_gender, audience_min_age, audience_max_age, capacity, title")
      .eq("id", data.eventId)
      .maybeSingle();
    if (evErr) throw new Error(evErr.message);
    if (
      !event ||
      event.status !== "published" ||
      event.audience_visibility !== "public" ||
      event.audience_gender !== "all" ||
      event.audience_min_age !== null ||
      event.audience_max_age !== null
    ) {
      throw new Error("This event is not open for public registration.");
    }

    const { data: pay } = await sb
      .from("event_payments")
      .select("price_cents, currency, requires_payment")
      .eq("event_id", data.eventId)
      .maybeSingle();
    const requiresPayment = pay?.requires_payment ?? false;
    const priceCents = pay?.price_cents ?? 0;
    const currency = (pay?.currency ?? "usd").toLowerCase();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Capacity guard (best-effort; race-tolerant).
    if (event.capacity != null) {
      const { count: confirmed } = await supabaseAdmin
        .from("event_public_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", data.eventId)
        .eq("status", "confirmed");
      const { count: authConfirmed } = await supabaseAdmin
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", data.eventId)
        .neq("check_in_status", "cancelled");
      const taken = (confirmed ?? 0) + (authConfirmed ?? 0);
      if (taken + data.quantity > event.capacity) {
        throw new Error("Sorry, this event is full.");
      }
    }

    // Rate-limit: max 5 pending/confirmed rows per email per event in the last hour.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recent } = await supabaseAdmin
      .from("event_public_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", data.eventId)
      .eq("email", data.email)
      .gte("created_at", oneHourAgo);
    if ((recent ?? 0) >= 5) {
      throw new Error("Too many registrations from this email recently. Please try again later.");
    }

    const totalCents = requiresPayment ? priceCents * data.quantity : 0;

    if (!requiresPayment) {
      const { data: row, error } = await supabaseAdmin
        .from("event_public_registrations")
        .insert({
          event_id: data.eventId,
          full_name: data.fullName,
          email: data.email,
          quantity: data.quantity,
          status: "confirmed",
          amount_cents: 0,
          currency,
          confirmed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { ok: true as const, registrationId: row.id, checkoutUrl: null as string | null };
    }

    // Paid: create Stripe Checkout Session via REST API.
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Online payment is not configured yet. Please contact us to register.");
    }

    const { data: row, error: insErr } = await supabaseAdmin
      .from("event_public_registrations")
      .insert({
        event_id: data.eventId,
        full_name: data.fullName,
        email: data.email,
        quantity: data.quantity,
        status: "pending",
        amount_cents: totalCents,
        currency,
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    const origin =
      process.env.PUBLIC_SITE_URL ||
      process.env.SUPABASE_URL?.replace(/^https:\/\//, "https://") ||
      "https://jiy.lovable.app";
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", `${origin}/events/${data.eventId}?registration=success`);
    params.append("cancel_url", `${origin}/events/${data.eventId}?registration=cancelled`);
    params.append("customer_email", data.email);
    params.append("client_reference_id", row.id);
    params.append("metadata[registration_id]", row.id);
    params.append("metadata[event_id]", data.eventId);
    params.append("line_items[0][quantity]", String(data.quantity));
    params.append("line_items[0][price_data][currency]", currency);
    params.append("line_items[0][price_data][unit_amount]", String(priceCents));
    params.append("line_items[0][price_data][product_data][name]", event.title);

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error("Stripe checkout error", text);
      throw new Error("Payment session could not be started.");
    }
    const session = (await resp.json()) as { id: string; url: string };

    await supabaseAdmin
      .from("event_public_registrations")
      .update({ stripe_session_id: session.id })
      .eq("id", row.id);

    return { ok: true as const, registrationId: row.id, checkoutUrl: session.url };
  });

// Admin: list public registrations for an event
export const listPublicRegistrationsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ eventId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("event_public_registrations")
      .select("id, full_name, email, quantity, status, amount_cents, currency, created_at, confirmed_at")
      .eq("event_id", data.eventId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { registrations: rows ?? [] };
  });

