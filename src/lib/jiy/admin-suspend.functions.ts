import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const suspendUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ idempotencyKey: z.string().min(8), userId: z.string().uuid(), suspended: z.boolean() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, checkIdempotency, writeAudit } = await import("./idempotency.server");
    await assertAdmin(context.supabase, context.userId);
    if (data.userId === context.userId) throw new Error("FORBIDDEN: cannot suspend yourself");
    const idem = await checkIdempotency<{ ok: true }>(context.supabase, data.idempotencyKey, context.userId);
    if (idem.cached) return idem.cached;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ suspended_at: data.suspended ? new Date().toISOString() : null })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase, {
      actorId: context.userId,
      action: data.suspended ? "user.suspended" : "user.unsuspended",
      entity: "profiles",
      entityId: data.userId,
    });
    await idem.complete({ ok: true });
    return { ok: true as const };
  });
