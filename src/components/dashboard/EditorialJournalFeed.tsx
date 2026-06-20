import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { ArticleBlock } from "./ArticleBlock";
import { listPublishedArticles } from "@/lib/jiy/youth-press.functions";

function monthYear(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function EditorialJournalFeed() {
  const fetchFn = useServerFn(listPublishedArticles);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-press"],
    queryFn: () => fetchFn(),
    staleTime: 60_000,
  });

  const articles = (data?.articles ?? []).slice(0, 3);

  return (
    <section>
      <div className="flex justify-between items-end border-b border-horizon-mist pb-3 mb-8">
        <h2 className="font-headline text-2xl text-primary-dark">The Youth Press</h2>
        <Link
          to="/press"
          className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate hover:text-damascus-gold font-bold transition-colors"
        >
          Explore Archive →
        </Link>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-ash-slate italic">Loading…</p>
      ) : articles.length === 0 ? (
        <p className="font-body text-sm text-ash-slate italic">
          No articles published yet. The press desk is at work.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {articles.map((article, idx) => (
            <div key={article.id}>
              {idx > 0 && <div className="h-px bg-horizon-mist/60 w-full mb-10" />}
              <ArticleBlock
                slug={article.slug}
                date={monthYear(article.published_at)}
                category="YOUTH PRESS"
                title={article.title}
                excerpt={article.excerpt ?? ""}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
