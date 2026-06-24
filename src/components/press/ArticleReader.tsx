import { Link } from "@tanstack/react-router";

export type ArticleDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body_md: string;
  cover_image_url: string | null;
  published_at: string | null;
  audience_visibility?: string;
};

type Mode = "public" | "member";

export function ArticleReader({ article, mode }: { article: ArticleDetail; mode: Mode }) {
  const backProps =
    mode === "member"
      ? ({ to: "/dashboard/press" } as const)
      : ({ to: "/press" } as const);
  const eyebrow =
    article.audience_visibility === "members" ? "MEMBERS ONLY" : "YOUTH PRESS";
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <>
      {/* Hero */}
      <section className="w-full bg-midnight-sapphire pt-24 pb-48 px-6 lg:px-8">
        <div className="max-w-[720px] mx-auto flex flex-col items-center relative">
          <span className="font-body text-[14px] font-bold uppercase tracking-[0.25em] block mb-4 text-damascus-gold text-center">
            {eyebrow}
          </span>
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl text-alabaster-parchment mb-8 leading-[1.05] tracking-tight relative z-10 text-center">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="font-body text-lg md:text-xl text-alabaster-parchment/60 font-light max-w-md text-center leading-relaxed">
              {article.excerpt}
            </p>
          ) : null}
        </div>
      </section>

      {/* Outset image */}
      {article.cover_image_url ? (
        <div className="w-full px-6 lg:px-8 -mt-32 relative z-20 mb-20">
          <div className="w-full max-w-[1024px] mx-auto relative">
            <div className="absolute inset-0 border border-damascus-gold/30 -m-4 pointer-events-none hidden md:block" />
            <div className="absolute inset-0 border border-damascus-gold/10 -m-8 pointer-events-none hidden md:block" />
            <div className="aspect-video w-full overflow-hidden relative shadow-2xl bg-midnight-sapphire">
              <img
                alt={article.title}
                src={article.cover_image_url}
                className="object-cover w-full h-full grayscale opacity-80 md:opacity-100 transition-transform duration-1000 hover:scale-105"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="-mt-24" />
      )}

      {/* Reading canvas */}
      <main className="w-full relative pb-32 max-w-[1024px] mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
        <aside className="w-full lg:w-[240px] shrink-0 lg:sticky lg:top-24 order-2 lg:order-1 flex flex-col gap-8 border-t border-horizon-mist pt-8 lg:border-t-0 lg:pt-0 mt-8 lg:mt-0">
          <Link
            {...backProps}
            className="flex text-deep-garnet hover:text-midnight-sapphire transition-colors duration-300 items-center gap-3 group w-fit"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-body text-[12px] font-bold uppercase tracking-[0.2em]">
              Catalog
            </span>
          </Link>
          <div className="hidden lg:block w-8 h-[1px] bg-horizon-mist" />
          {date ? (
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold mb-1">
                Published
              </p>
              <p className="font-body text-sm text-ash-slate">{date}</p>
            </div>
          ) : null}
        </aside>

        <article className="max-w-[700px] mx-auto lg:mx-0 w-full flex-1 order-1 lg:order-2">
          <div className="font-body text-base text-midnight-sapphire/80 leading-loose text-justify space-y-8 press-drop-cap whitespace-pre-wrap">
            {article.body_md}
          </div>

          <div className="flex justify-center mt-16">
            <svg className="w-6 h-6 text-damascus-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </div>
        </article>
      </main>
    </>
  );
}
