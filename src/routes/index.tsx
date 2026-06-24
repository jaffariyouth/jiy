import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getHomepageData, type HomepageEvent, type HomepageArticle } from "@/lib/jiy/site-content.functions";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

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
      { property: "og:description", content: "Rooted in heritage. Built for the future." },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homepageQueryOptions),
  component: HomePage,
});

/* ------------------------------------------------------------------ */
/* Helpers + default copy (matches the uploaded HTML 1:1)              */
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

const DEFAULTS = {
  hero: {
    kicker: "Jaffari Islamic Youth",
    headline_line1: "Rooted in Heritage.",
    headline_line2_italic: "Built for the Future.",
    body: "Empowering Tomorrow's Leaders Through Faith, Friendship, and Purpose. Connecting young scholars, community members, and visionary thinkers through a modern platform built on timeless principles.",
    photo_url: "https://youth.jaffari.org/wp-content/uploads/2025/04/Group-edited-1024x1024.jpg",
    quote: '"Faith, Friendship, and Purpose."',
    quote_attribution: "— JIY EXECUTIVE TEAM",
    cta_primary_label: "Upcoming Events",
    cta_primary_href: "#upcoming-events",
    cta_secondary_label: "Meet Our Team",
    cta_secondary_href: "/team",
    socials: [
      { network: "instagram", url: "https://instagram.com/jaffariyouth" },
      { network: "linkedin", url: "https://www.linkedin.com/company/jaffari-islamic-youth" },
      { network: "youtube", url: "https://www.youtube.com/@jaffariyouth" },
      { network: "linktree", url: "https://linktr.ee/jaffariyouth" },
    ],
  },
  metrics: [
    { value: "1,200+", label: "WhatsApp Members" },
    { value: "3,000+", label: "Youths Served" },
    { value: "25+", label: "Events Yearly" },
    { value: "4,500+", label: "Instagram Followers" },
  ],
  about: {
    kicker: "❖ About Us ❖",
    headline: "Mission & Vision",
    mission_quote:
      '"The mission of the Jaffari Islamic Youth is to cultivate a vibrant community of Muslim youth committed to holistic growth and excellence."',
    body_paragraph_1:
      "Inspired by the guidance of Marḥūm Syed Asad Jafri on youth engagement, we believe in connecting with our youth through a balanced approach of social, recreational, spiritual, and academic initiatives.",
    body_paragraph_2:
      "Our aim is to create spaces where meaningful friendships are built, leadership is nurtured, and faith is strengthened. Rooted in Islamic values, we strive to equip our youth and by extension, our community with the confidence and tools to contribute positively to the broader society.",
    directives_label: "Term Directives",
    directives_body_1:
      "For the 2026–27 term, our guiding principles remain: <strong>Wilāyah (social unity), Amānah (trust), Leadership, and ʿIlm (knowledge)</strong>.",
    directives_body_2:
      "These values will guide our efforts through intentional social bonding and inclusivity, open communication and active listening between JIY members and the wider youth community, dynamic and relevant programming, and ongoing scholarly guidance.",
    photo_top_url: "https://youth.jaffari.org/wp-content/uploads/2025/03/IMG_5612.png",
    photo_bottom_url: "https://youth.jaffari.org/wp-content/uploads/2025/03/5ce1fee8-d163-407f-a135-4dbfe720e9c5.png",
    photo_tall_url: "https://youth.jaffari.org/wp-content/uploads/2025/03/IMG_3468-1.png",
  },
  ongoing: {
    kicker: "COMMUNITY BUILDING",
    headline: "Ongoing Events",
    narrative_paragraph_1:
      "We believe that having regular weekly programming is essential to building a youth community. Our current initiatives include Fajr Football and Monday Mubahatha which have an established audience who highly benefit from these programs.",
    narrative_paragraph_2:
      "Consistent events enable youth to build brotherhood/sisterhood amongst each other while building their knowledge and gaining strength. We hope to enhance and increase our regularly scheduled events to reach an even wider audience while keeping everyone connected.",
    cta_label: "Explore Schedule",
    cta_href: "https://youth.jaffari.org/events/",
    photo_url: "https://youth.jaffari.org/wp-content/uploads/2025/03/090ffa6f-cfea-48ae-b66d-0c3563c00803.png",
    initiatives: [
      { icon: "sports_soccer", title: "Fajr Football", description: "Brothers only football on Sunday mornings." },
      {
        icon: "menu_book",
        title: "Monday Mubahatha",
        description: "Weekly book club based on A Treatise of Servitude.",
      },
      {
        icon: "forum",
        title: "WhatsApp Community",
        description: "Regular updates on upcoming JIY events and initiatives.",
      },
    ],
  },
  values: {
    section_kicker: "OUR CORE VALUES",
    section_headline: "Strategic Foundations",
    items: [
      {
        number: "01",
        title: "Authentic Engagement",
        body: "Connecting with our youth through real conversations, shared experiences, and relevant initiatives.",
        detail:
          "When we realize all of us are creations of Allah (S.W.T), the desire to love, care, and support each other becomes stronger. With this intention, we want to connect with our youth, as well as give them opportunities to connect with each other through real conversations, shared experiences, and relevant initiatives. It's about quality over quantity — focusing on building genuine relationships and creating programs that reflect the real interests, needs, and concerns of our youth.",
      },
      {
        number: "02",
        title: "Sustainability",
        body: "Developing long-term non-profit frameworks that secure structural consistency across terms.",
        detail:
          "To build structural longevity across leadership terms. By maintaining transparent, organized, and robust non-profit processes, JIY ensures that each term's initiatives are consistently handed over to the next generation without loss of cultural and community capital.",
      },
      {
        number: "03",
        title: "Service & Social Impact",
        body: "Uplifting the youth to become active, positive contributors within our community and broader society.",
        detail:
          "Rooted in the prophetic tradition of service, we strive to empower youth to become active contributors — first within our own communities, and then in the broader society. Our goal is to cultivate a sense of responsibility and purpose, encouraging youth to use their time, energy, and skills to meet real needs and drive meaningful change. When we recognize that we are stronger together, and bring our unique strengths into collective action, we unlock the power to uplift one another and serve more effectively. This spirit of service also prepares us for the reappearance of our 12th Imam (A.T.F.S), by building systems of care, justice, and unity. It calls us to look beyond ourselves — to the needs of our fellow Muslims, both locally and globally.",
      },
      {
        number: "04",
        title: "Faith as Identity",
        body: "Fostering a sense of belonging and building systems of care, justice, and spiritual unity.",
        detail:
          "Building a genuine sense of belonging and unity is one of our biggest goals this year. We know that for many youth, connection to the mosque can sometimes feel limited — often revolving around sports or occasional programs. But we believe there's potential for so much more. We want every young person to feel that this community is truly theirs — a space where friendships grow, voices are heard, and purpose is shared. This year, we're working to create that kind of environment: one that goes beyond just showing up to events, and moves toward building lasting bonds and meaningful involvement. Together, we can shape a culture where every youth feels seen, valued, and proud to be part of the future of their mosque.",
      },
      {
        number: "05",
        title: "Community Connection",
        body: "Creating spaces where deep friendships grow, voices are heard, and purpose is shared.",
        detail:
          "We believe in establishing active platforms that allow youth members to collaborate, share academic resources, post job opportunities, and engage in open dialogue inside safe boundaries, expanding deep social kinship throughout the year.",
      },
      {
        number: "06",
        title: "Scholarly Guidance",
        body: "Providing direct connection and regular engagement with resident scholars for moral alignment.",
        detail:
          "Establishing effective and open communication with our scholars — including Resident Aalim Maulana Rizvi and Sr. Tahera Kassamali — remains a cornerstone of our mission to deepen the youth's connection with Allah (S.W.T). While we have made progress in building internal communication channels, our focus this term is to extend that bridge to the wider youth community. By creating accessible, consistent, and youth-centered avenues for engagement with our scholars, we aim to foster a stronger relationship between the youth and the teachings of the Ahlul-Bayt (A.S). This effort is not only to ensure alignment with authentic Islamic guidance, but to also enable our youth with the confidence, clarity, and spiritual grounding needed to walk firmly on the path of faith in today's world.",
      },
    ],
  },
  press: {
    section_kicker: "JOURNAL FEATURES",
    section_headline: "The Youth Press",
    section_subhead_italic: "& Publications",
    archive_label: "Explore Journal Archive →",
    archive_href: "#",
    volume_label: "VOLUME IX • ISSUE II",
    journal_title: "The Youth Press",
    journal_subtitle: "A Journal of Thought & Art",
    journal_footer: "Published by JIY Board",
  },
  footer: {
    brand_tagline: "Jaffari Islamic Youth",
    nav_links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "#about-us" },
      { label: "Our Team", href: "/team" },
    ],
    socials: [
      { network: "instagram", url: "https://instagram.com/jaffariyouth" },
      { network: "linkedin", url: "https://www.linkedin.com/company/jaffari-islamic-youth" },
      { network: "youtube", url: "https://www.youtube.com/@jaffariyouth" },
      { network: "linktree", url: "https://linktr.ee/jaffariyouth" },
    ],
    copyright: "© 2026 Jaffari Islamic Youth. All rights reserved.",
  },
};

