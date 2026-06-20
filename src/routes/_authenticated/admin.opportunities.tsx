import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listAllOpportunitiesAdmin,
  upsertOpportunity,
  deleteOpportunity,
  getOpportunityAdmin,
} from "@/lib/jiy/opportunities.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/opportunities")({
  component: AdminOpportunities,
});

type Category = "scholarship" | "fellowship" | "job" | "cfp" | "other";
type Status = "draft" | "published" | "archived";

type FormState = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  body_md: string;
  category: Category;
  organization: string;
  location: string;
  url: string;
  deadline: string;
  cover_image_url: string;
  status: Status;
};

const EMPTY: FormState = {
  title: "",
  slug: "",
  summary: "",
  body_md: "",
  category: "other",
  organization: "",
  location: "",
  url: "",
  deadline: "",
  cover_image_url: "",
  status: "draft",
};

function AdminOpportunities() {
  const qc = useQueryClient();
  const list = useServerFn(listAllOpportunitiesAdmin);
  const getOne = useServerFn(getOpportunityAdmin);
  const upsert = useServerFn(upsertOpportunity);
  const del = useServerFn(deleteOpportunity);

  const q = useQuery({ queryKey: ["admin", "opportunities"], queryFn: () => list() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "opportunities"] });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const openNew = () => {
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const { opportunity } = await getOne({ data: { id } });
      setForm({
        id: opportunity.id,
        title: opportunity.title,
        slug: opportunity.slug,
        summary: opportunity.summary ?? "",
        body_md: opportunity.body_md ?? "",
        category: opportunity.category,
        organization: opportunity.organization ?? "",
        location: opportunity.location ?? "",
        url: opportunity.url ?? "",
        deadline: opportunity.deadline ? opportunity.deadline.slice(0, 16) : "",
        cover_image_url: opportunity.cover_image_url ?? "",
        status: opportunity.status,
      });
      setOpen(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const saveMut = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          id: form.id,
          idempotencyKey: crypto.randomUUID(),
          title: form.title,
          slug: form.slug || undefined,
          summary: form.summary,
          body_md: form.body_md,
          category: form.category,
          organization: form.organization || null,
          location: form.location || null,
          url: form.url || null,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
          cover_image_url: form.cover_image_url || null,
          status: form.status,
        },
      }),
    onSuccess: () => {
      toast.success(form.id ? "Updated" : "Created");
      setOpen(false);
      setForm(EMPTY);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Auto-slug while typing a new entry
  useEffect(() => {
    if (form.id) return;
    setForm((f) =>
      f.slug
        ? f
        : { ...f },
    );
  }, [form.title, form.id]);

  return (
    <div>
      <AdminPageHeader
        title="Opportunities"
        subtitle="External scholarships, fellowships, jobs, and calls-for-papers."
        actions={<Button onClick={openNew}>New opportunity</Button>}
      />
      <div className="px-6 sm:px-10 py-8">
        <div className="bg-white border border-[#e5dec9] rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-[#FAF8F5] text-xs uppercase tracking-[0.18em] text-[#6b6453]">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Deadline</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ead7]">
              {q.isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[#6b6453]">
                    Loading…
                  </td>
                </tr>
              )}
              {q.data?.opportunities.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium text-[#010b21]">
                    {o.title}
                    <div className="text-xs text-[#6b6453] font-mono">{o.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#6b6453]">
                    {o.category}
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#6b6453]">
                    {o.status}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6b6453]">
                    {o.deadline ? new Date(o.deadline).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      className="text-[#caa460] hover:underline mr-3"
                      onClick={() => openEdit(o.id)}
                    >
                      Edit
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!confirm("Delete this opportunity?")) return;
                        await del({ data: { id: o.id, idempotencyKey: crypto.randomUUID() } });
                        toast.success("Deleted");
                        refresh();
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {q.data && q.data.opportunities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#6b6453]">
                    No opportunities yet.
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit opportunity" : "New opportunity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <Input
              placeholder="Slug (auto if empty)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
              >
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                  <SelectItem value="fellowship">Fellowship</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="cfp">Call for Papers</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as Status }))}
              >
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Organization"
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
              />
              <Input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <Input
              placeholder="Apply URL (https://…)"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs text-[#6b6453]">
                Deadline
                <Input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </label>
              <Input
                placeholder="Cover image URL (optional)"
                value={form.cover_image_url}
                onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
              />
            </div>
            <Textarea
              placeholder="Short summary (one or two sentences)"
              rows={2}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
            <Textarea
              placeholder="Body (markdown / plain text)"
              rows={10}
              value={form.body_md}
              onChange={(e) => setForm((f) => ({ ...f, body_md: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => saveMut.mutate()}
              disabled={!form.title.trim() || saveMut.isPending}
            >
              {saveMut.isPending ? "Saving…" : form.id ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
