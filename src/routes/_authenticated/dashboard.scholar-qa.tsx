import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicAnswered } from "@/lib/jiy/scholar-questions.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";

export const Route = createFileRoute("/_authenticated/dashboard/scholar-qa")({
  head: () => ({ meta: [{ title: "Scholar Q&A — JIY Members" }] }),
  component: MemberScholarQA,
});

function MemberScholarQA() {
  const fetchFn = useServerFn(listPublicAnswered);
  const { data, isLoading } = useQuery({
    queryKey: ["scholar-member"],
    queryFn: () => fetchFn(),
    staleTime: 60_000,
  });
  const questions = data?.questions ?? [];

  return (
    <MemberPageShell>
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-16">
        <header className="border-b border-horizon-mist pb-8 mb-12">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
            JIY SCHOLARS
          </p>
          <h1 className="font-headline text-4xl md:text-5xl text-primary-dark mt-3">
            Scholar Q&amp;A
          </h1>
          <p className="font-body text-sm text-ash-slate mt-4 max-w-2xl leading-relaxed">
            Answered questions from the resident scholar board.
          </p>
        </header>

        {isLoading ? (
          <p className="font-body text-sm text-ash-slate italic">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="font-body text-sm text-ash-slate italic">No answered questions yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-horizon-mist/60">
            {questions.map((q) => (
              <li key={q.id} className="py-8 flex flex-col gap-3">
                {q.category && (
                  <p className="font-body text-[10px] uppercase tracking-[0.25em] text-damascus-gold font-bold">
                    {q.category}
                  </p>
                )}
                <h2 className="font-headline text-xl text-primary-dark leading-snug">
                  {q.question_text}
                </h2>
                {q.answer_text && (
                  <p className="font-body text-sm text-ash-slate leading-relaxed whitespace-pre-wrap">
                    {q.answer_text}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </MemberPageShell>
  );
}
