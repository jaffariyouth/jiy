import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { getArticleBySlug } from "@/lib/jiy/youth-press.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/press/$slug")({
  beforeLoad: async ({ params }) => {
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        throw redirect({ to: "/dashboard/press/$slug", params: { slug: params.slug } });
      }
    }
  },
  loader: async ({ params }) => {
    try {
      return await getArticleBySlug({ data: { slug: params.slug } });
    } catch {
      throw notFound();
    }
  },

  head: ({ loaderData }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: "Article — JIY" }] };
    return {
      meta: [
        { title: `${a.title} — JIY Youth Press` },
        { name: "description", content: a.excerpt ?? a.title },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.excerpt ?? a.title },
        ...(a.cover_image_url
          ? [
              { property: "og:image", content: a.cover_image_url },
              { property: "twitter:image", content: a.cover_image_url },
            ]
          : []),
      ],
    };
  },
  errorComponent: () => (
    <main className="min-h-screen flex items-center justify-center">
      <p className="font-body text-sm text-deep-garnet">Could not load this article.</p>
    </main>
  ),
  notFoundComponent: () => (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="font-headline text-3xl text-primary-dark">Article not found</h1>
      <Link to="/press" className="font-body text-xs uppercase tracking-[0.2em] text-damascus-gold">
        ← Back to the press
      </Link>
    </main>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <main className="min-h-screen bg-alabaster-parchment">
      <article className="max-w-[760px] mx-auto px-6 sm:px-10 py-16">
        <Link
          to="/press"
          className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold hover:text-primary-dark font-bold"
        >
          ← The Youth Press
        </Link>

        <header className="mt-8 border-b border-horizon-mist pb-8">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
            {date}
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
    </main>
  );
}
