import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Merch Shop — JIY" },
      {
        name: "description",
        content: "JIY merch is on the way. Join the waitlist to be notified at launch.",
      },
      { property: "og:title", content: "Merch Shop — JIY" },
      {
        property: "og:description",
        content: "JIY merch is on the way. Join the waitlist to be notified at launch.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <main className="min-h-screen bg-alabaster-parchment">
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-16">
        <header className="border-b border-horizon-mist pb-8 mb-12">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
            JIY MERCH
          </p>
          <h1 className="font-headline text-4xl md:text-5xl text-primary-dark mt-3">
            Coming Soon
          </h1>
          <p className="font-body text-sm text-ash-slate mt-4 max-w-2xl leading-relaxed">
            The JIY merch shop is in production. Stay tuned for the first drop.
          </p>
        </header>

        <div className="studio-card rounded-xl p-10 bg-white text-center">
          <h2 className="font-headline text-2xl text-primary-dark">
            We're stitching the first run.
          </h2>
          <p className="font-body text-sm text-ash-slate mt-3 max-w-md mx-auto leading-relaxed">
            A signup form to join the launch waitlist will appear here when we're ready.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold hover:text-primary-dark font-black"
          >
            Back to dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
