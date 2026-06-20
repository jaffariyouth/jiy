import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listPublishedOpportunities } from "@/lib/jiy/opportunities.functions";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "scholarship", label: "Scholarships" },
  { value: "fellowship", label: "Fellowships" },
  { value: "job", label: "Jobs" },
  { value: "cfp", label: "Call for Papers" },
  { value: "other", label: "Other" },
] as const;

type Cat = (typeof CATEGORIES)[number]["value"];

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunity Board — JIY" },
      {
        name: "description",
        content:
          "Curated scholarships, fellowships, jobs and calls-for-papers for the JIY community.",
      },
      { property: "og:title", content: "Opportunity Board — JIY" },
      {
        property: "og:description",
        content:
          "Curated scholarships, fellowships, jobs and calls-for-papers for the JIY community.",
      },
    ],
  }),
  component: OpportunityBoard,
});

function OpportunityBoard() {
  const [cat, setCat] = useState<Cat>("all");
  const list = useServerFn(listPublishedOpportunities);
  const q = useQuery({
    queryKey: ["opportunities", "public", cat],
    queryFn: () =>
      list({ data: cat === "all" ? { limit: 50, offset: 0 } : { category: cat, limit: 50, offset: 0 } }),
  });

  return (
    <main className="min-h-screen bg-alabaster-parchment">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-16">
        <header className="border-b border-horizon-mist pb-8 mb-10">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
            JIY CAREERS
          </p>
          <h1 className="font-headline text-4xl md:text-5xl text-primary-dark mt-3">
            Opportunity Board
          </h1>
          <p className="font-body text-sm text-ash-slate mt-4 max-w-2xl leading-relaxed">
            Curated scholarships, fellowships, jobs, and calls-for-papers for the JIY community.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={`font-body text-[11px] uppercase tracking-[0.18em] px-3 py-2 rounded-sm border transition-colors ${
                cat === c.value
                  ? "bg-primary-dark text-alabaster-parchment border-primary-dark"
                  : "bg-white text-primary-dark border-horizon-mist hover:border-damascus-gold"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {q.isLoading && <p className="font-body text-sm text-ash-slate">Loading…</p>}
        {q.data && q.data.opportunities.length === 0 && (
          <div className="studio-card rounded-xl p-10 bg-white text-center">
            <p className="font-body text-sm text-ash-slate">No opportunities in this category yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {q.data?.opportunities.map((o) => (
            <Link
              key={o.id}
              to="/opportunities/$slug"
              params={{ slug: o.slug }}
              className="studio-card rounded-xl bg-white p-6 hover:shadow-md transition-shadow block"
            >
              {o.cover_image_url && (
                <img
                  src={o.cover_image_url}
                  alt=""
                  className="w-full h-40 object-cover rounded-md mb-4"
                  loading="lazy"
                />
              )}
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-damascus-gold font-bold">
                {o.category}
              </p>
              <h2 className="font-headline text-xl text-primary-dark mt-2">{o.title}</h2>
              {o.organization && (
                <p className="font-body text-xs text-ash-slate mt-1">{o.organization}</p>
              )}
              {o.summary && (
                <p className="font-body text-sm text-ash-slate mt-3 leading-relaxed line-clamp-3">
                  {o.summary}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-ash-slate font-body">
                {o.location && <span>📍 {o.location}</span>}
                {o.deadline && (
                  <span>⏳ Apply by {new Date(o.deadline).toLocaleDateString()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-xs text-ash-slate">
          <Link to="/dashboard" className="hover:text-primary-dark">← Back to dashboard</Link>
        </p>
      </div>
    </main>
  );
}
