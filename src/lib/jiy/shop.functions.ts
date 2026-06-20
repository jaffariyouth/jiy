import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// PUBLIC — anyone (signed in or not) can join. Inserts via anon publishable key.
export const joinShopWaitlist = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        email: z.string().email().max(320),
        source: z.string().max(40).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await supabase
      .from("shop_waitlist")
      .insert({ email: data.email.toLowerCase(), source: data.source ?? "shop_page" });
    // 23505 = unique_violation → already on list, treat as success
    if (error && error.code !== "23505") {
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const listShopWaitlistAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("shop_waitlist")
      .select("id, email, source, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return { entries: data ?? [] };
  });
