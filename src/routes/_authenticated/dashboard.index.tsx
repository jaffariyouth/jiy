import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [{ title: "JIY Central Member Dashboard Hub" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return <DashboardShell />;
}
