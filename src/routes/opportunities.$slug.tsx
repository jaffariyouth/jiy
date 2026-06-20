import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getOpportunityBySlug } from "@/lib/jiy/opportunities.functions";

export const Route = createFileRoute("/opportunities/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await getOpportunityBySlug({ data: { slug: params.slug } });
      return res.opportunity;
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Opportunity — JIY" }] };
    return {
      meta: [
        { title: `${loaderData.title} — JIY Opportunities` },
        { name: "description", content: loaderData.summary || loaderData.title },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.summary || loaderData.title },
        ...(loaderData.cover_image_url
          ? [
              { property: "og:image", content: loaderData.cover_image_url },
              { property: "twitter:image", content: loaderData.cover_image_url },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <main className="min-h-screen bg-alabaster-parchment flex items-center justify-center">
      <div className="text-center">
        <p className="font-headline text-2xl text-primary-dark">Opportunity not found</p>
        <Link to="/opportunities" className="font-body text-sm text-damascus-gold mt-3 inline-block">
          ← Back to the board
        </Link>
      </div>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-alabaster-parchment flex items-center justify-center">
      <p className="font-body text-sm text-deep-garnet">{error.message}</p>
    </main>
  ),
  component: OpportunityDetail,
});

function OpportunityDetail() {
  const initial = Route.useLoaderData();
  const fetch = useServerFn(getOpportunityBySlug);
  const q = useQuery({
    queryKey: ["opportunity", initial.slug],
    queryFn: () => fetch({ data: { slug: initial.slug } }).then((r) => r.opportunity),
    initialData: initial,
  });
  const o = q.data;

  return (
    <main className="min-h-screen bg-alabaster-parchment">
      <div className="max-w-[820px] mx-auto px-6 sm:px-10 py-16">
        <Link
          to="/opportunities"
          className="font-body text-[10px] uppercase tracking-[0.3em] text-damascus-gold hover:text-primary-dark"
        >
          ← Opportunity board
        </Link>

        {o.cover_image_url && (
          <img
            src={o.cover_image_url}
            alt={o.title}
            className="w-full h-64 object-cover rounded-xl mt-6"
          />
        )}

        <header className="mt-8 border-b border-horizon-mist pb-6">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
            {o.category}
            {o.organization && ` · ${o.organization}`}
          </p>
          <h1 className="font-headline text-3xl md:text-5xl text-primary-dark mt-3">{o.title}</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-ash-slate font-body">
            {o.location && <span>📍 {o.location}</span>}
            {o.deadline && <span>⏳ Apply by {new Date(o.deadline).toLocaleDateString()}</span>}
          </div>
        </header>

        {o.summary && (
          <p className="font-body text-base text-primary-dark mt-6 leading-relaxed font-medium">
            {o.summary}
          </p>
        )}

        {o.body_md && (
          <article className="prose prose-neutral max-w-none mt-6 font-body text-ash-slate whitespace-pre-wrap leading-relaxed">
            {o.body_md}
          </article>
        )}

        {o.url && (
          <a
            href={o.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block bg-primary-dark text-alabaster-parchment font-body text-[11px] uppercase tracking-[0.18em] px-6 py-3 rounded-sm hover:bg-deep-garnet transition-colors"
          >
            Apply / Learn more →
          </a>
        )}
      </div>
    </main>
  );
}
