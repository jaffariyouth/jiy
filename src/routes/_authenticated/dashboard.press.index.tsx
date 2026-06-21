import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMemberArticles } from "@/lib/jiy/youth-press.functions";
import { MemberPageShell } from "@/components/dashboard/MemberPageShell";

export const Route = createFileRoute("/_authenticated/dashboard/press/")({
  head: () => ({ meta: [{ title: "The Youth Press — JIY Members" }] }),
  component: MemberPressIndex,
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function MemberPressIndex() {
  const fetchFn = useServerFn(listMemberArticles);
  const { data, isLoading, error } = useQuery({
    queryKey: ["press-member"],
    queryFn: () => fetchFn(),
    staleTime: 60_000,
  });

  return (
    <MemberPageShell>
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-16">
        <header className="border-b border-horizon-mist pb-8 mb-12">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-deep-garnet font-bold">
            JIY EDITORIAL · MEMBER ACCESS
          </p>
          <h1 className="font-headline text-4xl md:text-5xl text-primary-dark mt-3">
            The Youth Press
          </h1>
          <p className="font-body text-sm text-ash-slate mt-4 max-w-2xl leading-relaxed">
            Long-form essays, dispatches, and creative writing — including members-only pieces.
          </p>
        </header>

        {isLoading ? (
          <p className="font-body text-sm text-ash-slate italic">Loading the archive…</p>
        ) : error ? (
          <p className="font-body text-sm text-deep-garnet">Could not load articles.</p>
        ) : (data?.articles ?? []).length === 0 ? (
          <p className="font-body text-sm text-ash-slate italic">No articles published yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-horizon-mist/60">
            {data!.articles.map((a) => (
              <li key={a.id} className="py-8">
                <Link
                  to="/dashboard/press/$slug"
                  params={{ slug: a.slug }}
                  className="group grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  <div className="md:col-span-3">
                    <p className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold">
                      {formatDate(a.published_at)}
                    </p>
                    {a.audience_visibility === "members" && (
                      <p className="mt-2 font-body text-[9px] uppercase tracking-[0.25em] text-damascus-gold font-bold">
                        Members Only
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-9">
                    <h2 className="font-headline text-2xl md:text-3xl text-primary-dark group-hover:text-damascus-gold transition-colors leading-snug">
                      {a.title}
                    </h2>
                    {a.excerpt ? (
                      <p className="font-body text-sm text-ash-slate mt-3 leading-relaxed">
                        {a.excerpt}
                      </p>
                    ) : null}
                    <span className="font-body text-[10px] uppercase tracking-[0.2em] text-primary-dark font-black mt-4 inline-block group-hover:underline decoration-damascus-gold decoration-2 underline-offset-4">
                      Read article →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MemberPageShell>
  );
}
