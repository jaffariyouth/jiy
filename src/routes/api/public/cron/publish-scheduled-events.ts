import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cron/publish-scheduled-events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey =
          request.headers.get("apikey") ||
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!apiKey || apiKey !== process.env.SUPABASE_PUBLISHABLE_KEY) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const nowIso = new Date().toISOString();

        const { data, error } = await supabaseAdmin
          .from("events")
          .update({ status: "published", publish_at: null })
          .eq("status", "draft")
          .lte("publish_at", nowIso)
          .not("publish_at", "is", null)
          .select("id");

        if (error) {
          console.error("publish-scheduled-events error", error);
          return new Response(
            JSON.stringify({ ok: false, error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ ok: true, published: data?.length ?? 0, at: nowIso }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
      GET: async () =>
        new Response(JSON.stringify({ ok: true, hint: "POST to run" }), {
          headers: { "Content-Type": "application/json" },
        }),
    },
  },
});
