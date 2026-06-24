import { Link } from "@tanstack/react-router";

export type PressArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  audience_visibility?: string;
};

type Mode = "public" | "member";

function articleLinkProps(mode: Mode, slug: string) {
  return mode === "member"
    ? ({ to: "/dashboard/press/$slug", params: { slug } } as const)
    : ({ to: "/press/$slug", params: { slug } } as const);
}

function CrescentDivider() {
  return (
    <div className="flex items-center py-16 opacity-60">
      <div className="grow border-t border-horizon-mist" />
      <div className="px-6 text-damascus-gold">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      </div>
      <div className="grow border-t border-horizon-mist" />
    </div>
  );
}

function FeaturedHero({ article, mode }: { article: PressArticle; mode: Mode }) {
  const isMembers = article.audience_visibility === "members";
  return (
    <section className="bg-midnight-sapphire text-alabaster-parchment w-full overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <div className="lg:col-span-6 flex flex-col justify-center items-start">
          <span className="text-damascus-gold uppercase tracking-[0.3em] text-xs font-bold mb-6 block">
            {isMembers ? "Members Feature" : "Featured Issue"}
          </span>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-8 text-alabaster-parchment">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="font-body text-lg md:text-xl text-alabaster-parchment/70 font-light leading-relaxed max-w-lg mb-10">
              {article.excerpt}
            </p>
          ) : null}
          <Link
            {...articleLinkProps(mode, article.slug)}
            className="inline-block bg-alabaster-parchment text-midnight-sapphire px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-damascus-gold transition-colors duration-300"
          >
            Read Featured Issue
          </Link>
        </div>
        <div className="lg:col-span-6 relative w-full flex justify-end">
          <div className="relative p-6 border border-horizon-mist/40">
            <img
              alt={article.title}
              className="w-full max-w-lg h-[500px] lg:h-[650px] object-cover opacity-90 block"
              src={
                article.cover_image_url ||
                "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1200"
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeedItem({
  article,
  index,
  mode,
}: {
  article: PressArticle;
  index: number;
  mode: Mode;
}) {
  const variant = index % 3; // 0 image-right, 1 centered, 2 image-left
  const eyebrowLabels = ["Creative Writing", "Featured Essay", "Interview"];
  const eyebrow =
    article.audience_visibility === "members" ? "Members Only" : eyebrowLabels[variant];
  const link = articleLinkProps(mode, article.slug);

  if (variant === 1) {
    return (
      <article className="group py-12">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-damascus-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">
            {eyebrow}
          </span>
          <Link {...link} className="block">
            <h2 className="font-headline text-3xl md:text-5xl text-midnight-sapphire tracking-tight mb-6 group-hover:text-deep-garnet transition-colors duration-300">
              {article.title}
            </h2>
          </Link>
          {article.excerpt ? (
            <p className="font-body text-midnight-sapphire/70 font-light leading-relaxed mb-8 mx-auto">
              {article.excerpt}
            </p>
          ) : null}
          <Link
            {...link}
            className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-damascus-gold hover:text-midnight-sapphire transition-colors duration-300"
          >
            Read <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    );
  }

  const imageLeft = variant === 2;
  return (
    <article className="group flex flex-col md:flex-row gap-12 md:gap-24 items-center py-12">
      <div className={`flex-1 ${imageLeft ? "order-2" : "order-2 md:order-1"}`}>
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block ${
            imageLeft ? "text-midnight-sapphire" : "text-deep-garnet"
          }`}
        >
          {eyebrow}
        </span>
        <Link {...link} className="block">
          <h2 className="font-headline text-3xl md:text-4xl text-midnight-sapphire tracking-tight mb-4 group-hover:text-damascus-gold transition-colors duration-300">
            {article.title}
          </h2>
        </Link>
        {article.excerpt ? (
          <p className="font-body text-midnight-sapphire/70 font-light leading-relaxed mb-6">
            {article.excerpt}
          </p>
        ) : null}
        <Link
          {...link}
          className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-damascus-gold hover:text-midnight-sapphire transition-colors duration-300"
        >
          Read <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className={`w-full md:w-72 shrink-0 ${imageLeft ? "order-1" : "order-1 md:order-2"}`}>
        <Link {...link} className="block">
          <div className="relative p-4 border border-horizon-mist">
            <img
              alt={article.title}
              className="w-full h-80 object-cover grayscale group-hover:grayscale-0 transition-all duration-500 block"
              src={
                article.cover_image_url ||
                "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?auto=format&fit=crop&q=80&w=600"
              }
            />
          </div>
        </Link>
      </div>
    </article>
  );
}

export function PressCatalog({
  articles,
  mode,
}: {
  articles: PressArticle[];
  mode: Mode;
}) {
  if (articles.length === 0) {
    return (
      <main className="max-w-[1000px] mx-auto px-6 py-24 text-center">
        <p className="font-body text-sm text-ash-slate italic">No articles published yet.</p>
      </main>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <>
      <FeaturedHero article={featured} mode={mode} />
      <main className="max-w-[1000px] mx-auto px-6 py-24">
        {rest.map((a, i) => (
          <div key={a.id}>
            <FeedItem article={a} index={i} mode={mode} />
            {i < rest.length - 1 ? <CrescentDivider /> : null}
          </div>
        ))}
      </main>
    </>
  );
}
