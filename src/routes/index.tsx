import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getHomepageData, type HomepageEvent, type HomepageArticle } from "@/lib/jiy/site-content.functions";
import { supabase } from "@/integrations/supabase/client";

const homepageQueryOptions = queryOptions({
  queryKey: ["homepage"],
  queryFn: () => getHomepageData(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JIY — Jaffari Islamic Youth" },
      {
        name: "description",
        content:
          "Empowering tomorrow's leaders through faith, friendship, and purpose. Jaffari Islamic Youth — ISIJ of Toronto.",
      },
      { property: "og:title", content: "JIY — Jaffari Islamic Youth" },
      {
        property: "og:description",
        content: "Rooted in heritage. Built for the future.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homepageQueryOptions),
  component: HomePage,
});

type Section = Record<string, unknown>;
const s = (sec: Section | undefined, key: string, fallback = ""): string => {
  const v = sec?.[key];
  return typeof v === "string" ? v : fallback;
};
const arr = <T,>(sec: Section | undefined, key: string): T[] => {
  const v = sec?.[key];
  return Array.isArray(v) ? (v as T[]) : [];
};

function HomePage() {
  const { data } = useSuspenseQuery(homepageQueryOptions);
  const sections = (data.sections ?? {}) as Record<string, Section>;
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="jiy-dashboard min-h-screen flex flex-col text-persian-indigo">
      <SiteHeader signedIn={signedIn} />
      <main className="flex-1">
        <Hero section={sections.hero} />
        <About section={sections.about} />
        <UpcomingEvents events={data.events} />
        <Ongoing section={sections.ongoing} />
        <ValuesTabs section={sections.values} />
        <PressFeature articles={data.articles} />
      </main>
      <SiteFooter section={sections.footer} />
    </div>
  );
}

function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-horizon-mist sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-margin-safe h-20 flex justify-between items-center gap-4">
        <Link to="/" className="flex flex-col group shrink-0">
          <span className="font-headline text-3xl font-extrabold tracking-tight text-persian-indigo leading-none group-hover:text-damascus-gold transition-colors">
            JIY
          </span>
        </Link>
        <nav className="hidden md:flex gap-8 font-body text-xs uppercase tracking-[0.2em] font-semibold text-ash-slate items-center">
          <a className="hover:text-damascus-gold transition-colors" href="#about">About Us</a>
          <a className="hover:text-damascus-gold transition-colors" href="#upcoming">Events</a>
          <a className="hover:text-damascus-gold transition-colors" href="#press">The Press</a>
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          {signedIn ? (
            <Link
              to="/dashboard"
              className="border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="font-body text-[10px] font-bold tracking-[0.2em] uppercase text-persian-indigo hover:text-damascus-gold transition-colors py-2 px-3"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all"
              >
                Join JIY
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ section }: { section?: Section }) {
  const image = s(section, "image_url");
  return (
    <section className="relative overflow-hidden py-12 lg:py-20 border-b border-horizon-mist bg-white">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-radial from-deep-garnet/10 to-transparent opacity-60" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-radial from-damascus-gold/15 to-transparent opacity-60" />
      <div className="max-w-[1280px] mx-auto px-margin-safe relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-deep-garnet font-black flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-damascus-gold" />
              {s(section, "eyebrow", "Jaffari Islamic Youth")}
            </span>
            <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl text-persian-indigo leading-[1.05] tracking-tight">
              {s(section, "headline", "Rooted in Heritage.")} <br />
              <span className="font-light italic text-ash-slate">
                {s(section, "headline_italic", "Built for the Future.")}
              </span>
            </h1>
            <p className="font-body text-lg text-ash-slate leading-relaxed max-w-xl">
              {s(section, "body")}
            </p>
            <div className="h-px bg-horizon-mist w-full max-w-xl my-2" />
            <div className="flex flex-col gap-3 mt-1">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate font-bold">
                Connect With Us
              </span>
              <div className="flex items-center gap-5">
                <SocialIcons
                  ig={s(section, "instagram_url")}
                  li={s(section, "linkedin_url")}
                  yt={s(section, "youtube_url")}
                  lt={s(section, "linktree_url")}
                />
              </div>
            </div>
          </div>
          {image && (
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] bg-warm-silk-grey rounded-xl overflow-hidden border border-horizon-mist studio-card p-2">
                <img
                  src={image}
                  alt={s(section, "image_caption", "Hero")}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function About({ section }: { section?: Section }) {
  const stats = arr<{ value: string; label: string }>(section, "stats");
  return (
    <section id="about" className="py-24 border-b border-horizon-mist">
      <div className="max-w-[1280px] mx-auto px-margin-safe grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet font-bold">
            {s(section, "eyebrow", "About Us")}
          </span>
          <h2 className="font-headline text-3xl md:text-5xl text-persian-indigo mt-2 leading-tight">
            {s(section, "heading", "Our Story")}
          </h2>
        </div>
        <div className="lg:col-span-7 flex flex-col gap-8">
          <p className="font-body text-base text-ash-slate leading-relaxed">{s(section, "body")}</p>
          {stats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-horizon-mist">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="font-headline text-4xl text-damascus-gold">{stat.value}</p>
                  <p className="font-body text-xs uppercase tracking-[0.15em] text-ash-slate font-bold mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function UpcomingEvents({ events }: { events: HomepageEvent[] }) {
  return (
    <section id="upcoming" className="py-24 border-b border-horizon-mist">
      <div className="max-w-[1280px] mx-auto px-margin-safe">
        <div className="flex flex-col sm:flex-row justify-between items-baseline border-b border-horizon-mist pb-3 mb-10">
          <div>
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet font-bold">
              Coming Soon
            </span>
            <h2 className="font-headline text-3xl text-persian-indigo mt-1">Upcoming Events</h2>
          </div>
          <Link
            to="/events"
            className="font-body text-[10px] uppercase tracking-[0.2em] text-persian-indigo font-bold hover:text-damascus-gold"
          >
            View All →
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="font-body text-sm text-ash-slate italic">No upcoming events yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: HomepageEvent }) {
  const d = new Date(event.starts_at);
  const day = d.getUTCDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short" }).toUpperCase();
  const time = d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
  return (
    <div className="studio-card rounded-xl overflow-hidden flex flex-col bg-white">
      <div className="relative overflow-hidden aspect-[4/5] bg-warm-silk-grey border-b border-horizon-mist p-2">
        {event.cover_image_url && (
          <img
            src={event.cover_image_url}
            className="w-full h-full object-cover rounded-md transition-all duration-700 hover:scale-105"
            alt={event.title}
          />
        )}
        <div className="absolute top-4 left-4 bg-white/95 border border-horizon-mist px-3 py-1 text-center shadow-sm">
          <p className="font-headline text-sm font-bold text-persian-indigo leading-none">{day}</p>
          <p className="font-body text-[9px] uppercase tracking-wider text-ash-slate font-bold mt-0.5">
            {month}
          </p>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <span className="font-body text-[9px] uppercase tracking-[0.2em] text-deep-garnet font-black mb-2">
          {time}
        </span>
        <h3 className="font-headline text-xl text-persian-indigo leading-snug mb-3 hover:text-damascus-gold transition-colors">
          {event.title}
        </h3>
        <p className="font-body text-xs text-ash-slate leading-relaxed flex-grow mb-5 line-clamp-3">
          {event.description ?? event.location ?? ""}
        </p>
        <Link
          to="/events"
          className="interactive-btn w-full bg-persian-indigo text-white hover:bg-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-4 uppercase transition-all text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function Ongoing({ section }: { section?: Section }) {
  const inits = arr<{ icon: string; title: string; description: string }>(section, "initiatives");
  const image = s(section, "image_url");
  return (
    <section id="ongoing" className="py-24 border-b border-horizon-mist bg-white">
      <div className="max-w-[1280px] mx-auto px-margin-safe">
        <div className="flex flex-col sm:flex-row justify-between items-baseline border-b border-horizon-mist pb-3 mb-10">
          <div>
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet font-bold">
              {s(section, "eyebrow", "Community Building")}
            </span>
            <h2 className="font-headline text-3xl text-persian-indigo mt-1">
              {s(section, "heading", "Ongoing Events")}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 flex flex-col gap-4 font-body text-sm text-ash-slate leading-relaxed">
            <p>{s(section, "body_1")}</p>
            <p>{s(section, "body_2")}</p>
            {s(section, "cta_url") && (
              <div className="mt-4">
                <a
                  href={s(section, "cta_url")}
                  className="interactive-btn inline-block bg-deep-garnet text-white hover:bg-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-6 uppercase transition-all"
                >
                  {s(section, "cta_label", "Explore Schedule")}
                </a>
              </div>
            )}
          </div>
          <div className="lg:col-span-4 flex justify-center">
            {image && (
              <div className="relative w-full max-w-[340px] aspect-square bg-warm-silk-grey rounded-xl overflow-hidden border border-horizon-mist shadow-lg">
                <img src={image} className="w-full h-full object-cover" alt="Ongoing event" />
              </div>
            )}
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            {inits.map((it, i) => (
              <div
                key={i}
                className={`flex gap-4 items-start ${
                  i < inits.length - 1 ? "border-b border-horizon-mist/60 pb-4" : "pb-4"
                }`}
              >
                <div className="w-10 h-10 bg-persian-indigo text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{it.icon}</span>
                </div>
                <div>
                  <h4 className="font-headline text-lg text-persian-indigo">{it.title}</h4>
                  <p className="font-body text-xs text-ash-slate mt-1">{it.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesTabs({ section }: { section?: Section }) {
  const tabs = arr<{ title: string; body: string }>(section, "tabs");
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;
  const current = tabs[active] ?? tabs[0];
  const n = (i: number) => (i + 1).toString().padStart(2, "0");
  return (
    <section className="py-24 border-b border-horizon-mist">
      <div className="max-w-[1280px] mx-auto px-margin-safe">
        <div className="mb-10">
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet font-bold">
            {s(section, "eyebrow", "Strategic Foundation")}
          </span>
          <h2 className="font-headline text-3xl md:text-4xl text-persian-indigo mt-1">
            {s(section, "heading", "What Drives Us")}
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 flex flex-col gap-2">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`text-left py-4 pl-6 border-l-2 font-headline text-xl md:text-2xl transition-all ${
                  active === i
                    ? "border-damascus-gold text-persian-indigo bg-damascus-gold/10"
                    : "border-horizon-mist text-ash-slate hover:text-persian-indigo"
                }`}
              >
                {n(i)}. {tab.title}
              </button>
            ))}
          </div>
          <div className="lg:col-span-7">
            <div className="studio-card p-10 md:p-14 rounded-2xl">
              <span className="font-body text-sm text-damascus-gold font-bold tracking-[0.2em] block mb-4">
                {n(active)} — STRATEGIC FOUNDATION
              </span>
              <h3 className="font-headline text-3xl md:text-4xl text-persian-indigo mb-4">
                {current.title}
              </h3>
              <p className="font-body text-base text-ash-slate leading-relaxed">{current.body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PressFeature({ articles }: { articles: HomepageArticle[] }) {
  return (
    <section id="press" className="py-24 border-b border-horizon-mist bg-white">
      <div className="max-w-[1280px] mx-auto px-margin-safe">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet font-bold">
              The Press
            </span>
            <h2 className="font-headline text-3xl md:text-5xl text-persian-indigo mt-2 leading-tight">
              Stories & Scholarship
            </h2>
            <p className="font-body text-sm text-ash-slate mt-6 leading-relaxed">
              Reflections, essays, and youth voices from our community.
            </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            {articles.length === 0 && (
              <p className="text-sm text-ash-slate italic">No published articles yet.</p>
            )}
            {articles.map((a) => (
              <article key={a.id} className="group cursor-pointer flex flex-col gap-4">
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold font-bold">
                  Featured
                </span>
                <h3 className="font-headline text-2xl md:text-3xl text-persian-indigo group-hover:text-damascus-gold transition-colors leading-snug">
                  {a.title}
                </h3>
                <p className="font-body text-xs text-ash-slate leading-relaxed">{a.excerpt ?? ""}</p>
                <div className="flex justify-between items-center pt-4 border-t border-horizon-mist/60">
                  <span className="font-body text-[10px] uppercase tracking-[0.15em] text-persian-indigo font-black group-hover:underline decoration-damascus-gold decoration-2 underline-offset-4">
                    Read Manuscript
                  </span>
                  <span className="font-body text-[10px] text-ash-slate font-bold uppercase tracking-wider">
                    {a.published_at
                      ? new Date(a.published_at).toLocaleDateString("en", {
                          month: "long",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter({ section }: { section?: Section }) {
  return (
    <footer className="bg-white border-t border-horizon-mist py-12 px-margin-safe relative z-10">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 border-b border-horizon-mist/60 pb-8 mb-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-headline text-2xl font-black tracking-tight text-persian-indigo">JIY</span>
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate mt-1 font-semibold">
              Jaffari Islamic Youth
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-body text-[11px] uppercase tracking-[0.15em] text-ash-slate font-bold">
              <a className="hover:text-damascus-gold transition-colors" href="#">Home</a>
              <a className="hover:text-damascus-gold transition-colors" href="#about">About Us</a>
              <a className="hover:text-damascus-gold transition-colors" href="#press">The Press</a>
            </div>
            <div className="flex items-center justify-center gap-5">
              <SocialIcons
                ig={s(section, "instagram_url")}
                li={s(section, "linkedin_url")}
                yt={s(section, "youtube_url")}
                lt={s(section, "linktree_url")}
              />
            </div>
          </div>
          <div className="text-center md:text-right font-body text-[10px] uppercase tracking-wider text-ash-slate font-bold">
            <p>{s(section, "copyright", "© 2026 Jaffari Islamic Youth")}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="font-headline italic text-xs text-damascus-gold/60">
            {s(section, "tagline", "Preserving our identity, modeling the future.")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcons({ ig, li, yt, lt }: { ig?: string; li?: string; yt?: string; lt?: string }) {
  const cls = "w-6 h-6 fill-current";
  return (
    <>
      {ig && (
        <a className="text-[#E1306C] hover:scale-110 transition-transform" href={ig} target="_blank" rel="noopener" aria-label="Instagram">
          <svg className={cls} viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
        </a>
      )}
      {li && (
        <a className="text-[#0077b5] hover:scale-110 transition-transform" href={li} target="_blank" rel="noopener" aria-label="LinkedIn">
          <svg className={cls} viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
        </a>
      )}
      {yt && (
        <a className="text-[#d93025] hover:scale-110 transition-transform" href={yt} target="_blank" rel="noopener" aria-label="YouTube">
          <svg className={cls} viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
        </a>
      )}
      {lt && (
        <a className="text-[#3b9f4b] hover:scale-110 transition-transform" href={lt} target="_blank" rel="noopener" aria-label="Linktree">
          <svg className={cls} viewBox="0 0 24 24"><path d="M13.74 0l-1.83 7.18-5.78-5.78-3.42 3.42 5.78 5.78L1.31 12.4l1.39 4.51 7.18-1.83v9.92h4.24v-9.92l7.18 1.83 1.39-4.51-7.18-2.4 5.78-5.78-3.42-3.42-5.78 5.78L13.74 0z" /></svg>
        </a>
      )}
    </>
  );
}
