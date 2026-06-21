import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getOpportunityBySlug } from "@/lib/jiy/opportunities.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";

export const Route = createFileRoute("/_authenticated/dashboard/opportunities/$slug")({
  head: () => ({ meta: [{ title: "Opportunity — JIY Members" }] }),
  notFoundComponent: () => (
    <MemberPageShell>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-headline text-2xl text-primary-dark">Opportunity not found</p>
        <Link to="/dashboard/opportunities" className="font-body text-sm text-damascus-gold mt-3 inline-block">
          ← Back to the board
        </Link>
      </div>
    </MemberPageShell>
  ),
  errorComponent: ({ error }) => (
    <MemberPageShell>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-body text-sm text-deep-garnet">{error.message}</p>
      </div>
    </MemberPageShell>
  ),
  component: MemberOpportunityDetail,
});

function MemberOpportunityDetail() {
  const { slug } = Route.useParams();
  const fetchFn = useServerFn(getOpportunityBySlug);
  const q = useQuery({
    queryKey: ["opportunity", "member", slug],
    queryFn: () => fetchFn({ data: { slug } }).then((r) => r.opportunity),
  });

  if (q.isLoading) {
    return (
      <MemberPageShell>
        <div className="max-w-3xl mx-auto px-6 py-24">
          <p className="font-body text-sm text-ash-slate italic">Loading…</p>
        </div>
      </MemberPageShell>
    );
  }
  if (q.error || !q.data) throw notFound();
  const o = q.data;

  return (
    <MemberPageShell>
      <div className="max-w-[820px] mx-auto px-6 sm:px-10 py-16">
        <Link
          to="/dashboard/opportunities"
          className="font-body text-[10px] uppercase tracking-[0.3em] text-damascus-gold hover:text-primary-dark"
        >
          ← Opportunity board
        </Link>

        {o.cover_image_url && (
          <img src={o.cover_image_url} alt={o.title} className="w-full h-64 object-cover rounded-xl mt-6" />
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
          <p className="font-body text-base text-primary-dark mt-6 leading-relaxed font-medium">{o.summary}</p>
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
    </MemberPageShell>
  );
}
