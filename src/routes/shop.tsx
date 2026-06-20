import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { joinShopWaitlist } from "@/lib/jiy/shop.functions";

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
  const [email, setEmail] = useState("");
  const join = useServerFn(joinShopWaitlist);
  const mut = useMutation({
    mutationFn: () => join({ data: { email, source: "shop_page" } }),
  });

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

        <div className="studio-card rounded-xl p-10 bg-white">
          <h2 className="font-headline text-2xl text-primary-dark text-center">
            We&apos;re stitching the first run.
          </h2>
          <p className="font-body text-sm text-ash-slate mt-3 max-w-md mx-auto leading-relaxed text-center">
            Drop your email and we&apos;ll let you know the moment the shop opens.
          </p>

          {mut.isSuccess ? (
            <div className="mt-8 max-w-md mx-auto text-center">
              <p className="font-headline text-xl text-damascus-gold">You&apos;re on the list.</p>
              <p className="font-body text-sm text-ash-slate mt-2">
                We&apos;ll email <span className="font-medium text-primary-dark">{email}</span> at launch.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                mut.mutate();
              }}
              className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-sm border border-horizon-mist bg-white font-body text-sm text-primary-dark focus:outline-none focus:border-damascus-gold"
              />
              <button
                type="submit"
                disabled={mut.isPending}
                className="bg-primary-dark text-alabaster-parchment font-body text-[11px] uppercase tracking-[0.18em] px-5 py-3 rounded-sm hover:bg-deep-garnet transition-colors disabled:opacity-60"
              >
                {mut.isPending ? "Joining…" : "Join waitlist"}
              </button>
            </form>
          )}
          {mut.isError && (
            <p className="mt-3 text-center text-xs text-deep-garnet font-body">
              {(mut.error as Error).message}
            </p>
          )}
        </div>

        <p className="mt-12 text-xs text-ash-slate">
          <Link to="/dashboard" className="hover:text-primary-dark">← Back to dashboard</Link>
        </p>
      </div>
    </main>
  );
}
