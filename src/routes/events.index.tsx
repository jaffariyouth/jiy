import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { listPublicEvents } from "@/lib/jiy/events.functions";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — JIY" },
      { name: "description", content: "Upcoming Jaffari Islamic Youth community events." },
      { property: "og:title", content: "Events — JIY" },
      { property: "og:description", content: "Upcoming Jaffari Islamic Youth community events." },
    ],
  }),
  loader: () => listPublicEvents(),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <main className="jiy-dashboard min-h-screen bg-alabaster-parchment flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <p className="text-xs uppercase tracking-[0.3em] text-deep-garnet font-body">Unavailable</p>
          <h1 className="font-headline text-3xl text-persian-indigo mt-3">Events couldn't load</h1>
          <p className="mt-3 text-sm text-ash-slate">{error.message}</p>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="mt-6 interactive-btn border border-damascus-gold bg-damascus-gold text-persian-indigo px-5 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase"
          >
            Try again
          </button>
        </div>
      </main>
    );
  },
  notFoundComponent: () => (
    <main className="jiy-dashboard min-h-screen bg-alabaster-parchment flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-headline text-3xl text-persian-indigo">Not found</h1>
        <Link to="/" className="mt-4 inline-block text-damascus-gold underline">
          Go home
        </Link>
      </div>
    </main>
  ),
  component: EventsPage,
});

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit" });
}
function fmtMonth(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short" }).toUpperCase();
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function EventsPage() {
  const { events } = Route.useLoaderData();

  return (
    <main className="jiy-dashboard min-h-screen bg-alabaster-parchment font-body text-persian-indigo">
      <header className="border-b border-horizon-mist bg-alabaster-parchment">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <Link to="/" className="font-headline text-2xl font-extrabold text-persian-indigo">
            JIY
          </Link>
          <nav className="hidden md:flex gap-8 text-xs uppercase tracking-[0.22em] font-semibold text-ash-slate">
            <Link to="/" className="hover:text-damascus-gold transition-colors">
              Home
            </Link>
            <Link to="/team" className="hover:text-damascus-gold transition-colors">
              Our Team
            </Link>
            <Link to="/events" className="text-damascus-gold border-b border-damascus-gold pb-0.5">
              Events
            </Link>
          </nav>
          <Link
            to="/"
            hash="join"
            className="interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo text-[10px] font-bold tracking-[0.22em] py-2.5 px-5 uppercase transition-all"
          >
            Join JIY
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-10">
        <p className="text-xs uppercase tracking-[0.32em] text-deep-garnet font-bold">
          Community Events
        </p>
        <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-persian-indigo mt-4">
          Upcoming Gatherings
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] text-ash-slate leading-relaxed">
          Community gatherings open to everyone — lectures, workshops, and seasonal programs hosted
          by Jaffari Islamic Youth.
        </p>
        <div className="mt-10 border-t border-horizon-mist" />
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-24">
        {events.length === 0 ? (
          <div className="bg-white border border-horizon-mist rounded-sm p-12 text-center">
            <p className="font-headline text-xl text-persian-indigo">No events scheduled yet</p>
            <p className="mt-2 text-sm text-ash-slate">Check back soon for our upcoming programs.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((e: (typeof events)[number]) => (
              <li key={e.id}>
                <Link
                  to="/events/$eventId"
                  params={{ eventId: e.id }}
                  className="group block h-full bg-white border border-horizon-mist rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[16/10] bg-gradient-to-b from-horizon-mist via-warm-silk-grey to-horizon-mist overflow-hidden">
                    {e.cover_image_url ? (
                      <img
                        src={e.cover_image_url}
                        alt={e.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-headline text-persian-indigo/30 text-4xl">
                        JIY
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white border border-horizon-mist px-3 py-1.5 text-center rounded-sm shadow-xs">
                      <p className="font-headline text-base font-bold text-persian-indigo leading-none">
                        {fmtDay(e.starts_at)}
                      </p>
                      <p className="font-body text-[9px] uppercase tracking-[0.15em] text-ash-slate font-bold mt-0.5">
                        {fmtMonth(e.starts_at)}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-deep-garnet font-bold mb-2">
                      Community Event
                    </span>
                    <h2 className="font-headline text-xl text-persian-indigo leading-snug group-hover:text-damascus-gold transition-colors">
                      {e.title}
                    </h2>
                    <div className="mt-3 text-xs text-ash-slate flex flex-wrap gap-x-3 gap-y-1">
                      <span>{fmtTime(e.starts_at)}</span>
                      {e.location && (
                        <>
                          <span className="text-horizon-mist">·</span>
                          <span>{e.location}</span>
                        </>
                      )}
                    </div>
                    {e.description && (
                      <p className="mt-4 text-sm text-ash-slate leading-relaxed line-clamp-2">
                        {e.description}
                      </p>
                    )}
                    <div className="mt-5 pt-4 border-t border-horizon-mist/70 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-damascus-gold font-black">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="border-t border-horizon-mist bg-alabaster-parchment">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 text-center">
          <p className="font-headline text-xl text-persian-indigo">JIY</p>
          <div className="mt-3 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.2em] text-ash-slate">
            <Link to="/team" className="hover:text-damascus-gold transition-colors">
              Our team
            </Link>
            <Link to="/" className="hover:text-damascus-gold transition-colors">
              Home
            </Link>
          </div>
          <p className="mt-6 text-xs text-ash-slate">
            © {new Date().getFullYear()} Jaffari Islamic Youth. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
