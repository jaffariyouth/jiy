import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listMemberEvents } from "@/lib/jiy/events.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/events/")({
  component: AdminEventsList,
});

function AdminEventsList() {
  const fetchEvents = useServerFn(listMemberEvents);
  const q = useQuery({ queryKey: ["admin", "events"], queryFn: () => fetchEvents() });

  return (
    <div>
      <AdminPageHeader
        title="Events"
        subtitle="Create, publish, and manage one-off events."
        actions={
          <Link to="/admin/events/new">
            <Button>New event</Button>
          </Link>
        }
      />
      <div className="px-6 sm:px-10 py-8">
        <div className="bg-white border border-[#e5dec9] rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-[#FAF8F5] text-xs uppercase tracking-[0.18em] text-[#6b6453]">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Starts</th>
                <th className="text-left px-4 py-3">Capacity</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ead7]">
              {q.isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-[#6b6453]">Loading…</td></tr>}
              {q.data?.events.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-[#010b21]">{e.title}</td>
                  <td className="px-4 py-3">{e.status}</td>
                  <td className="px-4 py-3">{new Date(e.starts_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{e.capacity ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin/events/$id" params={{ id: e.id }} className="text-[#caa460] hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
              {q.data && q.data.events.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6b6453]">No events yet. Create your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
