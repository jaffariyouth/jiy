import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { EventCard } from "./EventCard";
import { listMemberEvents } from "@/lib/jiy/events.functions";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return { day: String(d.getDate()).padStart(2, "0"), month: MONTHS[d.getMonth()] };
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function UpcomingEvents() {
  const fetchEvents = useServerFn(listMemberEvents);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-upcoming-events"],
    queryFn: () => fetchEvents(),
    staleTime: 60_000,
  });

  const now = Date.now();
  const upcoming = (data?.events ?? [])
    .filter((e) => new Date(e.starts_at).getTime() >= now)
    .slice(0, 2);

  return (
    <section>
      <div className="flex justify-between items-end border-b border-horizon-mist pb-3 mb-6">
        <h2 className="font-headline text-2xl text-primary-dark font-normal">Upcoming Events</h2>
        <Link
          to="/dashboard/events"
          className="font-body text-[10px] uppercase tracking-[0.15em] text-damascus-gold font-bold hover:text-primary-dark transition-colors"
        >
          View all →
        </Link>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-ash-slate italic">Loading the schedule…</p>
      ) : upcoming.length === 0 ? (
        <p className="font-body text-sm text-ash-slate italic">
          No upcoming events on the schedule. Check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcoming.map((event) => {
            const { day, month } = formatDate(event.starts_at);
            const eyebrow = `${event.is_member_only ? "Member" : "Public"} • ${formatTime(event.starts_at)}`;
            return (
              <EventCard
                key={event.id}
                id={event.id}
                image={
                  event.cover_image_url ||
                  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800"
                }
                alt={event.title}
                day={day}
                month={month}
                eyebrow={eyebrow}
                title={event.title}
                description={event.description ?? "Details coming soon."}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
