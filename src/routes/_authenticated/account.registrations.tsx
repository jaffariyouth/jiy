import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listMyRegistrations,
  cancelMyRegistration,
} from "@/lib/jiy/event-registrations.functions";

export const Route = createFileRoute("/_authenticated/account/registrations")({
  head: () => ({ meta: [{ title: "My Registrations — JIY" }] }),
  component: RegistrationsPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function RegistrationsPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(listMyRegistrations);
  const cancelFn = useServerFn(cancelMyRegistration);

  const { data, isLoading } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: () => fetchFn(),
  });

  const cancelMut = useMutation({
    mutationFn: (registrationId: string) =>
      cancelFn({
        data: {
          idempotencyKey: `cancel-${registrationId}-${Date.now()}`,
          registrationId,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-registrations"] }),
  });

  if (isLoading) return <p className="font-body text-sm text-ash-slate italic">Loading…</p>;

  const regs = data?.registrations ?? [];
  const now = Date.now();
  const upcoming = regs.filter(
    (r) =>
      r.check_in_status !== "cancelled" &&
      r.events &&
      new Date(r.events.starts_at).getTime() >= now,
  );
  const past = regs.filter(
    (r) =>
      r.check_in_status === "cancelled" ||
      !r.events ||
      new Date(r.events.starts_at).getTime() < now,
  );

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-headline text-2xl text-primary-dark mb-5">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="studio-card rounded-xl p-8 bg-white text-center">
            <p className="font-body text-sm text-ash-slate italic">
              You haven't registered for any upcoming events.
            </p>
            <Link
              to="/events"
              className="mt-4 inline-block font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold hover:text-primary-dark font-black"
            >
              Browse events →
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {upcoming.map((r) => (
              <li
                key={r.id}
                className="studio-card rounded-xl p-6 bg-white flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="font-headline text-lg text-primary-dark truncate">
                    {r.events?.title ?? "Event"}
                  </h3>
                  <p className="font-body text-xs text-ash-slate uppercase tracking-wide mt-1">
                    {r.events ? formatDate(r.events.starts_at) : ""}
                    {r.events?.location ? ` • ${r.events.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {r.events ? (
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: r.events.id }}
                      className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold hover:text-primary-dark font-bold"
                    >
                      Details
                    </Link>
                  ) : null}
                  <button
                    onClick={() => {
                      if (confirm("Cancel this registration?")) cancelMut.mutate(r.id);
                    }}
                    disabled={cancelMut.isPending}
                    className="font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet hover:text-primary-dark font-bold disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-headline text-2xl text-primary-dark mb-5">Past</h2>
        {past.length === 0 ? (
          <p className="font-body text-sm text-ash-slate italic">No past registrations.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {past.map((r) => (
              <li
                key={r.id}
                className="p-4 bg-warm-silk-grey/30 border border-horizon-mist/40 rounded-md flex justify-between items-center"
              >
                <div className="min-w-0">
                  <h4 className="font-headline text-sm text-ash-slate truncate">
                    {r.events?.title ?? "Event"}
                  </h4>
                  <p className="font-body text-[10px] text-ash-slate/70 uppercase mt-0.5">
                    {r.check_in_status === "cancelled"
                      ? "Cancelled"
                      : r.events
                        ? `Ended ${formatDate(r.events.starts_at)}`
                        : "Ended"}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-ash-slate/50"
                  style={{ fontVariationSettings: "'wght' 200" }}
                >
                  {r.check_in_status === "checked_in" ? "verified" : "event_busy"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
