import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getTeamPageData } from "@/lib/jiy/site-content.functions";
import { supabase } from "@/integrations/supabase/client";

const teamQueryOptions = queryOptions({
  queryKey: ["team-page"],
  queryFn: () => getTeamPageData(),
});

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Meet the Team — Jaffari Islamic Youth" },
      {
        name: "description",
        content:
          "Meet the leadership and members behind Jaffari Islamic Youth — the people building faith, friendship, and purpose for our community.",
      },
      { property: "og:title", content: "Meet the Team — JIY" },
      {
        property: "og:description",
        content: "The leadership and members of Jaffari Islamic Youth.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(teamQueryOptions),
  component: TeamPage,
});

/* ------------------------------------------------------------------ */
/* Helpers + defaults                                                  */
/* ------------------------------------------------------------------ */

type Section = Record<string, unknown>;
const str = (sec: Section | undefined, key: string, fallback = ""): string => {
  const v = sec?.[key];
  return typeof v === "string" && v.length > 0 ? v : fallback;
};
const arr = <T,>(sec: Section | undefined, key: string, fallback: T[] = []): T[] => {
  const v = sec?.[key];
  return Array.isArray(v) && v.length > 0 ? (v as T[]) : fallback;
};

export type Leader = {
  photo_url: string;
  name: string;
  role: string;
  bio: string;
  email?: string;
  linkedin?: string;
};
export type Member = {
  photo_url: string;
  name: string;
  role: string;
  region?: string;
};

