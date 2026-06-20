import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const categoryEnum = z.enum(["scholarship", "fellowship", "job", "cfp", "other"]);
const statusEnum = z.enum(["draft", "published", "archived"]);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  idempotencyKey: z.string().min(8),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).optional(),
  summary: z.string().max(500).default(""),
  body_md: z.string().max(50_000).default(""),
  category: categoryEnum.default("other"),
  organization: z.string().max(200).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  url: z.string().url().nullable().optional(),
  deadline: z.string().datetime().nullable().optional(),
  cover_image_url: z.string().url().nullable().optional(),
  status: statusEnum.default("draft"),
});

// PUBLIC — read published list (no auth)
export const listPublishedOpportunities = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) =>
    z
      .object({
        category: categoryEnum.optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("opportunities")
      .select(
        "id, title, slug, summary, category, organization, location, deadline, cover_image_url, published_at",
      )
      .eq("status", "published")
      .order("deadline", { ascending: true, nullsFirst: false })
      .order("published_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { opportunities: rows ?? [] };
  });

export const getOpportunityBySlug = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ slug: z.string().min(1) }).parse(i))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: row, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return { opportunity: row };
  });

// ADMIN
export const listAllOpportunitiesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("opportunities")
      .select(
        "id, title, slug, category, status, organization, deadline, published_at, created_at, updated_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { opportunities: data ?? [] };
  });

export const getOpportunityAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("opportunities")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return { opportunity: row };
  });

export const upsertOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => upsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ id: string }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (idem.cached) return idem.cached;

    const slug = data.slug?.trim() || slugify(data.title);
    const patch = {
      title: data.title,
      slug,
      summary: data.summary,
      body_md: data.body_md,
      category: data.category,
      organization: data.organization ?? null,
      location: data.location ?? null,
      url: data.url ?? null,
      deadline: data.deadline ?? null,
      cover_image_url: data.cover_image_url ?? null,
      status: data.status,
      published_at:
        data.status === "published" ? new Date().toISOString() : null,
    };

    let id = data.id;
    if (id) {
      const { error } = await context.supabase
        .from("opportunities")
        .update(patch)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await context.supabase
        .from("opportunities")
        .insert({ ...patch, created_by: context.userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = row.id;
    }
    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: data.id ? "opportunity.updated" : "opportunity.created",
      entity: "opportunities",
      entityId: id!,
    });
    await idem.complete({ id: id! });
    return { id: id! };
  });

export const deleteOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i),
  )
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
      .from("opportunities")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "opportunity.deleted",
      entity: "opportunities",
      entityId: data.id,
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });
