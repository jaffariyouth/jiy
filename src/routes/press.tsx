import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublishedArticles } from "@/lib/jiy/youth-press.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PressCatalog, type PressArticle } from "@/components/press/PressCatalog";

export const Route = createFileRoute("/press")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard/press" });
  },
  head: () => ({
    meta: [
      { title: "The Youth Press — JIY" },
      {
        name: "description",
        content:
          "Editorial essays, dispatches, and creative writing from the JIY youth press desk.",
      },
      { property: "og:title", content: "The Youth Press — JIY" },
      {
        property: "og:description",
        content:
          "Editorial essays, dispatches, and creative writing from the JIY youth press desk.",
      },
    ],
  }),
  component: PressIndex,
});

function PressIndex() {
  const fetchFn = useServerFn(listPublishedArticles);
  const { data, isLoading, error } = useQuery({
    queryKey: ["press-public"],
    queryFn: () => fetchFn(),
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-alabaster-parchment flex flex-col">
      <SiteHeader />
      {isLoading ? (
        <main className="grow max-w-[1000px] mx-auto px-6 py-24">
          <p className="font-body text-sm text-ash-slate italic">Loading the archive…</p>
        </main>
      ) : error ? (
        <main className="grow max-w-[1000px] mx-auto px-6 py-24">
          <p className="font-body text-sm text-deep-garnet">
            Could not load articles. Please try again later.
          </p>
        </main>
      ) : (
        <PressCatalog
          mode="public"
          articles={(data?.articles ?? []) as PressArticle[]}
        />
      )}
      <SiteFooter />
    </div>
  );
}
