import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_authenticated/admin/press")({
  component: () => (
    <div>
      <AdminPageHeader title="Press posts" subtitle="Youth Press long-form articles." />
      <div className="px-6 sm:px-10 py-8">
        <p className="text-sm text-[#6b6453]">
          Press editor lands in the next iteration. The existing youth-press server functions
          (<code>createDraft</code>, <code>updateDraft</code>, <code>publishArticle</code>) are already wired —
          this page will use the same MarkdownEditor and image uploader the announcements page uses.
        </p>
      </div>
    </div>
  ),
});