export const TEAM_DEFAULTS = {
  hero: {
    kicker: "❖ Meet the Team ❖",
    headline_line1: "The People",
    headline_line2_italic: "Behind JIY.",
    body:
      "Our board, committees, and members are united by a shared commitment to faith, friendship, and purpose. Together, we shape the programs and spaces that bring our youth community to life.",
    photo_url:
      "https://youth.jaffari.org/wp-content/uploads/2025/04/Group-edited-1024x1024.jpg",
    photo_caption: "JIY Executive Board",
  },
  intro: {
    kicker: "OUR APPROACH",
    headline: "Service Through Stewardship",
    body_paragraph_1:
      "Every member of the Jaffari Islamic Youth team serves voluntarily — driven by a love for the community and a sense of amānah (trust) toward the youth we serve.",
    body_paragraph_2:
      "Our structure balances scholarly guidance with the energy of young leaders, ensuring that every initiative is rooted in tradition and responsive to today's realities.",
    pull_quote:
      "\"Leadership in our tradition is service — quiet, consistent, and grounded in faith.\"",
    pull_quote_attribution: "— JIY EXECUTIVE BOARD",
  },
  leadership: {
    section_kicker: "EXECUTIVE BOARD",
    section_headline: "Leadership",
    section_subhead_italic: "& Stewards",
    members: [
      {
        photo_url: "",
        name: "Add a leader",
        role: "President",
        bio: "Use the admin panel to add board members, their photos, and short bios.",
        email: "",
        linkedin: "",
      },
    ] as Leader[],
  },
  members: {
    section_kicker: "COMMITTEES & MEMBERS",
    section_headline: "The Wider",
    section_subhead_italic: "Team",
    body:
      "Committee leads, volunteers, and members who keep our programs running week after week.",
    items: [] as Member[],
  },
  cta: {
    kicker: "JOIN US",
    headline: "Become Part of the Team",
    body:
      "Whether you're a youth looking to volunteer, a scholar wanting to mentor, or a community member ready to contribute — we'd love to hear from you.",
    cta_label: "Get Involved",
    cta_href: "/auth",
  },
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function TeamPage() {
  const { data } = useSuspenseQuery(teamQueryOptions);
  const sections = (data.sections ?? {}) as Record<string, Section>;
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="jiy-dashboard min-h-screen">
      <OgeeArchDefs />
      <Header signedIn={signedIn} />
      <TeamHero hero={sections.team_hero} />
      <TeamIntro intro={sections.team_intro} />
      <Leadership leadership={sections.team_leadership} />
      <Members members={sections.team_members} />
      <TeamCTA cta={sections.team_cta} />
      <Footer footer={sections.footer} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SVG ogee mask                                                       */
/* ------------------------------------------------------------------ */

function OgeeArchDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <clipPath id="ogee-arch-mask" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.4 C0,0.18 0.2,0 0.5,0 C0.8,0 1,0.18 1,0.4 L1,1 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Header (mirrors homepage)                                           */
/* ------------------------------------------------------------------ */

function Header({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-horizon-mist sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-max-width mx-auto px-margin-safe h-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex flex-col group">
            <span className="font-headline text-3xl font-extrabold tracking-tight text-persian-indigo leading-none group-hover:text-damascus-gold transition-colors duration-200">
              JIY
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex gap-8 font-body text-xs uppercase tracking-[0.2em] font-semibold text-ash-slate items-center">
          <Link
            to="/"
            className="hover:text-damascus-gold transition-colors duration-200 relative py-1 group"
          >
            Home
          </Link>
          <Link
            to="/team"
            className="text-damascus-gold transition-colors duration-200 relative py-1 group"
          >
            Our Team
          </Link>
          <a
            className="hover:text-damascus-gold transition-colors duration-200 relative py-1 group"
            href="/#about-us"
          >
            About Us
          </a>
          <a
            className="hover:text-damascus-gold transition-colors duration-200 relative py-1 group"
            href="/#journal"
          >
            The Press
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <Link
              to="/dashboard"
              className="interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all duration-300"
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
                className="interactive-btn border border-persian-indigo bg-persian-indigo text-white hover:bg-damascus-gold hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-2.5 px-5 uppercase transition-all duration-300"
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

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function TeamHero({ hero }: { hero?: Section }) {
  const d = TEAM_DEFAULTS.hero;
  return (
    <section className="relative overflow-hidden py-12 lg:py-20 border-b border-horizon-mist bg-white">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at center, #caa460 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-deep-garnet/10 via-transparent to-transparent opacity-60" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-damascus-gold/15 via-transparent to-transparent opacity-60" />

      <div className="max-w-max-width mx-auto px-margin-safe relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-deep-garnet font-black flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-damascus-gold" />
              {str(hero, "kicker", d.kicker)}
            </span>
            <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl text-persian-indigo leading-[1.05] tracking-tight">
              {str(hero, "headline_line1", d.headline_line1)} <br />
              <span className="font-light italic text-ash-slate">
                {str(hero, "headline_line2_italic", d.headline_line2_italic)}
              </span>
            </h1>
            <p className="font-body text-lg text-ash-slate leading-relaxed max-w-xl">
              {str(hero, "body", d.body)}
            </p>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[400px] aspect-[4/5] bg-warm-silk-grey p-4 border border-horizon-mist group shadow-xl transition-all duration-500 hover:border-damascus-gold">
              <div className="w-full h-full overflow-hidden relative ogee-arch-portal bg-white">
                <img
                  src={str(hero, "photo_url", d.photo_url)}
                  className="w-full h-full object-cover transition-all duration-1000 scale-100 group-hover:scale-105"
                  alt={str(hero, "photo_caption", d.photo_caption)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-persian-indigo/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-3 border border-horizon-mist/60 shadow-md">
                  <p className="font-body text-[10px] uppercase tracking-wider text-persian-indigo font-bold">
                    {str(hero, "photo_caption", d.photo_caption)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Intro                                                               */
/* ------------------------------------------------------------------ */

function TeamIntro({ intro }: { intro?: Section }) {
  const d = TEAM_DEFAULTS.intro;
  return (
    <section className="py-24 bg-alabaster-parchment border-b border-horizon-mist">
      <div className="max-w-max-width mx-auto px-margin-safe">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold">
              {str(intro, "kicker", d.kicker)}
            </span>
            <h2 className="font-headline text-4xl md:text-5xl text-persian-indigo mt-2 tracking-tight">
              {str(intro, "headline", d.headline)}
            </h2>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-5">
            <p className="font-body text-base text-ash-slate leading-relaxed">
              {str(intro, "body_paragraph_1", d.body_paragraph_1)}
            </p>
            <p className="font-body text-base text-ash-slate leading-relaxed">
              {str(intro, "body_paragraph_2", d.body_paragraph_2)}
            </p>
            <div className="border-l-2 border-damascus-gold pl-5 mt-4">
              <p className="font-headline italic text-xl text-persian-indigo leading-snug">
                {str(intro, "pull_quote", d.pull_quote)}
              </p>
              <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate font-bold mt-2">
                {str(intro, "pull_quote_attribution", d.pull_quote_attribution)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Leadership grid                                                     */
/* ------------------------------------------------------------------ */

function Leadership({ leadership }: { leadership?: Section }) {
  const d = TEAM_DEFAULTS.leadership;
  const members = arr<Leader>(leadership, "members", d.members);
  return (
    <section className="py-24 bg-white border-b border-horizon-mist">
      <div className="max-w-max-width mx-auto px-margin-safe">
        <div className="flex flex-col sm:flex-row justify-between items-baseline border-b border-horizon-mist pb-4 mb-16">
          <div className="flex flex-col">
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold">
              {str(leadership, "section_kicker", d.section_kicker)}
            </span>
            <h2 className="font-headline text-4xl text-persian-indigo mt-1 tracking-tight font-black">
              {str(leadership, "section_headline", d.section_headline)}{" "}
              <span className="font-light italic text-2xl text-ash-slate ml-2">
                {str(leadership, "section_subhead_italic", d.section_subhead_italic)}
              </span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((m, i) => (
            <article
              key={i}
              className="studio-card p-6 flex flex-col gap-4 group"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-warm-silk-grey border border-horizon-mist/60 relative ogee-arch-portal">
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ash-slate text-xs uppercase tracking-widest">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-body text-[10px] uppercase tracking-[0.22em] text-damascus-gold font-bold">
                  {m.role}
                </span>
                <h3 className="font-headline text-2xl text-persian-indigo tracking-tight">
                  {m.name}
                </h3>
              </div>
              {m.bio && (
                <p className="font-body text-sm text-ash-slate leading-relaxed">{m.bio}</p>
              )}
              {(m.email || m.linkedin) && (
                <div className="flex gap-4 pt-2 border-t border-horizon-mist/60 mt-auto">
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="font-body text-[10px] uppercase tracking-[0.18em] text-ash-slate hover:text-damascus-gold font-bold"
                    >
                      Email
                    </a>
                  )}
                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener"
                      className="font-body text-[10px] uppercase tracking-[0.18em] text-ash-slate hover:text-damascus-gold font-bold"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Members grid                                                        */
/* ------------------------------------------------------------------ */

function Members({ members }: { members?: Section }) {
  const d = TEAM_DEFAULTS.members;
  const items = arr<Member>(members, "items", d.items);
  if (items.length === 0) return null;
  return (
    <section className="py-24 bg-alabaster-parchment border-b border-horizon-mist">
      <div className="max-w-max-width mx-auto px-margin-safe">
        <div className="flex flex-col sm:flex-row justify-between items-baseline border-b border-horizon-mist pb-4 mb-12">
          <div className="flex flex-col">
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold">
              {str(members, "section_kicker", d.section_kicker)}
            </span>
            <h2 className="font-headline text-4xl text-persian-indigo mt-1 tracking-tight font-black">
              {str(members, "section_headline", d.section_headline)}{" "}
              <span className="font-light italic text-2xl text-ash-slate ml-2">
                {str(members, "section_subhead_italic", d.section_subhead_italic)}
              </span>
            </h2>
            <p className="font-body text-sm text-ash-slate mt-3 max-w-xl">
              {str(members, "body", d.body)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((m, i) => (
            <article key={i} className="studio-card p-4 flex flex-col gap-3">
              <div className="aspect-square w-full overflow-hidden bg-warm-silk-grey border border-horizon-mist/60">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ash-slate text-[10px] uppercase tracking-widest">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="font-headline text-lg text-persian-indigo leading-tight">{m.name}</h4>
                <span className="font-body text-[10px] uppercase tracking-[0.18em] text-damascus-gold font-bold">
                  {m.role}
                </span>
                {m.region && (
                  <span className="font-body text-[10px] uppercase tracking-[0.15em] text-ash-slate mt-1">
                    {m.region}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA                                                                 */
/* ------------------------------------------------------------------ */

function TeamCTA({ cta }: { cta?: Section }) {
  const d = TEAM_DEFAULTS.cta;
  return (
    <section className="py-20 bg-persian-indigo text-white border-b border-horizon-mist/20">
      <div className="max-w-max-width mx-auto px-margin-safe text-center flex flex-col items-center gap-6">
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-damascus-gold font-bold">
          {str(cta, "kicker", d.kicker)}
        </span>
        <h2 className="font-headline text-4xl md:text-5xl text-white tracking-tight max-w-3xl">
          {str(cta, "headline", d.headline)}
        </h2>
        <p className="font-body text-base text-white/80 leading-relaxed max-w-2xl">
          {str(cta, "body", d.body)}
        </p>
        <a
          href={str(cta, "cta_href", d.cta_href)}
          className="interactive-btn mt-4 bg-damascus-gold text-persian-indigo hover:bg-white font-body text-[11px] font-bold tracking-[0.2em] py-4 px-8 uppercase transition-all duration-300"
        >
          {str(cta, "cta_label", d.cta_label)}
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer (minimal, reused style)                                      */
/* ------------------------------------------------------------------ */

function Footer({ footer }: { footer?: Section }) {
  const tagline = str(footer, "brand_tagline", "Jaffari Islamic Youth");
  const copyright = str(footer, "copyright", "© 2026 Jaffari Islamic Youth. All rights reserved.");
  return (
    <footer className="bg-white border-t border-horizon-mist py-12 px-margin-safe w-full">
      <div className="max-w-max-width mx-auto text-center">
        <span className="font-headline text-2xl font-black tracking-tight text-persian-indigo">JIY</span>
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate mt-1 font-semibold">
          {tagline}
        </p>
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate mt-6 font-semibold">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
