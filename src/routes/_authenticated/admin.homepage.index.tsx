import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/homepage/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/homepage/hero" });
  },
});
