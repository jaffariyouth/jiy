import type { Database } from "@/integrations/supabase/types";

type Channel = Database["public"]["Enums"]["notification_channel"];

/**
 * Enqueue a notification via the SECURITY DEFINER RPC.
 * Must be called with the admin client (RPC is REVOKEd from authenticated).
 * Swallows errors and logs — notification enqueue must never break the
 * parent business operation.
 */
export async function enqueueNotification(args: {
  recipientId: string;
  channel: Channel;
  templateKey: string;
  payload?: Record<string, unknown>;
  scheduledFor?: string;
}): Promise<string | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("enqueue_notification", {
      _recipient_id: args.recipientId,
      _channel: args.channel,
      _template_key: args.templateKey,
      _payload: (args.payload ?? {}) as never,
      _scheduled_for: args.scheduledFor ?? new Date().toISOString(),
    });
    if (error) {
      console.error("[notifications.enqueue] failed", error);
      return null;
    }
    return (data as string) ?? null;
  } catch (err) {
    console.error("[notifications.enqueue] threw", err);
    return null;
  }
}

/**
 * Fan out a notification to every admin (used for triage queues etc.).
 */
export async function enqueueAdminBroadcast(args: {
  channel: Channel;
  templateKey: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: admins, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (error) {
      console.error("[notifications.broadcast] failed listing admins", error);
      return;
    }
    await Promise.all(
      (admins ?? []).map((a) =>
        enqueueNotification({
          recipientId: a.user_id,
          channel: args.channel,
          templateKey: args.templateKey,
          payload: args.payload,
        }),
      ),
    );
  } catch (err) {
    console.error("[notifications.broadcast] threw", err);
  }
}