const monthName = (d: Date) =>
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];

/* ------------------------------------------------------------------ */
/* SVG: ogee arch mask (used by .ogee-arch-portal clip-path)           */
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

/* Events dropdown lives in SiteHeader now */

/* ------------------------------------------------------------------ */
/* Social icon set (matches the brand colors in the HTML)              */
/* ------------------------------------------------------------------ */

const SOCIAL_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  linktree: "#43E660",
  facebook: "#1877F2",
  twitter: "#1DA1F2",
  x: "#000000",
};

function SocialSvg({ network }: { network: string }) {
  const cls = "w-7 h-7 fill-current";
  switch (network) {
    case "instagram":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={cls} viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      );
    case "linktree":
      return (
        <svg className={cls} viewBox="0 0 417 512.238" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 197.834h126.219L36.418 112.094l56.529-57.567 85.42 86.726V0h60.20v141.253l85.42-86.726 56.529 57.567-89.801 85.358H417v80.04H290.176l90.18 87.107L323.827 421.84 208.687 305.66 93.547 421.84l-56.529-56.94 90.182-87.106H0v-80.04zm178.367 124.46h60.198v189.944h-60.198V322.294z" />
        </svg>
      );
    default:
      return null;
  }
}

function PersianStar({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,2 L14.8,4.8 L19,4 L18.2,8.2 L21,11 L18.2,13.8 L19,18 L14.8,17.2 L12,20 L9.2,17.2 L5,18 L5.8,13.8 L3,11 L5.8,8.2 L5,4 L9.2,4.8 Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The page                                                            */
/* ------------------------------------------------------------------ */

function HomePage() {
  const { data } = useSuspenseQuery(homepageQueryOptions);
  const sections = (data.sections ?? {}) as Record<string, Section>;

  return (
    <div className="jiy-dashboard min-h-screen">
      <OgeeArchDefs />
      <SiteHeader />
      <Hero hero={sections.hero} />
      <Metrics metrics={sections.metrics} />
      <About about={sections.about} />
      <UpcomingEvents events={data.events} />
      <OngoingEvents ongoing={sections.ongoing} />
      <CoreValues values={sections.values} />
      <StarBreak />
      <Press press={sections.press} articles={data.articles} />
      <SiteFooter footer={sections.footer} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero({ hero }: { hero?: Section }) {
  const d = DEFAULTS.hero;
  const socials = arr<{ network: string; url: string }>(hero, "socials", d.socials);
  return (
    <section className="relative overflow-hidden pt-6 sm:pt-8 lg:pt-12 pb-12 lg:pb-20 border-b border-horizon-mist bg-white">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at center, var(--color-damascus-gold) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-deep-garnet/30 via-transparent to-transparent opacity-80" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-damascus-gold/20 via-transparent to-transparent opacity-60" />


      {/* Full-bleed background ornament, spanning left to right, very low opacity */}
      <img
        src="/__l5e/assets-v1/31e78581-68e7-47f5-a567-b8f54b63f0f7/ornament-back.svg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 opacity-[0.03]"
        style={{
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 55%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 55%)",
        }}
      />

      <div className="max-w-max-width mx-auto px-margin-safe relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          <div className="lg:col-span-7 flex flex-col gap-6 relative z-10">
            <span className="font-headline italic text-2xl md:text-3xl text-deep-garnet flex items-center gap-3 tracking-wide">
              {str(hero, "kicker", d.kicker)}
            </span>

            <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl text-persian-indigo leading-[1.05] tracking-tight">
              {str(hero, "headline_line1", d.headline_line1)} <br />
              <span className="font-light italic text-ash-slate">
                {str(hero, "headline_line2_italic", d.headline_line2_italic)}
              </span>
            </h1>
            <p className="font-body text-lg text-ash-slate leading-relaxed max-w-xl">{str(hero, "body", d.body)}</p>

            

            <div className="flex flex-col gap-3 mt-1">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-ash-slate font-bold">
                Connect With Us
              </span>
              <div className="flex items-center gap-5">
                {socials.map((s) => (
                  <a
                    key={s.network}
                    className="hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                    style={{ color: SOCIAL_COLORS[s.network] ?? "#14243b" }}
                    href={s.url}
                    target="_blank"
                    rel="noopener"
                    aria-label={s.network}
                  >
                    <SocialSvg network={s.network} />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <a
                href={str(hero, "cta_primary_href", d.cta_primary_href)}
                className="interactive-btn bg-persian-indigo text-white hover:bg-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-4 px-8 uppercase transition-all duration-300 text-center"
              >
                {str(hero, "cta_primary_label", d.cta_primary_label)}
              </a>
              <a
                href={str(hero, "cta_secondary_href", d.cta_secondary_href)}
                className="interactive-btn border border-horizon-mist text-ash-slate hover:border-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-4 px-8 uppercase transition-all duration-300 text-center"
              >
                {str(hero, "cta_secondary_label", d.cta_secondary_label)}
              </a>
            </div>
          </div>

          <div className="absolute right-0 -top-10 sm:-top-16 md:-top-20 lg:top-0 lg:relative lg:col-span-5 flex justify-end items-start lg:items-center h-[75%] sm:h-[85%] lg:h-auto w-full max-w-[95%] md:max-w-[70%] lg:max-w-none pointer-events-none select-none z-0 opacity-25 sm:opacity-45 md:opacity-55 lg:opacity-[0.85] overflow-hidden sm:overflow-visible">
            <img
              src="/__l5e/assets-v1/08a51463-76ec-4b12-9425-273130c7a4d7/ornament.svg"
              alt=""
              aria-hidden
              className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[115%] xl:w-[130%] 2xl:w-[145%] max-w-full lg:max-w-none h-auto animate-fade-in select-none pointer-events-none object-contain object-top lg:object-right lg:origin-right lg:scale-100 xl:scale-105 2xl:scale-110 transition-transform duration-300"
              style={{
                maskImage:
                  "radial-gradient(ellipse at center, #000 55%, transparent 85%), linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0.6) 55%, #000 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, #000 55%, transparent 85%), linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0.6) 55%, #000 80%)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
                animationDuration: "1.4s",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Metrics                                                             */
/* ------------------------------------------------------------------ */

function Metrics({ metrics }: { metrics?: Section }) {
  // metrics row could be stored as either an array directly or { items: [...] }
  const items = Array.isArray(metrics)
    ? (metrics as Array<{ value: string; label: string }>)
    : arr<{ value: string; label: string }>(metrics, "items", DEFAULTS.metrics);
  return (
    <section
      className="py-12 relative overflow-hidden border-y"
      style={{ backgroundColor: "var(--role-bg-deep)", borderColor: "var(--role-border-subtle)" }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at bottom, var(--role-gradient-warm), transparent 70%)",
        }}
      />
      <div className="max-w-max-width mx-auto px-margin-safe relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {items.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 ${i < items.length - 1 ? "border-r" : ""}`}
              style={i < items.length - 1 ? { borderColor: "var(--role-border-deep)" } : undefined}
            >
              <span
                className="font-headline text-4xl lg:text-5xl font-bold"
                style={{ color: "var(--role-accent)" }}
              >
                {m.value}
              </span>
              <span
                className="font-body text-[11px] uppercase tracking-[0.15em]"
                style={{ color: "var(--role-text-on-deep)", opacity: 0.8 }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

function About({ about }: { about?: Section }) {
  const d = DEFAULTS.about;
  return (
    <section id="about-us" className="py-24 border-b border-horizon-mist bg-white relative">
      <div className="max-w-max-width mx-auto px-margin-safe relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-deep-garnet font-black flex items-center gap-2">
              {str(about, "kicker", d.kicker)}
            </span>
            <h2 className="font-headline text-3xl md:text-4xl text-persian-indigo leading-tight">
              {str(about, "headline", d.headline)}
            </h2>

            <div className="flex flex-col gap-5 font-body text-sm text-ash-slate leading-relaxed">
              <div className="bg-persian-indigo text-white p-6 rounded-lg shadow-md border-l-4 border-damascus-gold relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none">
                  <PersianStar className="w-24 h-24" />
                </div>
                <p className="font-headline text-lg italic leading-snug relative z-10">
                  {str(about, "mission_quote", d.mission_quote)}
                </p>
              </div>

              <p className="pt-2 text-[15px]">{str(about, "body_paragraph_1", d.body_paragraph_1)}</p>
              <p className="text-[15px]">{str(about, "body_paragraph_2", d.body_paragraph_2)}</p>

              <div className="mt-3 border border-horizon-mist bg-warm-silk-grey/20 rounded-lg p-5">
                <span className="font-bold text-damascus-gold uppercase tracking-wider text-[10px] block mb-2">
                  {str(about, "directives_label", d.directives_label)}
                </span>
                <p
                  className="text-[15px]"
                  dangerouslySetInnerHTML={{ __html: str(about, "directives_body_1", d.directives_body_1) }}
                />
                <p className="mt-2 text-[14px]">{str(about, "directives_body_2", d.directives_body_2)}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-12 gap-4">
            <div className="col-span-5 flex flex-col gap-4 justify-between">
              <div className="aspect-square bg-warm-silk-grey rounded-lg overflow-hidden border border-horizon-mist relative">
                <img src={str(about, "photo_top_url", d.photo_top_url)} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="aspect-square bg-warm-silk-grey rounded-lg overflow-hidden border border-horizon-mist relative">
                <img
                  src={str(about, "photo_bottom_url", d.photo_bottom_url)}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            </div>
            <div className="col-span-7 aspect-[3/4] bg-warm-silk-grey rounded-lg overflow-hidden border border-horizon-mist relative">
              <img src={str(about, "photo_tall_url", d.photo_tall_url)} className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Upcoming Events                                                     */
/* ------------------------------------------------------------------ */

function UpcomingEvents({ events }: { events: HomepageEvent[] }) {
  return (
    <section id="upcoming-events" className="py-24 border-b border-horizon-mist bg-alabaster-parchment/60">
      <div className="max-w-max-width mx-auto px-margin-safe">
        <div className="flex flex-col sm:flex-row justify-between items-baseline border-b border-horizon-mist pb-3 mb-10">
          <div className="flex flex-col">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold font-bold">
              RESERVATIONS OPEN
            </span>
            <h2 className="font-headline text-3xl text-persian-indigo mt-1">Upcoming Events</h2>
          </div>
          <span className="font-body text-[11px] uppercase tracking-[0.15em] text-ash-slate font-bold mt-2">
            Active Registration Open
          </span>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length === 0 && (
            <p className="font-body text-sm text-ash-slate col-span-full">No upcoming events yet — check back soon.</p>
          )}
          {events.map((ev) => {
            const start = new Date(ev.starts_at);
            const day = String(start.getDate()).padStart(2, "0");
            const mon = monthName(start);
            const time = start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            return (
              <div key={ev.id} className="studio-card rounded-xl overflow-hidden flex flex-col bg-white">
                <div className="relative overflow-hidden aspect-[4/5] bg-warm-silk-grey border-b border-horizon-mist p-2">
                  <div className="w-full h-full overflow-hidden relative rounded-lg">
                    <img
                      src={
                        ev.cover_image_url ??
                        "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800"
                      }
                      className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                      alt={ev.title}
                    />
                  </div>
                  <div className="absolute top-4 left-4 bg-white/95 border border-horizon-mist px-3 py-1 text-center shadow-sm">
                    <p className="font-headline text-sm font-bold text-persian-indigo leading-none">{day}</p>
                    <p className="font-body text-[9px] uppercase tracking-wider text-ash-slate font-bold mt-0.5">
                      {mon}
                    </p>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="font-body text-[9px] uppercase tracking-[0.2em] text-deep-garnet font-black mb-2">
                    {ev.location ?? "Event"} • {time}
                  </span>
                  <h3 className="font-headline text-xl text-persian-indigo leading-snug mb-3 hover:text-damascus-gold transition-colors">
                    {ev.title}
                  </h3>
                  <p className="font-body text-xs text-ash-slate leading-relaxed flex-grow mb-5">
                    {ev.description ?? ""}
                  </p>
                  <a
                    href={`/events/${ev.id}`}
                    className="interactive-btn w-full bg-persian-indigo text-white hover:bg-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-4 uppercase transition-all duration-300 text-center block"
                  >
                    Register Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Ongoing Events                                                      */
/* ------------------------------------------------------------------ */

function OngoingEvents({ ongoing }: { ongoing?: Section }) {
  const d = DEFAULTS.ongoing;
  const initiatives = arr<{ icon: string; title: string; description: string }>(ongoing, "initiatives", d.initiatives);
  return (
    <section id="ongoing-events" className="py-24 border-b border-horizon-mist bg-white">
      <div className="max-w-max-width mx-auto px-margin-safe">
        <div className="flex flex-col sm:flex-row justify-between items-baseline border-b border-horizon-mist pb-3 mb-10">
          <div className="flex flex-col">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-deep-garnet font-bold">
              {str(ongoing, "kicker", d.kicker)}
            </span>
            <h2 className="font-headline text-3xl text-persian-indigo mt-1">{str(ongoing, "headline", d.headline)}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 flex flex-col gap-4 font-body text-sm text-ash-slate leading-relaxed">
            <p>{str(ongoing, "narrative_paragraph_1", d.narrative_paragraph_1)}</p>
            <p>{str(ongoing, "narrative_paragraph_2", d.narrative_paragraph_2)}</p>
            <div className="mt-4">
              <a
                href={str(ongoing, "cta_href", d.cta_href)}
                className="interactive-btn inline-block bg-deep-garnet text-white hover:bg-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-6 uppercase transition-all duration-300"
              >
                {str(ongoing, "cta_label", d.cta_label)}
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-square bg-warm-silk-grey rounded-xl overflow-hidden border border-horizon-mist shadow-lg group">
              <div className="w-full h-full ogee-arch-portal overflow-hidden relative bg-white">
                <img
                  src={str(ongoing, "photo_url", d.photo_url)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  alt=""
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            {initiatives.map((it, i) => (
              <div
                key={i}
                className={`flex gap-4 items-start ${i < initiatives.length - 1 ? "border-b border-horizon-mist/60 pb-4" : "pb-4"}`}
              >
                <div className="w-10 h-10 bg-persian-indigo text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 200" }}>
                    {it.icon}
                  </span>
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

/* ------------------------------------------------------------------ */
/* Core Values — Strategic Foundations                                 */
/* ------------------------------------------------------------------ */

function CoreValues({ values }: { values?: Section }) {
  const d = DEFAULTS.values;
  const items = arr<{
    number: string;
    title: string;
    body: string;
    detail?: string;
    cta_label?: string;
    cta_href?: string;
  }>(values, "items", d.items);
  const [active, setActive] = useState(0);
  const [openDetail, setOpenDetail] = useState<number | null>(null);
  const detailItem = openDetail !== null ? items[openDetail] : null;

  return (
    <section
      id="core-values"
      className="py-24 border-b border-horizon-mist bg-alabaster-parchment relative overflow-hidden"
    >
      <div className="max-w-max-width mx-auto px-margin-safe relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="font-body text-xs uppercase tracking-[0.3em] text-deep-garnet font-black mb-3 block">
              {str(values, "section_kicker", d.section_kicker)}
            </span>
            <h2 className="font-headline text-3xl md:text-5xl text-persian-indigo leading-tight">
              {str(values, "section_headline", d.section_headline)}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 flex flex-col gap-2 relative z-20">
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`value-tab text-left py-4 pl-6 border-l-2 font-headline text-xl md:text-2xl transition-all relative overflow-hidden group ${
                  active === i ? "is-active text-persian-indigo" : "text-ash-slate hover:text-persian-indigo"
                }`}
              >
                <span className="progress-bg absolute left-0 top-0 bottom-0 w-full bg-damascus-gold/15 -z-10 origin-left scale-x-0" />
                {it.number}. {it.title}
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 relative min-h-[380px] w-full">
            {items.map((it, i) => (
              <div
                key={i}
                className={`value-slide absolute inset-0 studio-card p-10 md:p-14 rounded-2xl flex flex-col justify-center ${
                  active === i ? "opacity-100 translate-y-0 z-10" : "opacity-0 pointer-events-none translate-y-8 z-0"
                }`}
              >
                <span className="font-body text-sm text-damascus-gold font-bold tracking-[0.2em] block mb-4">
                  {it.number} — STRATEGIC FOUNDATION
                </span>
                <h3 className="font-headline text-3xl md:text-4xl text-persian-indigo mb-4">{it.title}</h3>
                <p className="font-body text-base text-ash-slate leading-relaxed mb-8">{it.body}</p>
                <button
                  type="button"
                  onClick={() => setOpenDetail(i)}
                  className="interactive-btn self-start bg-persian-indigo text-white hover:bg-damascus-gold hover:text-persian-indigo font-body text-[10px] font-bold tracking-[0.2em] py-3.5 px-6 uppercase transition-all duration-300"
                >
                  {it.cta_label || "Read More"} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {detailItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-persian-indigo/70 px-4"
          onClick={() => setOpenDetail(null)}
        >
          <div
            className="bg-alabaster-parchment max-w-xl w-full p-8 md:p-10 rounded-2xl border border-horizon-mist relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenDetail(null)}
              className="absolute top-3 right-4 text-ash-slate hover:text-persian-indigo text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-damascus-gold font-bold mb-2">
              OUR GOAL
            </p>
            <h3 className="font-headline text-2xl text-persian-indigo mb-4">{detailItem.title}</h3>
            <p className="font-body text-sm text-ash-slate leading-relaxed text-left whitespace-pre-line">
              {detailItem.detail || detailItem.body}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Star break ornament                                                 */
/* ------------------------------------------------------------------ */

function StarBreak() {
  return (
    <div className="relative flex items-center justify-center my-12">
      <div className="absolute w-full h-[1px] bg-horizon-mist" />
      <span className="font-headline text-lg text-damascus-gold bg-alabaster-parchment px-6 relative z-10">✥</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The Press                                                           */
/* ------------------------------------------------------------------ */

function Press({ press, articles }: { press?: Section; articles: HomepageArticle[] }) {
  const d = DEFAULTS.press;
  return (
    <section id="journal" className="py-24 bg-white border-b border-horizon-mist relative">
      <div className="max-w-max-width mx-auto px-margin-safe">
        <div className="flex flex-col sm:flex-row justify-between items-baseline border-b border-horizon-mist pb-4 mb-16">
          <div className="flex flex-col">
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-deep-garnet font-bold">
              {str(press, "section_kicker", d.section_kicker)}
            </span>
            <h2 className="font-headline text-4xl text-persian-indigo mt-1 tracking-tight font-black">
              {str(press, "section_headline", d.section_headline)}{" "}
              <span className="font-light italic text-2xl text-ash-slate ml-2">
                {str(press, "section_subhead_italic", d.section_subhead_italic)}
              </span>
            </h2>
          </div>
          <a
            href={str(press, "archive_href", d.archive_href)}
            className="font-body text-[11px] uppercase tracking-[0.2em] text-ash-slate hover:text-damascus-gold font-bold transition-colors mt-2 sm:mt-0"
          >
            {str(press, "archive_label", d.archive_label)}
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center p-8 bg-alabaster-parchment border-r border-horizon-mist/60 relative">
            <div className="border border-horizon-mist/60 p-4 h-full flex flex-col justify-between w-full">
              <div className="text-center pt-4">
                <span className="font-body text-[9px] uppercase tracking-[0.3em] text-ash-slate font-bold block mb-1">
                  {str(press, "volume_label", d.volume_label)}
                </span>
                <div className="h-px w-12 bg-damascus-gold/40 mx-auto my-3" />
                <h4 className="font-headline text-3xl font-extrabold text-persian-indigo tracking-tight">
                  {str(press, "journal_title", d.journal_title)}
                </h4>
                <span className="font-headline italic text-sm text-ash-slate block mt-1">
                  {str(press, "journal_subtitle", d.journal_subtitle)}
                </span>
              </div>
              <div className="flex justify-center my-8">
                <PersianStar className="w-12 h-12 text-damascus-gold opacity-80" />
              </div>
              <div className="text-center pb-4">
                <p className="font-body text-[10px] text-ash-slate uppercase tracking-widest font-semibold border-t border-horizon-mist/40 pt-4">
                  {str(press, "journal_footer", d.journal_footer)}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            {articles.length === 0 && (
              <p className="font-body text-sm text-ash-slate col-span-full">No featured articles yet.</p>
            )}
            {articles.map((a, i) => {
              const date = a.published_at
                ? new Date(a.published_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                : "";
              return (
                <a key={a.id} href={`/press/${a.slug}`} className="group cursor-pointer flex flex-col gap-4">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-damascus-gold font-bold">
                    {i === 0 ? "MONTHLY FEATURES" : "YOUTH CREATIVE WRITING"}
                  </span>
                  <h3 className="font-headline text-2xl md:text-3xl text-persian-indigo group-hover:text-damascus-gold transition-colors duration-300 leading-snug">
                    {a.title}
                  </h3>
                  <p className="font-body text-xs text-ash-slate leading-relaxed">{a.excerpt ?? ""}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-horizon-mist/60 mt-2">
                    <span className="font-body text-[10px] uppercase tracking-[0.15em] text-persian-indigo font-black group-hover:underline decoration-damascus-gold decoration-2 underline-offset-4">
                      Read Manuscript
                    </span>
                    <span className="font-body text-[10px] text-ash-slate font-bold uppercase tracking-wider">
                      {date}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

