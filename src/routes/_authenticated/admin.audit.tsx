import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listAuditLog } from "@/lib/jiy/feature-flags.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  const fn = useServerFn(listAuditLog);
  const q = useQuery({ queryKey: ["admin", "audit"], queryFn: () => fn({ data: { limit: 200, offset: 0 } }) });
  return (
    <div>
      <AdminPageHeader title="Audit log" subtitle="Every admin action is recorded." />
      <div className="px-6 sm:px-10 py-8">
        <div className="bg-white border border-[#e5dec9] rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-[#FAF8F5] text-xs uppercase tracking-[0.18em] text-[#6b6453]">
              <tr><th className="text-left px-4 py-3">When</th><th className="text-left px-4 py-3">Action</th><th className="text-left px-4 py-3">Entity</th><th className="text-left px-4 py-3">Actor</th></tr>
            </thead>
            <tbody className="divide-y divide-[#f0ead7]">
              {q.data?.entries.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2 text-xs text-[#6b6453]">{new Date(e.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium text-[#010b21]">{e.action}</td>
                  <td className="px-4 py-2">{e.entity ?? "—"} <span className="text-xs text-[#6b6453]">{e.entity_id ?? ""}</span></td>
                  <td className="px-4 py-2 text-xs text-[#6b6453]">{e.actor_id ?? "system"}</td>
                </tr>
              ))}
              {q.data && q.data.entries.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6b6453]">No entries.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
