import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "JIY Central Member Dashboard Hub" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <iframe
      src="/dashboard.html"
      title="Member Dashboard"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0 }}
    />
  );
}