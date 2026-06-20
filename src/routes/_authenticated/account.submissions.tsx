import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyQuestions } from "@/lib/jiy/scholar-questions.functions";

export const Route = createFileRoute("/_authenticated/account/submissions")({
  head: () => ({ meta: [{ title: "My Submissions — JIY" }] }),
  component: SubmissionsPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending_triage: "Pending triage",
  assigned: "Assigned to a scholar",
  answered: "Answered",
  rejected: "Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  pending_triage: "text-damascus-gold",
  assigned: "text-midnight-sapphire",
  answered: "text-green-700",
  rejected: "text-deep-garnet",
};

function SubmissionsPage() {
  const fetchFn = useServerFn(listMyQuestions);
  const { data, isLoading } = useQuery({
    queryKey: ["my-questions"],
    queryFn: () => fetchFn(),
  });

  if (isLoading) return <p className="font-body text-sm text-ash-slate italic">Loading…</p>;

  const questions = data?.questions ?? [];

  return (
    <section>
      <h2 className="font-headline text-2xl text-primary-dark mb-5">Scholar Q&amp;A</h2>
      {questions.length === 0 ? (
        <div className="studio-card rounded-xl p-8 bg-white text-center">
          <p className="font-body text-sm text-ash-slate italic">
            You haven't asked any questions yet. Use the prompt at the top of your
            dashboard to submit one.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {questions.map((q) => (
            <li key={q.id} className="studio-card rounded-xl p-6 bg-white flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-headline text-base text-primary-dark leading-snug">
                  {q.question_text}
                </p>
                <span
                  className={`font-body text-[10px] uppercase tracking-[0.15em] font-bold shrink-0 ${STATUS_COLOR[q.status] ?? "text-ash-slate"}`}
                >
                  {STATUS_LABEL[q.status] ?? q.status}
                </span>
              </div>
              <p className="font-body text-[10px] uppercase tracking-wider text-ash-slate">
                Submitted {new Date(q.created_at).toLocaleDateString()}
                {q.category ? ` • ${q.category}` : ""}
              </p>
              {q.answer_text ? (
                <div className="mt-2 pt-3 border-t border-horizon-mist/60">
                  <p className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold font-bold mb-2">
                    Scholar's response
                  </p>
                  <p className="font-body text-sm text-ash-slate leading-relaxed whitespace-pre-wrap">
                    {q.answer_text}
                  </p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
