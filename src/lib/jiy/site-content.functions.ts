import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const SECTION_KEYS = [
  "hero",
  "metrics",
  "about",
  "ongoing",
  "values",
  "press",
  "footer",
  "team_hero",
  "team_intro",
  "team_leadership",
  "team_members",
  "team_cta",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

type Json =
  | string
  | number
  | boolean
  | null
  | { [k: string]: Json | undefined }
  | Json[];

export type HomepageEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  cover_image_url: string | null;
};

export type HomepageArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
};

// Public — used by `/` loader.
export const getHomepageData = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const nowIso = new Date().toISOString();

  const [sectionsRes, eventsRes, articlesFeaturedRes, articlesLatestRes] = await Promise.all([
    sb.from("site_content").select("section_key, published_content"),
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
      .select("id, title, slug, excerpt, cover_image_url, published_at")
      .eq("status", "published")
      .eq("audience_visibility", "public")
      .eq("audience_gender", "all")
      .is("audience_min_age", null)
      .is("audience_max_age", null)
      .order("published_at", { ascending: false })
      .limit(2),
  ]);

  const sections: Record<string, Json> = {};
  for (const row of sectionsRes.data ?? []) {
    sections[row.section_key] = (row.published_content as Json) ?? {};
  }

  const allEvents = (eventsRes.data ?? []) as Array<HomepageEvent & { featured_on_home: boolean }>;
  const featuredEvents = allEvents.filter((e) => e.featured_on_home);
  const eventsPool = featuredEvents.length > 0 ? featuredEvents : allEvents;
  const events: HomepageEvent[] = eventsPool.slice(0, 3).map(({ featured_on_home: _f, ...rest }) => rest);

  const featuredArticles = (articlesFeaturedRes.data ?? []) as HomepageArticle[];
  const latestArticles = (articlesLatestRes.data ?? []) as HomepageArticle[];
  const articles: HomepageArticle[] = (featuredArticles.length > 0 ? featuredArticles : latestArticles).slice(0, 2);

  return { sections, events, articles };
});

// Public — used by `/team` loader.
export const getTeamPageData = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const teamKeys = ["team_hero", "team_intro", "team_leadership", "team_members", "team_cta", "footer", "hero"];
  const { data } = await sb
    .from("site_content")
    .select("section_key, published_content")
    .in("section_key", teamKeys);
  const sections: Record<string, Json> = {};
  for (const row of data ?? []) sections[row.section_key] = (row.published_content as Json) ?? {};
  return { sections };
});

// Admin reads (single section) — returns both draft and published.
export const getSectionContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ key: z.enum(SECTION_KEYS) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("site_content")
      .select("section_key, draft_content, published_content, draft_updated_at, published_at, published_by")
      .eq("section_key", data.key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const draft = (row?.draft_content as Json) ?? {};
    const published = (row?.published_content as Json) ?? {};
    const hasUnpublishedChanges = JSON.stringify(draft) !== JSON.stringify(published);
    return {
      section: {
        section_key: data.key,
        draft_content: draft,
        published_content: published,
        draft_updated_at: row?.draft_updated_at ?? null,
        published_at: row?.published_at ?? null,
        published_by: row?.published_by ?? null,
        has_unpublished_changes: hasUnpublishedChanges,
      },
    };
  });

// Save draft only — never affects public page.
export const updateSectionContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ key: z.enum(SECTION_KEYS), content: z.record(z.string(), z.unknown()) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const nowIso = new Date().toISOString();
    const { error } = await context.supabase.from("site_content").upsert({
      section_key: data.key,
      draft_content: data.content as Json,
      draft_updated_at: nowIso,
      updated_by: context.userId,
      updated_at: nowIso,
    });
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "site_content.draft_saved",
      entity: "site_content",
      metadata: { key: data.key },
    });
    return { ok: true as const };
  });

// Publish: copy current draft to published.
export const publishSectionContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ key: z.enum(SECTION_KEYS) }).parse(i))
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error: readErr } = await context.supabase
      .from("site_content")
      .select("draft_content")
      .eq("section_key", data.key)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    const draft = (row?.draft_content as Json) ?? {};
    const nowIso = new Date().toISOString();
    const { error } = await context.supabase.from("site_content").upsert({
      section_key: data.key,
      draft_content: draft,
      published_content: draft,
      published_at: nowIso,
      published_by: context.userId,
      updated_by: context.userId,
      updated_at: nowIso,
    });
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "site_content.published",
      entity: "site_content",
      metadata: { key: data.key },
    });
    return { ok: true as const, published_at: nowIso };
  });
