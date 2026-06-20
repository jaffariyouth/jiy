import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunity Board — JIY" },
      {
        name: "description",
        content:
          "Internships, fellowships, and volunteer opportunities curated for the JIY community.",
      },
      { property: "og:title", content: "Opportunity Board — JIY" },
      {
        property: "og:description",
        content:
          "Internships, fellowships, and volunteer opportunities curated for the JIY community.",
      },
    ],
  }),
  component: OpportunityBoard,
});

function OpportunityBoard() {
  return (
    <main className="min-h-screen bg-alabaster-parchment">
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-16">
        <header className="border-b border-horizon-mist pb-8 mb-12">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
            JIY CAREERS
          </p>
          <h1 className="font-headline text-4xl md:text-5xl text-primary-dark mt-3">
            Opportunity Board
          </h1>
          <p className="font-body text-sm text-ash-slate mt-4 max-w-2xl leading-relaxed">
            Curated internships, fellowships, scholarships, and volunteer roles for the
            JIY community.
          </p>
        </header>

        <div className="studio-card rounded-xl p-10 bg-white text-center">
          <h2 className="font-headline text-2xl text-primary-dark">
            Opportunities are coming soon.
          </h2>
          <p className="font-body text-sm text-ash-slate mt-3 max-w-md mx-auto leading-relaxed">
            The opportunity board launches in a future stage. In the meantime, keep an
            eye on announcements from your dashboard.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold hover:text-primary-dark font-black"
          >
            Back to dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
