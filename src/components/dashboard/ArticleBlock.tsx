type Props = {
  date: string;
  category: string;
  title: string;
  excerpt: string;
};

export function ArticleBlock({ date, category, title, excerpt }: Props) {
  return (
    <article className="group cursor-pointer">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold mb-1">
            {date}
          </p>
          <p className="font-body text-xs text-ash-slate uppercase tracking-wider font-semibold">
            {category}
          </p>
        </div>
        <div className="md:col-span-9 flex flex-col gap-2">
          <h3 className="font-headline text-2xl text-primary-dark group-hover:text-damascus-gold transition-colors duration-300 leading-snug">
            {title}
          </h3>
          <p className="font-body text-xs text-ash-slate leading-relaxed">{excerpt}</p>
          <span className="font-body text-[10px] uppercase tracking-[0.15em] text-primary-dark font-black mt-2 group-hover:underline decoration-damascus-gold decoration-2 underline-offset-4">
            Read Article →
          </span>
        </div>
      </div>
    </article>
  );
}
