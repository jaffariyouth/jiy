import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/scholar-qa")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/scholar-qa" });
  },
  component: () => null,
});
