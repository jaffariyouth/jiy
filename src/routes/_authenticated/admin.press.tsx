import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import {
  listAllArticlesAdmin, publishArticle, unpublishArticle, deleteArticle,
} from "@/lib/jiy/youth-press.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/press")({
  component: PressListPage,
});

function PressListPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAllArticlesAdmin);
  const pub = useServerFn(publishArticle);
  const unpub = useServerFn(unpublishArticle);
  const del = useServerFn(deleteArticle);
  const q = useQuery({ queryKey: ["admin", "press"], queryFn: () => list() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "press"] });

  return (
    <div>
      <AdminPageHeader
        title="Press posts"
        subtitle="Youth Press long-form articles."
        actions={<Link to="/admin/press/new"><Button>New article</Button></Link>}
      />
      <div className="px-6 sm:px-10 py-8">
        <div className="bg-white border border-[#e5dec9] rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-[#FAF8F5] text-xs uppercase tracking-[0.18em] text-[#6b6453]">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ead7]">
              {q.isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-[#6b6453]">Loading…</td></tr>}
              {q.data?.articles.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-[#010b21]">{a.title}<div className="text-xs text-[#6b6453] font-mono">{a.slug}</div></td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="px-4 py-3 text-xs text-[#6b6453]">{new Date(a.updated_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link to="/admin/press/$id" params={{ id: a.id }} className="text-[#caa460] hover:underline mr-3">Edit</Link>
                    {a.status === "published" ? (
                      <Button size="sm" variant="ghost" onClick={async () => {
                        await unpub({ data: { id: a.id, idempotencyKey: crypto.randomUUID() } });
                        toast.success("Unpublished"); refresh();
                      }}>Unpublish</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={async () => {
                        await pub({ data: { id: a.id, idempotencyKey: crypto.randomUUID() } });
                        toast.success("Published"); refresh();
                      }}>Publish</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={async () => {
                      if (!confirm("Delete this article?")) return;
                      await del({ data: { id: a.id, idempotencyKey: crypto.randomUUID() } });
                      toast.success("Deleted"); refresh();
                    }}>Delete</Button>
                  </td>
                </tr>
              ))}
              {q.data && q.data.articles.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6b6453]">No articles yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
