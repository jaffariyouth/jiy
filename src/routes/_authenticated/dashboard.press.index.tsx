import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMemberArticles } from "@/lib/jiy/youth-press.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";
import { PressCatalog, type PressArticle } from "@/components/press/PressCatalog";

export const Route = createFileRoute("/_authenticated/dashboard/press/")({
  head: () => ({ meta: [{ title: "The Youth Press — JIY Members" }] }),
  component: MemberPressIndex,
});

function MemberPressIndex() {
  const fetchFn = useServerFn(listMemberArticles);
  const { data, isLoading, error } = useQuery({
    queryKey: ["press-member"],
    queryFn: () => fetchFn(),
    staleTime: 60_000,
  });

  return (
    <MemberPageShell>
      {isLoading ? (
        <div className="max-w-[1000px] mx-auto px-6 py-24">
          <p className="font-body text-sm text-ash-slate italic">Loading the archive…</p>
        </div>
      ) : error ? (
        <div className="max-w-[1000px] mx-auto px-6 py-24">
          <p className="font-body text-sm text-deep-garnet">Could not load articles.</p>
        </div>
      ) : (
        <PressCatalog
          mode="member"
          articles={(data?.articles ?? []) as PressArticle[]}
        />
      )}
    </MemberPageShell>
  );
}
