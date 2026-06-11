import { createFileRoute } from "@tanstack/react-router";

/**
 * Notification dispatcher — invoked by pg_cron every minute.
 *
 * Pulls up to `BATCH_SIZE` pending notifications whose `scheduled_for`
 * is in the past, attempts delivery per channel, then:
 *   - writes a `notification_deliveries` row for the attempt
 *   - updates the notification's status (`sent` / `failed`)
 *
 * Auth: the route lives under /api/public/* (auth bypassed at the edge),
 * so we require an `apikey` header matching SUPABASE_PUBLISHABLE_KEY.
 * Cron jobs configured via pg_cron send this header automatically.
 *
 * Provider matrix:
 *   - in_app: marked sent immediately (clients read from notifications table)
 *   - email / push / sms: not implemented yet — marked failed with reason.
 *     Wire real providers (Resend, FCM, Twilio) in a later phase.
 */

const BATCH_SIZE = 100;
const MAX_RETRIES = 5;

type DispatchResult = {
  ok: true;
  processed: number;
  sent: number;
  failed: number;
};

export const Route = createFileRoute("/api/public/cron/dispatch-notifications")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // --- Auth: validate apikey header ---
        const apikey = request.headers.get("apikey");
        if (!apikey || apikey !== process.env.SUPABASE_PUBLISHABLE_KEY) {
          return new Response(JSON.stringify({ error: "FORBIDDEN" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // --- Pull a batch of due, pending notifications ---
        const { data: pending, error: pullErr } = await supabaseAdmin
          .from("notifications")
          .select("id, recipient_id, channel, template_key, payload, retry_count")
          .eq("status", "pending")
          .lte("scheduled_for", new Date().toISOString())
          .order("scheduled_for", { ascending: true })
          .limit(BATCH_SIZE);

        if (pullErr) {
          console.error("[dispatcher] pull failed", pullErr);
          return new Response(
            JSON.stringify({ error: "INTERNAL_SERVER_ERROR" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        let sent = 0;
        let failed = 0;

        for (const n of pending ?? []) {
          let deliveryStatus: "sent" | "failed" = "failed";
          let deliveryError: string | null = null;
          let provider: string | null = null;
          let providerMessageId: string | null = null;

          try {
            if (n.channel === "in_app") {
              // No external delivery — surfaced via /notifications query.
              deliveryStatus = "sent";
              provider = "in_app";
            } else {
              // TODO: wire real providers (email=Resend, push=FCM, sms=Twilio).
              deliveryStatus = "failed";
              deliveryError = `provider not configured for channel=${n.channel}`;
              provider = n.channel;
            }
          } catch (err) {
            deliveryStatus = "failed";
            deliveryError = err instanceof Error ? err.message : String(err);
          }

          // Append delivery audit row (immutable).
          await supabaseAdmin.from("notification_deliveries").insert({
            notification_id: n.id,
            channel: n.channel,
            provider,
            provider_message_id: providerMessageId,
            status: deliveryStatus,
            error: deliveryError,
          });

          // Update parent notification status.
          if (deliveryStatus === "sent") {
            await supabaseAdmin
              .from("notifications")
              .update({ status: "sent", sent_at: new Date().toISOString() })
              .eq("id", n.id);
            sent += 1;
          } else {
            const nextRetry = (n.retry_count ?? 0) + 1;
            const giveUp = nextRetry >= MAX_RETRIES;
            await supabaseAdmin
              .from("notifications")
              .update({
                status: giveUp ? "failed" : "pending",
                retry_count: nextRetry,
                error_message: deliveryError,
                // exponential backoff: 2^retry minutes
                scheduled_for: giveUp
                  ? undefined
                  : new Date(
                      Date.now() + Math.pow(2, nextRetry) * 60_000,
                    ).toISOString(),
              })
              .eq("id", n.id);
            failed += 1;
          }
        }

        const result: DispatchResult = {
          ok: true,
          processed: pending?.length ?? 0,
          sent,
          failed,
        };
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});