import { ArticleBlock } from "./ArticleBlock";

export function EditorialJournalFeed() {
  return (
    <section>
      <div className="flex justify-between items-end border-b border-horizon-mist pb-3 mb-8">
        <h2 className="font-headline text-2xl text-primary-dark">The Youth Press</h2>
        <a
          href="#"
          className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate hover:text-damascus-gold font-bold transition-colors"
        >
          Explore Archive →
        </a>
      </div>

      <div className="flex flex-col gap-10">
        <ArticleBlock
          date="June 2026"
          category="MONTHLY FEATURES"
          title="Navigating Contemporary Philosophy: A Dialogue on Tradition and Modernity"
          excerpt="A deep, modern dialogue reflecting on classical metaphysical pathways inside a fast-paced secular space. Dive into the complete essay written by the local youth board."
        />
        <div className="h-px bg-horizon-mist/60 w-full" />
        <ArticleBlock
          date="May 2026"
          category="YOUTH CREATIVE WRITING"
          title="Echoes of Devotion: Poetry from the Urban Diaspora"
          excerpt="A beautifully compiled series of rhythmic verses exploring structural spiritual journeys, struggles, and identity milestones in urban centers."
        />
      </div>
    </section>
  );
}
