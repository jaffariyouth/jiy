import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SECTION_KEYS = ["hero", "about", "ongoing", "values", "footer"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

function publicClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

// Public — used by `/` loader. Returns all sections + featured/upcoming events + featured press.
export const getHomepageData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const nowIso = new Date().toISOString();

  const [sectionsRes, featuredEventsRes, articlesFeaturedRes, articlesLatestRes] =
    await Promise.all([
      sb.from("site_content").select("section_key, content"),
      sb
        .from("events")
        .select("id, title, description, location, starts_at, ends_at, cover_image_url, featured_on_home")
        .eq("status", "published")
        .eq("audience_visibility", "public")
        .eq("audience_gender", "all")
        .is("audience_min_age", null)
        .is("audience_max_age", null)
        .gte("starts_at", nowIso)
        .order("featured_on_home", { ascending: false })
        .order("starts_at", { ascending: true })
        .limit(20),
      sb
        .from("youth_press_articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, featured_on_home")
        .eq("status", "published")
        .eq("audience_visibility", "public")
        .eq("audience_gender", "all")
        .is("audience_min_age", null)
        .is("audience_max_age", null)
        .eq("featured_on_home", true)
        .order("published_at", { ascending: false })
        .limit(2),
      sb
        .from("youth_press_articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, featured_on_home")
        .eq("status", "published")
        .eq("audience_visibility", "public")
        .eq("audience_gender", "all")
        .is("audience_min_age", null)
        .is("audience_max_age", null)
        .order("published_at", { ascending: false })
        .limit(2),
    ]);

  const sections: Record<string, Record<string, unknown>> = {};
  for (const row of sectionsRes.data ?? []) {
    sections[row.section_key] = (row.content as Record<string, unknown>) ?? {};
  }

  const allEvents = featuredEventsRes.data ?? [];
  const featuredEvents = allEvents.filter((e) => e.featured_on_home);
  const events = (featuredEvents.length > 0 ? featuredEvents : allEvents).slice(0, 3);

  const featuredArticles = articlesFeaturedRes.data ?? [];
  const articles =
    featuredArticles.length > 0 ? featuredArticles.slice(0, 2) : (articlesLatestRes.data ?? []).slice(0, 2);

  return { sections, events, articles };
});

// Admin reads (single section)
export const getSectionContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ key: z.enum(SECTION_KEYS) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("site_content")
      .select("section_key, content, updated_at")
      .eq("section_key", data.key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { section: row ?? { section_key: data.key, content: {}, updated_at: null } };
  });

export const updateSectionContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ key: z.enum(SECTION_KEYS), content: z.record(z.string(), z.unknown()) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("site_content").upsert({
      section_key: data.key,
      content: data.content,
      updated_by: context.userId,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "site_content.updated",
      entity: "site_content",
      entityId: null,
      metadata: { key: data.key },
    });
    return { ok: true as const };
  });
