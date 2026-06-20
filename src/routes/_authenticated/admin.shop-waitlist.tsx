import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { listShopWaitlistAdmin } from "@/lib/jiy/shop.functions";

export const Route = createFileRoute("/_authenticated/admin/shop-waitlist")({
  component: AdminShopWaitlist,
});

function AdminShopWaitlist() {
  const list = useServerFn(listShopWaitlistAdmin);
  const q = useQuery({ queryKey: ["admin", "shop-waitlist"], queryFn: () => list() });

  const exportCsv = () => {
    if (!q.data) return;
    const rows = [
      ["email", "source", "created_at"],
      ...q.data.entries.map((e) => [e.email, e.source, e.created_at]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shop-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPageHeader
        title="Shop waitlist"
        subtitle="People signed up to be notified when the JIY merch shop launches."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!q.data?.entries.length}>
            Export CSV
          </Button>
        }
      />
      <div className="px-6 sm:px-10 py-8">
        <p className="text-sm text-[#6b6453] mb-3">
          {q.data ? `${q.data.entries.length} signups` : "Loading…"}
        </p>
        <div className="bg-white border border-[#e5dec9] rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-[#FAF8F5] text-xs uppercase tracking-[0.18em] text-[#6b6453]">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-left px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ead7]">
              {q.data?.entries.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-[#010b21] font-mono">{e.email}</td>
                  <td className="px-4 py-3 text-xs text-[#6b6453]">{e.source}</td>
                  <td className="px-4 py-3 text-xs text-[#6b6453]">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {q.data && q.data.entries.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[#6b6453]">
                    No signups yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#6b6453] mt-6">
          <Link to="/admin">← Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
