import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMemberArticleBySlug } from "@/lib/jiy/youth-press.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";
import { ArticleReader, type ArticleDetail } from "@/components/press/ArticleReader";

export const Route = createFileRoute("/_authenticated/dashboard/press/$slug")({
  head: () => ({ meta: [{ title: "Article — JIY Members" }] }),
  notFoundComponent: () => (
    <MemberPageShell>
      <div className="max-w-[760px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-headline text-3xl text-persian-indigo">Article not found</h1>
        <Link
          to="/dashboard/press"
          className="mt-4 inline-block font-body text-xs uppercase tracking-[0.2em] text-damascus-gold"
        >
          ← Back to the press
        </Link>
      </div>
    </MemberPageShell>
  ),
  errorComponent: () => (
    <MemberPageShell>
      <div className="max-w-[760px] mx-auto px-6 sm:px-10 py-24 text-center">
        <p className="font-body text-sm text-deep-garnet">Could not load this article.</p>
      </div>
    </MemberPageShell>
  ),
  component: MemberArticlePage,
});

function MemberArticlePage() {
  const { slug } = Route.useParams();
  const fetchFn = useServerFn(getMemberArticleBySlug);
  const { data, isLoading, error } = useQuery({
    queryKey: ["member-article", slug],
    queryFn: () => fetchFn({ data: { slug } }),
  });

  if (isLoading) {
    return (
      <MemberPageShell>
        <div className="max-w-[760px] mx-auto px-6 sm:px-10 py-24">
          <p className="font-body text-sm text-ash-slate italic">Loading…</p>
        </div>
      </MemberPageShell>
    );
  }
  if (error || !data) throw notFound();

  return (
    <MemberPageShell>
      <ArticleReader mode="member" article={data.article as ArticleDetail} />
    </MemberPageShell>
  );
}
