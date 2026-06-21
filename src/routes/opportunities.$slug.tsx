import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/opportunities/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/dashboard/opportunities/$slug",
      params: { slug: params.slug },
    });
  },
  component: () => null,
});
