import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_authenticated/admin/events/$id")({
  component: EventEditPage,
});

function EventEditPage() {
  const { id } = Route.useParams();
  return (
    <div>
      <AdminPageHeader title="Edit event" subtitle={id} backTo={{ to: "/admin/events", label: "Events" }} />
      <div className="px-6 sm:px-10 py-8 max-w-3xl">
        <p className="text-sm text-[#6b6453]">
          Event editor coming next iteration. The event has been created and can be managed via the API or
          by extending this page (publish/cancel, attach form template, configure payment, see roster).
        </p>
      </div>
    </div>
  );
}
