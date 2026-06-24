import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { getArticleBySlug } from "@/lib/jiy/youth-press.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArticleReader, type ArticleDetail } from "@/components/press/ArticleReader";

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
    <main className="min-h-screen flex items-center justify-center bg-alabaster-parchment">
      <p className="font-body text-sm text-deep-garnet">Could not load this article.</p>
    </main>
  ),
  notFoundComponent: () => (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-alabaster-parchment">
      <h1 className="font-headline text-3xl text-persian-indigo">Article not found</h1>
      <Link to="/press" className="font-body text-xs uppercase tracking-[0.2em] text-damascus-gold">
        ← Back to the press
      </Link>
    </main>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-alabaster-parchment flex flex-col">
      <SiteHeader />
      <ArticleReader mode="public" article={article as ArticleDetail} />
      <SiteFooter />
    </div>
  );
}
