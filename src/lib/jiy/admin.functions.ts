import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, checkIdempotency, writeAudit } from "./idempotency.server";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
const APP_ROLES: AppRole[] = [
  "admin",
  "scholar",
  "editor",
  "member_isij",
  "member_standalone",
];

export type AdminUserDTO = {
  id: string;
  displayName: string | null;
  country: string | null;
  onboardingCompletedAt: string | null;
  roles: AppRole[];
  isijExpiresAt: string | null;
};

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AppRole[]> => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.role);
  });

export const listUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().trim().max(120).optional(),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<AdminUserDTO[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("profiles")
      .select("id, display_name, country, onboarding_completed_at")
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);
    if (data.search && data.search.length > 0) {
      q = q.ilike("display_name", `%${data.search}%`);
    }
    const { data: profiles, error } = await q;
    if (error) throw new Error(error.message);
    if (!profiles || profiles.length === 0) return [];

    const ids = profiles.map((p) => p.id);
    const [{ data: roleRows }, { data: isijRows }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids),
      supabaseAdmin
        .from("isij_registry_cache")
        .select("user_id, expires_at")
        .in("user_id", ids),
    ]);

    const rolesByUser = new Map<string, AppRole[]>();
    for (const r of roleRows ?? []) {
      const list = rolesByUser.get(r.user_id) ?? [];
      list.push(r.role);
      rolesByUser.set(r.user_id, list);
    }
    const isijByUser = new Map<string, string | null>();
    for (const i of isijRows ?? []) isijByUser.set(i.user_id, i.expires_at);

    return profiles.map((p) => ({
      id: p.id,
      displayName: p.display_name,
      country: p.country,
      onboardingCompletedAt: p.onboarding_completed_at,
      roles: rolesByUser.get(p.id) ?? [],
      isijExpiresAt: isijByUser.get(p.id) ?? null,
    }));
  });

export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        idempotencyKey: z.string().min(8),
        userId: z.string().uuid(),
        role: z.enum(APP_ROLES as [AppRole, ...AppRole[]]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { cached, complete } = await checkIdempotency<{ ok: true }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (cached) return cached;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: data.userId, role: data.role },
        { onConflict: "user_id,role" },
      );
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "role.grant",
      entity: "user_roles",
      entityId: data.userId,
      metadata: { role: data.role },
    });
    const dto = { ok: true as const };
    await complete(dto);
    return dto;
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        idempotencyKey: z.string().min(8),
        userId: z.string().uuid(),
        role: z.enum(APP_ROLES as [AppRole, ...AppRole[]]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    // Guard: cannot self-revoke admin.
    if (data.userId === context.userId && data.role === "admin") {
      throw new Error("FORBIDDEN: cannot revoke your own admin role");
    }
    const { cached, complete } = await checkIdempotency<{ ok: true }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (cached) return cached;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "role.revoke",
      entity: "user_roles",
      entityId: data.userId,
      metadata: { role: data.role },
    });
    const dto = { ok: true as const };
    await complete(dto);
    return dto;
  });

export const markUserAsISIJMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        idempotencyKey: z.string().min(8),
        userId: z.string().uuid(),
        isijId: z.string().trim().min(1).max(80),
        expiresAt: z.string().datetime().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { cached, complete } = await checkIdempotency<{ ok: true }>(
      context.supabase,
      data.idempotencyKey,
      context.userId,
    );
    if (cached) return cached;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: cacheErr } = await supabaseAdmin
      .from("isij_registry_cache")
      .upsert(
        {
          user_id: data.userId,
          isij_id: data.isijId,
          expires_at: data.expiresAt ?? null,
          verified_at: new Date().toISOString(),
          source: "admin_manual",
        },
        { onConflict: "user_id" },
      );
    if (cacheErr) throw new Error(cacheErr.message);

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: data.userId, role: "member_isij" },
        { onConflict: "user_id,role" },
      );
    if (roleErr) throw new Error(roleErr.message);

    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: "isij.mark_member",
      entity: "user_roles",
      entityId: data.userId,
      metadata: { isij_id: data.isijId, expires_at: data.expiresAt ?? null },
    });
    const dto = { ok: true as const };
    await complete(dto);
    return dto;
  });