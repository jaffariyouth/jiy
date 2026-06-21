import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMemberArticleBySlug } from "@/lib/jiy/youth-press.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";

export const Route = createFileRoute("/_authenticated/dashboard/press/$slug")({
  head: () => ({ meta: [{ title: "Article — JIY Members" }] }),
  notFoundComponent: () => (
    <MemberPageShell>
      <div className="max-w-[760px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-headline text-3xl text-primary-dark">Article not found</h1>
        <Link to="/dashboard/press" className="mt-4 inline-block font-body text-xs uppercase tracking-[0.2em] text-damascus-gold">
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
  const article = data.article;
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <MemberPageShell>
      <article className="max-w-[760px] mx-auto px-6 sm:px-10 py-16">
        <Link
          to="/dashboard/press"
          className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold hover:text-primary-dark font-bold"
        >
          ← The Youth Press
        </Link>

        <header className="mt-8 border-b border-horizon-mist pb-8">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
            {date}
            {article.audience_visibility === "members" && " · MEMBERS ONLY"}
          </p>
          <h1 className="font-headline text-4xl md:text-5xl text-primary-dark mt-3 leading-tight">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="font-body text-base text-ash-slate mt-5 italic leading-relaxed">
              {article.excerpt}
            </p>
          ) : null}
        </header>

        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full rounded-lg mt-10 mb-10"
          />
        ) : null}

        <div className="font-body text-base text-primary-dark leading-loose whitespace-pre-wrap">
          {article.body_md}
        </div>
      </article>
    </MemberPageShell>
  );
}
