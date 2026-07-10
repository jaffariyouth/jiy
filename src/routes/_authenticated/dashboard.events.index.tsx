import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMemberEvents } from "@/lib/jiy/events.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";
import { EventsCatalog } from "@/components/events/EventsCatalog";

export const Route = createFileRoute("/_authenticated/dashboard/events/")({
  head: () => ({ meta: [{ title: "Events — JIY Members" }] }),
  component: MemberEventsIndex,
});

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
      {isLoading ? (
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 py-24">
          <p className="font-body text-sm text-ash-slate italic">Loading…</p>
        </div>
      ) : (
        <EventsCatalog
          events={events}
          detailBase="/dashboard/events"
          eyebrow="MEMBER ACCESS · COMMUNITY EVENTS"
        />
      )}
    </MemberPageShell>
  );
}
