import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
          return new Response("Stripe not configured", { status: 503 });
        }

        const sigHeader = request.headers.get("stripe-signature") ?? "";
        const body = await request.text();

        // Verify signature (Stripe v1 scheme: t=…,v1=…)
        const parts = Object.fromEntries(
          sigHeader.split(",").map((p) => {
            const [k, v] = p.split("=");
            return [k, v];
          }),
        ) as { t?: string; v1?: string };
        if (!parts.t || !parts.v1) return new Response("Bad signature", { status: 400 });

        const { createHmac, timingSafeEqual } = await import("crypto");
        const expected = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
          .update(`${parts.t}.${body}`)
          .digest("hex");
        const a = Buffer.from(expected);
        const b = Buffer.from(parts.v1);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let evt: { type: string; data: { object: Record<string, unknown> } };
        try {
          evt = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        if (evt.type === "checkout.session.completed") {
          const session = evt.data.object as {
            id?: string;
            client_reference_id?: string;
            metadata?: { registration_id?: string };
          };
          const regId = session.metadata?.registration_id || session.client_reference_id;
          if (regId) {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin
              .from("event_public_registrations")
              .update({
                status: "confirmed",
                confirmed_at: new Date().toISOString(),
                stripe_session_id: session.id ?? null,
              })
              .eq("id", regId);
          }
        }

        return new Response("ok");
      },
    },
  },
});
