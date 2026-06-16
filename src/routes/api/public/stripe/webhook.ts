import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
          return new Response("Stripe not configured", { status: 503 });
        }
        // Signature verification + event handling lands when keys are added.
        // Touch the request body so the Worker doesn't drop the connection.
        await request.text();
        return new Response("ok");
      },
    },
  },
});
