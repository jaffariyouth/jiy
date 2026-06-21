import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMemberEvents } from "@/lib/jiy/events.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";

export const Route = createFileRoute("/_authenticated/dashboard/events/")({
  head: () => ({ meta: [{ title: "Events — JIY Members" }] }),
  component: MemberEventsIndex,
});

const TZ = "America/Toronto";
function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", timeZone: TZ });
}
function fmtMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", timeZone: TZ }).toUpperCase();
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
}

function MemberEventsIndex() {
  const fetchFn = useServerFn(listMemberEvents);
  const { data, isLoading } = useQuery({
    queryKey: ["member-events"],
    queryFn: () => fetchFn(),
    staleTime: 60_000,
  });
  const events = data?.events ?? [];

  return (
    <MemberPageShell>
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-10">
        <p className="font-body text-[10px] uppercase tracking-[0.32em] text-deep-garnet font-bold">
          MEMBER ACCESS · COMMUNITY EVENTS
        </p>
        <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-persian-indigo mt-4">
          Upcoming Gatherings
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] text-ash-slate leading-relaxed">
          All upcoming JIY events — including those reserved for members.
        </p>
        <div className="mt-10 border-t border-horizon-mist" />
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-24">
        {isLoading ? (
          <p className="font-body text-sm text-ash-slate italic">Loading…</p>
        ) : events.length === 0 ? (
          <div className="bg-white border border-horizon-mist rounded-sm p-12 text-center">
            <p className="font-headline text-xl text-persian-indigo">No events scheduled yet</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((e) => (
              <li key={e.id}>
                <Link
                  to="/dashboard/events/$eventId"
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
                    {e.is_member_only && (
                      <div className="absolute top-3 right-3 bg-damascus-gold text-primary-dark px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-bold rounded-sm">
                        Members
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col">
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
    </MemberPageShell>
  );
}
