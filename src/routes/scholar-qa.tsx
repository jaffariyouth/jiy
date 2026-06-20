import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicAnswered } from "@/lib/jiy/scholar-questions.functions";

export const Route = createFileRoute("/scholar-qa")({
  head: () => ({
    meta: [
      { title: "Scholar Q&A — JIY" },
      {
        name: "description",
        content:
          "Read answered questions from the JIY resident scholars, or submit your own.",
      },
      { property: "og:title", content: "Scholar Q&A — JIY" },
      {
        property: "og:description",
        content:
          "Read answered questions from the JIY resident scholars, or submit your own.",
      },
    ],
  }),
  component: ScholarQA,
});

function ScholarQA() {
  const fetchFn = useServerFn(listPublicAnswered);
  const { data, isLoading } = useQuery({
    queryKey: ["scholar-public"],
    queryFn: () => fetchFn(),
    staleTime: 60_000,
  });

  const questions = data?.questions ?? [];

  return (
    <main className="min-h-screen bg-alabaster-parchment">
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-16">
        <header className="border-b border-horizon-mist pb-8 mb-12 flex flex-col gap-6">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
              JIY SCHOLARS
            </p>
            <h1 className="font-headline text-4xl md:text-5xl text-primary-dark mt-3">
              Scholar Q&amp;A
            </h1>
            <p className="font-body text-sm text-ash-slate mt-4 max-w-2xl leading-relaxed">
              Answered questions from the resident scholar board. To submit a new
              question, head to your dashboard.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="self-start interactive-btn bg-midnight-sapphire text-white hover:bg-damascus-gold hover:text-primary-dark font-body text-[10px] font-bold tracking-[0.2em] py-3 px-6 rounded-[4px] uppercase transition-all"
          >
            Ask a question →
          </Link>
        </header>

        {isLoading ? (
          <p className="font-body text-sm text-ash-slate italic">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="font-body text-sm text-ash-slate italic">
            No answered questions yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-horizon-mist/60">
            {questions.map((q) => (
              <li key={q.id} className="py-8 flex flex-col gap-3">
                {q.category ? (
                  <p className="font-body text-[10px] uppercase tracking-[0.25em] text-damascus-gold font-bold">
                    {q.category}
                  </p>
                ) : null}
                <h2 className="font-headline text-xl text-primary-dark leading-snug">
                  {q.question_text}
                </h2>
                {q.answer_text ? (
                  <p className="font-body text-sm text-ash-slate leading-relaxed whitespace-pre-wrap">
                    {q.answer_text}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
