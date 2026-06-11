import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const TTL_HOURS = 24;

/**
 * Idempotency helper for mutating server functions.
 *
 * Caller passes a client-generated idempotency key. If the key has been
 * seen before AND has a cached response_json, we return it without
 * re-running the operation. Otherwise we reserve the key and let the
 * caller execute, then `complete()` writes the response back.
 *
 * Uses the caller's RLS-scoped supabase client; the idempotency_keys
 * table is admin-read but allows authenticated INSERTs scoped to the
 * user (see Phase 0 migration).
 */
export async function checkIdempotency<T>(
  supabase: SupabaseClient<Database>,
  key: string,
  userId: string,
): Promise<{ cached: T | null; complete: (response: T) => Promise<void> }> {
  if (!key || key.length < 8) {
    throw new Error("INVALID_INPUT: idempotency key required (min 8 chars)");
  }

  const { data: existing } = await supabase
    .from("idempotency_keys")
    .select("response_json, expires_at")
    .eq("key", key)
    .maybeSingle();

  if (existing && new Date(existing.expires_at) > new Date()) {
    return {
      cached: (existing.response_json as T) ?? null,
      complete: async () => {
        /* already cached */
      },
    };
  }

  const expiresAt = new Date(Date.now() + TTL_HOURS * 3600 * 1000).toISOString();
  // Reserve the key. If concurrent insert wins, we'll still get a row back
  // on the next attempt.
  await supabase
    .from("idempotency_keys")
    .upsert(
      { key, user_id: userId, response_json: null, expires_at: expiresAt },
      { onConflict: "key" },
    );

  return {
    cached: null,
    complete: async (response: T) => {
      await supabase
        .from("idempotency_keys")
        .update({ response_json: response as never })
        .eq("key", key);
    },
  };
}

export async function writeAudit(
  supabase: SupabaseClient<Database>,
  args: {
    actorId: string;
    action: string;
    entity?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await supabase.rpc("audit_log_write", {
    _actor_id: args.actorId,
    _action: args.action,
    _entity: args.entity ?? undefined,
    _entity_id: args.entityId ?? undefined,
    _metadata: (args.metadata ?? {}) as never,
  });
  if (error) {
    // Never fail the parent op for audit failures — log and continue.
    console.error("[audit] failed", error);
  }
}

export async function assertAdmin(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error("FORBIDDEN: role check failed");
  if (!data) throw new Error("FORBIDDEN: admin role required");
}

export async function hasAnyRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  roles: Database["public"]["Enums"]["app_role"][],
): Promise<boolean> {
  for (const role of roles) {
    const { data } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: role,
    });
    if (data) return true;
  }
  return false;
}