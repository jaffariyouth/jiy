import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listMemberEvents } from "@/lib/jiy/events.functions";
import { listAllAnnouncements } from "@/lib/jiy/announcements.functions";
import { listAuditLog } from "@/lib/jiy/feature-flags.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { KpiCard } from "@/components/admin/KpiCard";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchEvents = useServerFn(listMemberEvents);
  const fetchAnns = useServerFn(listAllAnnouncements);
  const fetchAudit = useServerFn(listAuditLog);

  const eventsQ = useQuery({ queryKey: ["admin", "kpi-events"], queryFn: () => fetchEvents() });
  const annsQ = useQuery({ queryKey: ["admin", "kpi-anns"], queryFn: () => fetchAnns() });
  const auditQ = useQuery({ queryKey: ["admin", "kpi-audit"], queryFn: () => fetchAudit({ data: { limit: 10, offset: 0 } }) });

  const upcoming = eventsQ.data?.events.filter((e) => new Date(e.starts_at) > new Date()).length ?? 0;
  const drafts = annsQ.data?.announcements.filter((a) => a.status === "draft").length ?? 0;

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="Overview of activity across the JIY platform." />
      <div className="px-6 sm:px-10 pb-10 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Upcoming events" value={upcoming} href="/admin/events" />
          <KpiCard label="Draft announcements" value={drafts} href="/admin/announcements" />
          <KpiCard label="Audit entries (24h)" value={auditQ.data?.entries.length ?? 0} href="/admin/audit" />
          <KpiCard label="Quick: new event" value="+" href="/admin/events/new" />
        </div>

        <section className="bg-white border border-[#e5dec9] rounded-sm">
          <header className="px-5 py-3 border-b border-[#e5dec9] flex items-center justify-between">
            <h2 className="font-serif text-lg text-[#010b21]">Recent activity</h2>
            <Link to="/admin/audit" className="text-xs text-[#6b6453] hover:text-[#010b21]">View all →</Link>
          </header>
          <ul className="divide-y divide-[#f0ead7]">
            {auditQ.data?.entries.slice(0, 8).map((e) => (
              <li key={e.id} className="px-5 py-3 text-sm flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-[#010b21] truncate">{e.action}</div>
                  <div className="text-xs text-[#6b6453] truncate">{e.entity ?? "—"}</div>
                </div>
                <time className="text-xs text-[#6b6453] shrink-0">{new Date(e.created_at).toLocaleString()}</time>
              </li>
            ))}
            {auditQ.data && auditQ.data.entries.length === 0 && (
              <li className="px-5 py-6 text-sm text-[#6b6453] text-center">No activity yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
