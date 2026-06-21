import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getPublicEvent, registerPublicForEvent } from "@/lib/jiy/events.functions";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

const eventQuery = (id: string) =>
  queryOptions({
    queryKey: ["public-event", id],
    queryFn: () => getPublicEvent({ data: { id } }),
  });

export const Route = createFileRoute("/events/$eventId")({
  beforeLoad: async ({ params }) => {
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        throw redirect({
          to: "/dashboard/events/$eventId",
          params: { eventId: params.eventId },
        });
      }
    }
  },
  loader: ({ params, context }) => context.queryClient.ensureQueryData(eventQuery(params.eventId)),

  head: ({ loaderData }) => {
    const ev = loaderData?.event;
    const title = ev?.title ? `${ev.title} — JIY` : "Event — JIY";
    const desc = ev?.description?.slice(0, 160) || "Community event hosted by Jaffari Islamic Youth.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(ev?.cover_image_url ? [{ property: "og:image", content: ev.cover_image_url }] : []),
      ],
    };
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <main className="jiy-dashboard min-h-screen bg-alabaster-parchment flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <p className="text-xs uppercase tracking-[0.3em] text-deep-garnet font-body">Unavailable</p>
          <h1 className="font-headline text-3xl text-persian-indigo mt-3">
            {error.message === "NOT_FOUND" ? "Event not found" : "Couldn't load event"}
          </h1>
          <p className="mt-3 text-sm text-ash-slate">
            {error.message === "NOT_FOUND"
              ? "This event may be private, unpublished, or no longer available."
              : error.message}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              to="/events"
              className="interactive-btn border border-persian-indigo text-persian-indigo px-5 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase"
            >
              All events
            </Link>
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="interactive-btn border border-damascus-gold bg-damascus-gold text-persian-indigo px-5 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  },
  notFoundComponent: () => (
    <main className="jiy-dashboard min-h-screen bg-alabaster-parchment flex items-center justify-center px-6 py-24">
      <div className="text-center">
        <h1 className="font-headline text-3xl text-persian-indigo">Event not found</h1>
        <Link to="/events" className="mt-4 inline-block text-damascus-gold underline">
          Back to events
        </Link>
      </div>
    </main>
  ),
  component: EventDetailPage,
});

const TZ = "America/Toronto";
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: TZ,
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  });
}

