import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads ----------

export const listPublishedArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("youth_press_articles")
    .select("id, title, slug, excerpt, cover_image_url, published_at, author_id")
    .eq("status", "published")
    .eq("audience_visibility", "public")
    .eq("audience_gender", "all")
    .is("audience_min_age", null)
    .is("audience_max_age", null)
    .order("published_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return { articles: data ?? [] };
});

const slugInput = z.object({ slug: z.string().min(1).max(200) });

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => slugInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("youth_press_articles")
      .select("id, title, slug, excerpt, body_md, cover_image_url, published_at, author_id")
      .eq("status", "published")
      .eq("audience_visibility", "public")
      .eq("audience_gender", "all")
      .is("audience_min_age", null)
      .is("audience_max_age", null)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return { article: row };
  });

// ---------- Mutations ----------

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createDraftSchema = z.object({
  idempotencyKey: z.string().min(8),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex, "lowercase-kebab-case"),
  excerpt: z.string().max(500).optional(),
  body_md: z.string().min(1).max(200_000),
  cover_image_url: z.string().url().optional(),
  audience_visibility: z.enum(["public", "members"]).optional(),
  audience_gender: z.enum(["all", "male", "female"]).optional(),
  audience_min_age: z.number().int().min(0).max(120).nullable().optional(),
  audience_max_age: z.number().int().min(0).max(120).nullable().optional(),
  featured_on_home: z.boolean().optional(),
});

export const createDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createDraftSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { checkIdempotency, writeAudit } = await import("./idempotency.server");
    const idem = await checkIdempotency<{ id: string }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (idem.cached) return idem.cached;

    const { data: row, error } = await context.supabase
      .from("youth_press_articles")
      .insert({
        author_id: context.userId,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? null,
        body_md: data.body_md,
        cover_image_url: data.cover_image_url ?? null,
        status: "draft",
        audience_visibility: data.audience_visibility ?? "members",
        audience_gender: data.audience_gender ?? "all",
        audience_min_age: data.audience_min_age ?? null,
        audience_max_age: data.audience_max_age ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "article.draft_created",
      entity: "youth_press_articles",
      entityId: row.id,
    });
    await idem.complete({ id: row.id });
    return { id: row.id };
  });

const updateDraftSchema = createDraftSchema.partial().extend({
  id: z.string().uuid(),
  idempotencyKey: z.string().min(8),
});

export const updateDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateDraftSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { checkIdempotency, writeAudit } = await import("./idempotency.server");
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;

    const { id, idempotencyKey: _ik, ...patch } = data;
    const { error } = await context.supabase
      .from("youth_press_articles")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "article.updated",
      entity: "youth_press_articles",
      entityId: id,
      metadata: { fields: Object.keys(patch) },
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

const transition = z.object({
  idempotencyKey: z.string().min(8),
  id: z.string().uuid(),
});

export const submitForReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => transition.parse(input))
  .handler(async ({ data, context }) => {
    const { checkIdempotency, writeAudit } = await import("./idempotency.server");
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;

    // Only the author may submit their own draft; RLS enforces this.
    const { error } = await context.supabase
      .from("youth_press_articles")
      .update({ status: "in_review" })
      .eq("id", data.id)
      .eq("author_id", context.userId);
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "article.submitted_for_review",
      entity: "youth_press_articles",
      entityId: data.id,
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const publishArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => transition.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    // Editor role isn't in the current app_role enum; treat admin as the
    // publisher gate. (Add a 'youth_press_editor' role in a later phase
    // if editorial separation is required.)
    await assertAdmin(context.supabase, context.userId);

    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;

    const { error } = await context.supabase
      .from("youth_press_articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        editor_id: context.userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "article.published",
      entity: "youth_press_articles",
      entityId: data.id,
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });
// ---------- Admin reads / extra mutations ----------

export const listAllArticlesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("youth_press_articles")
      .select("id, title, slug, status, excerpt, cover_image_url, published_at, updated_at, author_id")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { articles: data ?? [] };
  });

export const getArticleByIdAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("youth_press_articles").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return { article: row };
  });

export const unpublishArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { error } = await context.supabase
      .from("youth_press_articles").update({ status: "draft" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "article.unpublished", entity: "youth_press_articles", entityId: data.id });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), idempotencyKey: z.string().min(8) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;
    const { error } = await context.supabase
      .from("youth_press_articles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, { actorId: context.userId, action: "article.deleted", entity: "youth_press_articles", entityId: data.id });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });

export const getPublicFormTemplate = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i as { id: string }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("form_templates").select("id, name, slug, schema").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return { template: row };
  });
