import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMemberEvent } from "@/lib/jiy/events.functions";
import { registerForEvent } from "@/lib/jiy/event-registrations.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";

export const Route = createFileRoute("/_authenticated/dashboard/events/$eventId")({
  head: () => ({ meta: [{ title: "Event — JIY Members" }] }),
  notFoundComponent: () => (
    <MemberPageShell>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-headline text-3xl text-persian-indigo">Event not found</h1>
        <Link to="/dashboard/events" className="mt-4 inline-block text-damascus-gold underline">
          Back to events
        </Link>
      </div>
    </MemberPageShell>
  ),
  errorComponent: ({ error }) => (
    <MemberPageShell>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-body text-sm text-deep-garnet">{error.message}</p>
      </div>
    </MemberPageShell>
  ),
  component: MemberEventDetail,
});

const TZ = "America/Toronto";
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: TZ });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
}

type Speaker = { name: string; role?: string; bio?: string; photo_url?: string };

function MemberEventDetail() {
  const { eventId } = Route.useParams();
  const fetchFn = useServerFn(getMemberEvent);
  const register = useServerFn(registerForEvent);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["member-event", eventId],
    queryFn: () => fetchFn({ data: { id: eventId } }),
  });

  const mut = useMutation({
    mutationFn: () =>
      register({
        data: {
          idempotencyKey: `reg-${eventId}-${Date.now()}`,
          eventId,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member-event", eventId] }),
  });

  if (isLoading) {
    return (
      <MemberPageShell>
        <div className="max-w-3xl mx-auto px-6 py-24">
          <p className="font-body text-sm text-ash-slate italic">Loading…</p>
        </div>
      </MemberPageShell>
    );
  }
  if (error || !data) throw notFound();
  const event = data.event;
  const speakers = (Array.isArray(event.speakers) ? event.speakers : []) as Speaker[];

  return (
    <MemberPageShell>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-10">
        <nav className="text-xs uppercase tracking-[0.2em] text-ash-slate font-body">
          <Link to="/dashboard/events" className="hover:text-damascus-gold transition-colors">
            Events
          </Link>
          <span className="mx-2 text-horizon-mist">/</span>
          <span className="text-persian-indigo/70">{event.title}</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-start">
          <div>
            {event.category_label && (
              <p className="text-xs uppercase tracking-[0.32em] text-deep-garnet font-bold font-body">
                {event.category_label}
              </p>
            )}
            {event.is_member_only && (
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-damascus-gold font-black">
                Members-only event
              </p>
            )}
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-persian-indigo mt-4">
              {event.title}
            </h1>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ash-slate">
              <span>
                <span className="font-semibold text-persian-indigo">Date:</span> {fmtDate(event.starts_at)}
              </span>
              <span>
                <span className="font-semibold text-persian-indigo">Time:</span> {fmtTime(event.starts_at)}
                {event.ends_at ? ` – ${fmtTime(event.ends_at)}` : ""}
              </span>
              {event.location && (
                <span>
                  <span className="font-semibold text-persian-indigo">Venue:</span> {event.location}
                </span>
              )}
            </div>
          </div>
          <div className="w-full max-w-md justify-self-center lg:justify-self-end">
            <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-gradient-to-b from-horizon-mist via-horizon-mist/60 to-persian-indigo/30 border border-horizon-mist">
              {event.cover_image_url ? (
                <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-persian-indigo/40 text-sm font-body uppercase tracking-[0.3em]">
                  JIY
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
                      <article key={i} className="bg-white border border-horizon-mist rounded-sm p-5 flex gap-5">
                        <div className="shrink-0">
                          {s.photo_url ? (
                            <img src={s.photo_url} alt={s.name} className="h-20 w-20 rounded-full object-cover border border-horizon-mist" />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-horizon-mist/40 border border-horizon-mist flex items-center justify-center font-headline text-persian-indigo text-xl">
                              {s.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline text-lg text-persian-indigo">{s.name}</h3>
                          {s.role && <p className="text-xs uppercase tracking-[0.2em] text-deep-garnet mt-1">{s.role}</p>}
                          {s.bio && <p className="text-sm text-ash-slate mt-2 leading-relaxed">{s.bio}</p>}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <aside>
              <div className="lg:sticky lg:top-8 bg-white border border-horizon-mist rounded-sm p-7 shadow-sm">
                <h3 className="font-headline text-2xl text-persian-indigo">Register</h3>
                <p className="mt-3 text-sm text-ash-slate leading-relaxed">
                  As a JIY member, your registration is one click away.
                </p>
                {mut.isSuccess ? (
                  <p className="mt-6 font-headline text-lg text-damascus-gold">You're registered ✓</p>
                ) : (
                  <button
                    onClick={() => mut.mutate()}
                    disabled={mut.isPending}
                    className="mt-6 interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo text-[11px] font-bold tracking-[0.22em] py-3.5 px-6 uppercase transition-all w-full disabled:opacity-60"
                  >
                    {mut.isPending ? "Registering…" : "Confirm Registration →"}
                  </button>
                )}
                {mut.isError && (
                  <p className="mt-4 text-xs text-deep-garnet">{(mut.error as Error).message}</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </MemberPageShell>
  );
}
