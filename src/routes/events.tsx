import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { listPublicEvents } from "@/lib/jiy/events.functions";

export const Route = createFileRoute("/events")({
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
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-xl font-semibold">Events couldn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">
        Go home
      </Link>
    </div>
  ),
  component: EventsPage,
});

function EventsPage() {
  const { events } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Upcoming Events</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Community gatherings open to everyone.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events scheduled yet — check back soon.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((e: (typeof events)[number]) => (
            <li key={e.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-medium">{e.title}</h2>
                <time className="text-xs text-muted-foreground">
                  {new Date(e.starts_at).toLocaleString()}
                </time>
              </div>
              {e.location && (
                <p className="mt-1 text-sm text-muted-foreground">{e.location}</p>
              )}
              {e.description && (
                <p className="mt-3 text-sm leading-relaxed">{e.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}