import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { listPublicEvents } from "@/lib/jiy/events.functions";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EventsCatalog } from "@/components/events/EventsCatalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/events/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard/events" });
  },
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
          <h1 className="font-headline text-3xl text-primary-dark mt-3">Events couldn't load</h1>
          <p className="mt-3 text-sm text-ash-slate">{error.message}</p>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="mt-6 interactive-btn border border-damascus-gold bg-damascus-gold text-primary-dark px-5 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase"
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
        <h1 className="font-headline text-3xl text-primary-dark">Not found</h1>
        <Link to="/" className="mt-4 inline-block text-damascus-gold underline">
          Go home
        </Link>
      </div>
    </main>
  ),
  component: EventsPage,
});

function EventsPage() {
  const { events } = Route.useLoaderData();
  return (
    <main className="jiy-dashboard min-h-screen bg-alabaster-parchment font-body text-primary-dark">
      <SiteHeader />
      <EventsCatalog events={events} detailBase="/events" />
      <SiteFooter />
    </main>
  );
}
