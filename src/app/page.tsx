import Link from "next/link";
import { prisma } from "@/lib/db";
import { BusinessCard } from "@/components/business-card";
import { AdSlot } from "@/components/ad-slot";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { siteConfig } from "@/lib/config";
import { ArrowRight, CheckCircle2, ShieldCheck, Timer, BookOpen, Download } from "lucide-react";

export const revalidate = 3600;

export default async function HomePage() {
  // Spec P0.5: every count we show must be scoped correctly. On the home
  // we're representing the whole active market, so we only count published
  // provider rows in cities that actually have providers.
  const [featuredBiz, servicesRaw, citiesRaw, thisWeek, leadMagnet] = await Promise.all([
    prisma.business.findMany({
      where: { status: "PUBLISHED", tier: { in: ["PREMIUM", "FEATURED"] } },
      include: { city: true },
      orderBy: [{ tier: "asc" }, { ratingAvg: "desc" }],
      take: 6,
    }),
    prisma.service.findMany({
      include: {
        category: true,
        _count: { select: { businesses: { where: { business: { status: "PUBLISHED" } } } } },
      },
      orderBy: { name: "asc" },
      take: 12,
    }),
    prisma.city.findMany({
      include: {
        _count: { select: { businesses: { where: { status: "PUBLISHED" } } } },
      },
      orderBy: { name: "asc" },
      take: 12,
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      include: { author: true, medicalReviewer: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.leadMagnet.findFirst({ where: { published: true } }),
  ]);

  // Only surface services + cities that have at least one active provider.
  // We never show "3 pros" when the scoped count would be 0.
  const topServices = servicesRaw.filter((s) => s._count.businesses > 0).slice(0, 8);
  const cities = citiesRaw.filter((c) => c._count.businesses > 0).slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/5 bg-gradient-to-br from-brand-50 via-white to-white">
        <div className="container py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Expert-written · Clinically reviewed
            </span>
            <h1 className="h1-fluid mt-5 font-display font-semibold">
              The honest guide to <span className="text-brand-600">aesthetics</span> in the Quad Cities.
            </h1>
            <p className="mt-5 text-lg text-ink-muted max-w-xl">
              Expert-reviewed treatment guides, real local pricing, and free quotes from vetted
              providers. No hype, no pressure — just the information your smartest friend would give you.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow hover:bg-ink/85"
              >
                <BookOpen className="h-4 w-4" /> Start with a guide
              </Link>
              <Link
                href="/get-quotes"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-ink/5"
              >
                Get free quotes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-3 gap-3 text-sm">
              <Trust icon={<CheckCircle2 className="h-4 w-4" />} label="Vetted providers" />
              <Trust icon={<Timer className="h-4 w-4" />} label="Quotes in ~15 min" />
              <Trust icon={<ShieldCheck className="h-4 w-4" />} label="Private by default" />
            </ul>
          </div>
          <div className="relative rounded-3xl border border-ink/10 bg-white p-6 shadow-lg">
            <p className="text-sm font-semibold text-ink-muted">Popular right now</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {topServices.slice(0, 8).map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/${s.slug}-near-me`}
                    className="flex items-center justify-between rounded-xl border border-ink/10 px-3 py-2 hover:bg-ink/5"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-ink-muted">{s._count.businesses} pros</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <AdSlot placement="HOMEPAGE_HERO" />
            </div>
          </div>
        </div>
      </section>

      {/* This week on the blog */}
      {thisWeek.length > 0 && (
        <section className="container py-16">
          <SectionHeader
            eyebrow="This week on the Atlas"
            title="Latest guides"
            cta={{ href: "/learn", label: "All guides" }}
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {thisWeek.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-ink/10 bg-white p-6 hover:border-brand-200"
              >
                {p.isPillar && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Pillar guide
                  </p>
                )}
                <Link href={`/learn/${p.slug}`}>
                  <h3 className="mt-1 font-display text-xl font-semibold hover:text-brand-700">
                    {p.title}
                  </h3>
                </Link>
                {p.excerpt && (
                  <p className="mt-2 text-sm text-ink/85 line-clamp-3">{p.excerpt}</p>
                )}
                <p className="mt-4 text-xs text-ink-muted">
                  {p.author && !p.author.isPlaceholder
                    ? `By ${p.author.name}`
                    : "By The Atlas editorial team"}
                  {p.medicalReviewer && !p.medicalReviewer.isPlaceholder
                    ? ` · Reviewed by ${p.medicalReviewer.name}, ${p.medicalReviewer.credentialSuffix}`
                    : " · Clinical review pending"}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Lead magnet + newsletter */}
      <section className="container py-4">
        <div className="grid gap-5 md:grid-cols-2">
          {leadMagnet && (
            <Link
              href={`/free-guide/${leadMagnet.slug}`}
              className="group rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 hover:border-brand-400"
            >
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
                <Download className="h-3.5 w-3.5" /> Free download
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold group-hover:text-brand-700">
                {leadMagnet.title}
              </h3>
              {leadMagnet.subtitle && (
                <p className="mt-2 text-sm text-ink/80">{leadMagnet.subtitle}</p>
              )}
              <p className="mt-4 text-sm font-semibold text-brand-700">
                Get the guide →
              </p>
            </Link>
          )}
          <NewsletterSignup variant="card" />
        </div>
      </section>

      {/* Featured providers */}
      {featuredBiz.length > 0 && (
        <section className="container py-16">
          <SectionHeader
            eyebrow="Featured partners"
            title={`Top-rated providers in ${siteConfig.defaultMarket.replace("-", " ")}`}
            cta={{ href: "/cities", label: "All locations" }}
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredBiz.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>
      )}

      {/* Cities */}
      {cities.length > 0 && (
        <section className="container py-8">
          <SectionHeader eyebrow="By city" title="Find treatments where you live" />
          <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-4">
            {cities.map((c) => (
              <Link
                key={c.id}
                href={`/${c.slug}`}
                className="group rounded-2xl border border-ink/10 p-4 hover:border-brand-300 hover:bg-brand-50/40"
              >
                <p className="font-display text-lg font-semibold group-hover:text-brand-700">
                  {c.name}, {c.state}
                </p>
                <p className="text-sm text-ink-muted">{c._count.businesses} providers</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Learn */}
      <section className="container py-16">
        <SectionHeader
          eyebrow="Learn"
          title="Confused by your options?"
          cta={{ href: "/compare", label: "See all comparisons" }}
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <LearnCard title="Botox vs Fillers" href="/compare/botox-vs-fillers" />
          <LearnCard title="Laser hair removal vs IPL" href="/compare/laser-hair-removal-vs-ipl" />
          <LearnCard title="CoolSculpting vs EmSculpt" href="/compare/coolsculpting-vs-emsculpt" />
        </div>
      </section>

      {/* Providers CTA */}
      <section className="container py-16">
        <div className="rounded-3xl bg-ink p-10 md:p-14 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-brand-200 font-semibold">For providers</p>
            <h2 className="mt-2 h2-fluid font-display font-semibold">
              Fill your calendar with in-market patients.
            </h2>
            <p className="mt-3 text-white/80 max-w-2xl">
              Buy exclusive, pre-qualified leads from ready-to-book consumers in your city. Pay per
              lead, not per click — with transparent tracking and no long-term contract.
            </p>
          </div>
          <Link
            href="/for-providers"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-400"
          >
            See pricing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2 text-ink-muted">
      <span className="text-brand-600">{icon}</span> {label}
    </li>
  );
}

function SectionHeader({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string;
  title: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p>
        <h2 className="mt-1 h2-fluid font-display font-semibold">{title}</h2>
      </div>
      {cta && (
        <Link href={cta.href} className="text-sm font-semibold text-brand-700 hover:underline">
          {cta.label} →
        </Link>
      )}
    </div>
  );
}

function LearnCard({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-ink/10 p-6 hover:border-brand-300 hover:bg-brand-50/40"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Comparison</p>
      <p className="mt-2 font-display text-xl font-semibold">{title}</p>
      <p className="mt-3 text-sm text-brand-700">Read the breakdown →</p>
    </Link>
  );
}