type Speaker = { name: string; role?: string; bio?: string; photo_url?: string };

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const { data } = useSuspenseQuery(eventQuery(eventId));
  const event = data.event;
  const payment = data.payment;
  const speakers = (Array.isArray(event.speakers) ? event.speakers : []) as Speaker[];

  const search = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const registrationStatus = search.get("registration");

  return (
    <main className="jiy-dashboard min-h-screen bg-alabaster-parchment font-body text-persian-indigo">
      {/* Slim top bar */}
      <SiteHeader />

      {registrationStatus === "success" && (
        <div className="bg-damascus-gold/20 border-b border-damascus-gold/40">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-3 text-sm text-persian-indigo">
            Payment received — you're registered. A confirmation will arrive by email shortly.
          </div>
        </div>
      )}
      {registrationStatus === "cancelled" && (
        <div className="bg-deep-garnet/10 border-b border-deep-garnet/30">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-3 text-sm text-deep-garnet">
            Payment was cancelled. You haven't been charged.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-10">
        {/* Breadcrumbs */}
        <nav className="text-xs uppercase tracking-[0.2em] text-ash-slate font-body">
          <Link to="/events" className="hover:text-damascus-gold transition-colors">
            Community Events
          </Link>
          {event.category_label && (
            <>
              <span className="mx-2 text-horizon-mist">/</span>
              <span>{event.category_label}</span>
            </>
          )}
          <span className="mx-2 text-horizon-mist">/</span>
          <span className="text-persian-indigo/70">{event.title}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-start">
          <div>
            {event.category_label && (
              <p className="text-xs uppercase tracking-[0.32em] text-deep-garnet font-bold font-body">
                {event.category_label}
              </p>
            )}
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-persian-indigo mt-4">
              {event.title}
            </h1>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ash-slate">
              <span>
                <span className="font-semibold text-persian-indigo">Date:</span>{" "}
                {fmtDate(event.starts_at)}
              </span>
              <span className="hidden sm:inline text-horizon-mist">|</span>
              <span>
                <span className="font-semibold text-persian-indigo">Time:</span>{" "}
                {fmtTime(event.starts_at)}
                {event.ends_at ? ` – ${fmtTime(event.ends_at)}` : ""}
              </span>
              {event.location && (
                <>
                  <span className="hidden sm:inline text-horizon-mist">|</span>
                  <span>
                    <span className="font-semibold text-persian-indigo">Venue:</span>{" "}
                    {event.location}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="w-full max-w-md justify-self-center lg:justify-self-end">
            <div className="aspect-[4/5] w-full ogee-arch-portal overflow-hidden bg-gradient-to-b from-horizon-mist via-horizon-mist/60 to-persian-indigo/30">
              {event.cover_image_url ? (
                <img
                  src={event.cover_image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-persian-indigo/40 text-sm font-body uppercase tracking-[0.3em]">
                  JIY
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body + Registration */}
      <section className="bg-warm-silk-grey/50 border-t border-horizon-mist">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-start">
            <div>
              <h2 className="font-headline text-2xl text-persian-indigo">About the Gathering</h2>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ash-slate whitespace-pre-line">
                {event.description || "Details coming soon."}
              </div>

              {speakers.length > 0 && (
                <div className="mt-14">
                  <h2 className="font-headline text-2xl text-persian-indigo">Featured Speakers</h2>
                  <div className="mt-6 space-y-5">
                    {speakers.map((s, i) => (
                      <article
                        key={i}
                        className="bg-white border border-horizon-mist rounded-sm p-5 flex gap-5"
                      >
                        <div className="shrink-0">
                          {s.photo_url ? (
                            <img
                              src={s.photo_url}
                              alt={s.name}
                              className="h-20 w-20 rounded-full object-cover border border-horizon-mist"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-horizon-mist/40 border border-horizon-mist flex items-center justify-center font-headline text-persian-indigo text-xl">
                              {s.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline text-lg text-persian-indigo">{s.name}</h3>
                          {s.role && (
                            <p className="text-xs uppercase tracking-[0.2em] text-deep-garnet mt-1">
                              {s.role}
                            </p>
                          )}
                          {s.bio && (
                            <p className="text-sm text-ash-slate mt-2 leading-relaxed">{s.bio}</p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside>
              <div className="lg:sticky lg:top-8">
                <RegistrationCard
                  eventId={event.id}
                  requiresPayment={payment.requires_payment}
                  priceCents={payment.price_cents}
                  currency={payment.currency}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function formatPrice(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function RegistrationCard({
  eventId,
  requiresPayment,
  priceCents,
  currency,
}: {
  eventId: string;
  requiresPayment: boolean;
  priceCents: number;
  currency: string;
}) {
  const navigate = useNavigate();
  const register = useServerFn(registerPublicForEvent);
  const [qty, setQty] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const mut = useMutation({
    mutationFn: () =>
      register({
        data: { eventId, fullName: fullName.trim(), email: email.trim().toLowerCase(), quantity: qty },
      }),
    onSuccess: (res) => {
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        setDone(true);
      }
    },
  });

  if (done) {
    return (
      <div className="bg-white border border-horizon-mist rounded-sm p-7 shadow-sm">
        <h3 className="font-headline text-2xl text-persian-indigo">You're registered</h3>
        <p className="mt-3 text-sm text-ash-slate leading-relaxed">
          Thanks {fullName.split(" ")[0]} — a confirmation will be sent to {email}.
        </p>
        <button
          onClick={() => navigate({ to: "/events" })}
          className="mt-6 interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo text-[11px] font-bold tracking-[0.22em] py-3 px-6 uppercase transition-all w-full"
        >
          Browse more events
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!fullName.trim() || !email.trim()) return;
        mut.mutate();
      }}
      className="bg-white border border-horizon-mist rounded-sm p-7 shadow-sm"
    >
      <h3 className="font-headline text-2xl text-persian-indigo">Public Registration</h3>

      <div className="mt-6 flex items-center justify-between">
        <span className="font-headline text-xl text-persian-indigo">
          {requiresPayment && priceCents > 0 ? formatPrice(priceCents, currency) : "Free"}
        </span>
        <div className="inline-flex items-center border border-horizon-mist rounded-sm">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-persian-indigo hover:bg-alabaster-parchment"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-4 text-sm font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="px-3 py-1.5 text-persian-indigo hover:bg-alabaster-parchment"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-persian-indigo mb-1.5" htmlFor="reg-name">
            Full Name
          </label>
          <input
            id="reg-name"
            required
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-horizon-mist bg-white px-3 py-2.5 text-sm text-persian-indigo focus:outline-none focus:border-damascus-gold rounded-sm"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-persian-indigo mb-1.5" htmlFor="reg-email">
            Email Address
          </label>
          <input
            id="reg-email"
            type="email"
            required
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-horizon-mist bg-white px-3 py-2.5 text-sm text-persian-indigo focus:outline-none focus:border-damascus-gold rounded-sm"
            placeholder="jane@example.com"
          />
        </div>
      </div>

      {mut.isError && (
        <p className="mt-4 text-xs text-deep-garnet">{(mut.error as Error).message}</p>
      )}

      <button
        type="submit"
        disabled={mut.isPending}
        className="mt-6 interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo text-[11px] font-bold tracking-[0.22em] py-3.5 px-6 uppercase transition-all w-full disabled:opacity-60"
      >
        {mut.isPending ? "Processing…" : requiresPayment ? "Continue to Payment →" : "Complete Registration →"}
      </button>

      <p className="mt-4 text-[11px] text-ash-slate text-center leading-relaxed">
        {requiresPayment
          ? "Secure payment via Stripe. By registering you agree to our terms."
          : "By registering you agree to our terms."}
      </p>
    </form>
  );
}
