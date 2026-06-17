import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listAuditLog } from "@/lib/jiy/feature-flags.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  const fn = useServerFn(listAuditLog);
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [filters, setFilters] = useState<{ action?: string; entity?: string }>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["admin", "audit", filters],
    queryFn: () => fn({ data: { limit: 200, offset: 0, ...filters } }),
  });

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      action: action.trim() || undefined,
      entity: entity.trim() || undefined,
    });
  };

  return (
    <div>
      <AdminPageHeader title="Audit log" subtitle="Every admin action is recorded." />
      <div className="px-6 sm:px-10 py-8 space-y-4">
        <form onSubmit={apply} className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs uppercase tracking-[0.18em] text-[#6b6453]">Action</label>
            <Input placeholder="e.g. event.published" value={action} onChange={(e) => setAction(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs uppercase tracking-[0.18em] text-[#6b6453]">Entity</label>
            <Input placeholder="e.g. events" value={entity} onChange={(e) => setEntity(e.target.value)} />
          </div>
          <Button type="submit">Filter</Button>
          {(filters.action || filters.entity) && (
            <Button type="button" variant="ghost" onClick={() => { setAction(""); setEntity(""); setFilters({}); }}>Clear</Button>
          )}
        </form>

        <div className="bg-white border border-[#e5dec9] rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-[#FAF8F5] text-xs uppercase tracking-[0.18em] text-[#6b6453]">
              <tr>
                <th className="text-left px-4 py-3">When</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Entity</th>
                <th className="text-left px-4 py-3">Actor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ead7]">
              {q.data?.entries.map((e) => (
                <>
                  <tr key={e.id}>
                    <td className="px-4 py-2 text-xs text-[#6b6453]">{new Date(e.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 font-medium text-[#010b21]">{e.action}</td>
                    <td className="px-4 py-2">{e.entity ?? "—"}<div className="text-xs text-[#6b6453] truncate max-w-[200px]">{e.entity_id ?? ""}</div></td>
                    <td className="px-4 py-2 text-xs text-[#6b6453] font-mono">{e.actor_id ?? "system"}</td>
                    <td className="px-4 py-2 text-right">
                      {e.metadata && Object.keys(e.metadata as object).length > 0 && (
                        <button type="button" className="text-xs text-[#caa460] hover:underline"
                          onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                          {expanded === e.id ? "Hide" : "View"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === e.id && (
                    <tr key={`${e.id}-x`}>
                      <td colSpan={5} className="px-4 py-3 bg-[#FAF8F5]">
                        <pre className="text-xs overflow-x-auto">{JSON.stringify(e.metadata, null, 2)}</pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {q.data && q.data.entries.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6b6453]">No entries.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
