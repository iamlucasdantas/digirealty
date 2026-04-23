import Link from "next/link";
import { prisma } from "@/lib/db";
import { BusinessCard } from "@/components/business-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ArrowRight, BookOpen, ShieldCheck, FileText, Users, Compass } from "lucide-react";

export const revalidate = 3600;

export default async function HomePage() {
  // Spec P0.5: counts are always scoped. Home represents the whole market,
  // so we count only PUBLISHED provider rows, then drop any (service, city)
  // intersections with zero inventory.
  const [featuredBiz, servicesRaw, citiesRaw, thisWeek] = await Promise.all([
    prisma.business.findMany({
      where: { status: "PUBLISHED", tier: { in: ["PREMIUM", "FEATURED"] } },
      include: { city: true },
      orderBy: [{ tier: "asc" }, { ratingAvg: "desc" }],
      take: 3,
    }),
    prisma.service.findMany({
      include: {
        category: true,
        _count: { select: { businesses: { where: { business: { status: "PUBLISHED" } } } } },
      },
      orderBy: { name: "asc" },
      take: 20,
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
  ]);

  const topServices = servicesRaw.filter((s) => s._count.businesses > 0).slice(0, 6);
  const activeCities = citiesRaw.filter((c) => c._count.businesses > 0);
  const totalGuides = await prisma.blogPost.count({ where: { published: true } });
  const totalComparisons = await prisma.comparison.count();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-blush-50 to-cream">
        <div className="container pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="eyebrow">Modern aesthetics · Quad Cities</p>
            <h1 className="h1-fluid mt-5 font-display font-semibold text-balance">
              <span className="italic-accent">Treatments</span> researched,
              <br />
              <span className="italic-accent">providers</span> vetted.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-muted leading-relaxed">
              Expert-written treatment guides, real local pricing, and free quotes from
              providers we&apos;ve actually checked. The antidote to the aesthetics internet.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-clay-500 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-clay-600"
              >
                <BookOpen className="h-4 w-4" /> Start with a guide
              </Link>
              <Link
                href="/get-quotes"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-transparent px-5 py-3 text-sm font-semibold text-ink hover:underline underline-offset-4 decoration-clay-400"
              >
                Get free quotes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Editorial visual — placeholder "atelier card" until real photography. */}
          <div className="relative">
            <div className="relative aspect-[4/5] max-w-md md:ml-auto rounded-4xl overflow-hidden bg-gradient-to-br from-blush-200 via-blush-100 to-clay-100 shadow-card">
              <div className="absolute inset-0 opacity-60 mix-blend-multiply bg-[radial-gradient(ellipse_at_30%_20%,rgba(204,139,104,0.35),transparent_60%),radial-gradient(ellipse_at_70%_80%,rgba(133,82,58,0.25),transparent_50%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-ink">
                <p className="eyebrow text-clay-700">Inside the Atlas</p>
                <p className="mt-2 font-display text-xl">
                  A <span className="italic-accent">slower</span> way to research your next treatment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Honest stats strip — no invented numbers. */}
        <div className="border-t border-clay-100/70 bg-cream/60">
          <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Stat
              icon={<FileText className="h-4 w-4" />}
              label="Guides published"
              value={totalGuides.toString()}
            />
            <Stat
              icon={<Compass className="h-4 w-4" />}
              label="Comparisons"
              value={totalComparisons.toString()}
            />
            <Stat
              icon={<Users className="h-4 w-4" />}
              label="Active cities"
              value={activeCities.length.toString()}
            />
            <Stat
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Editorial policy"
              value="Independent"
            />
          </div>
        </div>
      </section>

      {/* ── Treatments ─────────────────────────────────────────── */}
      {topServices.length > 0 && (
        <section className="container py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <p className="eyebrow">The menu</p>
            <h2 className="h2-fluid mt-3 font-display font-semibold text-balance">
              Treatments worth <span className="italic-accent">researching</span>.
            </h2>
            <p className="mt-4 text-ink-muted">
              A short list of what we cover deeply — with pricing context, candidacy
              notes, and a vetted shortlist of local providers.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topServices.map((s) => (
              <TreatmentCard key={s.id} service={s} />
            ))}
          </div>
        </section>
      )}

      {/* ── The Atlas (About block) ─────────────────────────────── */}
      <section className="bg-sand/50">
        <div className="container py-20 md:py-28 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="relative aspect-[4/5] max-w-md rounded-4xl overflow-hidden bg-gradient-to-br from-cocoa-100 via-sand to-blush-100 shadow-soft">
              <div className="absolute inset-0 opacity-70 mix-blend-multiply bg-[radial-gradient(circle_at_20%_30%,rgba(94,55,35,0.18),transparent_55%)]" />
              <div className="absolute bottom-5 right-5 rounded-2xl bg-cream px-4 py-3 shadow-soft text-center">
                <p className="eyebrow text-ink-muted">Since</p>
                <p className="font-display text-2xl">2026</p>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <p className="eyebrow">The Atlas</p>
            <h2 className="h2-fluid mt-3 font-display font-semibold text-balance">
              A quiet answer to a <span className="italic-accent">loud</span> category.
            </h2>
            <div className="mt-6 space-y-5 text-ink-muted leading-relaxed">
              <p>
                The beauty industry sells mystery. We sell clarity — honest guides to every
                treatment, real local pricing, and a curated shortlist of providers worth
                your time and money.
              </p>
              <p>
                When you request a quote, we only match you with providers we&apos;ve vetted.
                That&apos;s it. No upsells, no retargeting, no selling your email to a spa chain.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <Pillar title="Bespoke" body="Research calibrated to each treatment." />
              <Pillar title="Clinical" body="Reviewed by licensed clinicians." />
              <Pillar title="Quiet" body="No hype, no pressure, no spam." />
            </div>
            <div className="mt-8 flex gap-3">
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-ink/15 bg-cream px-5 py-2.5 text-sm font-semibold hover:bg-bone"
              >
                Meet the team
              </Link>
              <Link
                href="/editorial-policy"
                className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-ink hover:underline underline-offset-4 decoration-clay-400"
              >
                How we rank <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest guides ─────────────────────────────────────── */}
      {thisWeek.length > 0 && (
        <section className="container py-20 md:py-28">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <p className="eyebrow">On the Atlas</p>
              <h2 className="h2-fluid mt-3 font-display font-semibold text-balance">
                Latest <span className="italic-accent">guides</span>.
              </h2>
            </div>
            <Link
              href="/learn"
              className="text-sm font-semibold text-clay-600 hover:text-clay-700"
            >
              All guides →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {thisWeek.map((p) => (
              <article
                key={p.id}
                className="rounded-3xl border border-clay-100 bg-bone p-6 hover:border-clay-200 hover:shadow-soft transition"
              >
                {p.isPillar && (
                  <p className="eyebrow">Pillar guide</p>
                )}
                <Link href={`/learn/${p.slug}`}>
                  <h3 className="mt-2 font-display text-xl font-semibold hover:text-clay-600 text-balance">
                    {p.title}
                  </h3>
                </Link>
                {p.excerpt && (
                  <p className="mt-3 text-sm text-ink-muted line-clamp-3">{p.excerpt}</p>
                )}
                <p className="mt-5 text-xs text-ink-muted">
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

      {/* ── Featured partners — honestly labelled ──────────────── */}
      {featuredBiz.length > 0 && (
        <section className="container pb-20 md:pb-28">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Partners · Sponsored</p>
              <h2 className="h2-fluid mt-3 font-display font-semibold text-balance">
                Featured in the Atlas.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-muted">
                These providers subscribe for featured placement. Our editorial rankings
                on &ldquo;best X in Y&rdquo; lists stay independent —{" "}
                <Link href="/editorial-policy#how-we-rank" className="underline hover:text-ink">
                  how we rank
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredBiz.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>
      )}

      {/* ── Newsletter ─────────────────────────────────────────── */}
      <section className="container pb-20">
        <div className="max-w-2xl mx-auto">
          <NewsletterSignup
            variant="card"
            title="The Weekly Glow"
            subtitle="One email a week. Real prices, clinically-reviewed guides, zero pressure."
          />
        </div>
      </section>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-clay-600" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="font-display text-lg text-ink">{value}</p>
        <p className="eyebrow text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="mt-1 text-xs text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}

function TreatmentCard({
  service,
}: {
  service: {
    id: string;
    slug: string;
    name: string;
    shortDesc: string | null;
    avgPriceLow: number | null;
    priceUnit: string | null;
    category: { name: string };
    _count: { businesses: number };
  };
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block rounded-3xl border border-clay-100 bg-bone overflow-hidden hover:border-clay-200 hover:shadow-card transition"
    >
      <div className="relative aspect-[5/3] bg-gradient-to-br from-blush-100 via-sand to-clay-100 overflow-hidden">
        <div className="absolute inset-0 opacity-60 mix-blend-multiply bg-[radial-gradient(ellipse_at_60%_40%,rgba(204,139,104,0.3),transparent_55%)]" />
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold group-hover:text-clay-600">
            {service.name}
          </h3>
          {service.avgPriceLow != null && service.avgPriceLow > 0 && (
            <span className="text-xs text-ink-muted whitespace-nowrap">
              from ${Math.round(service.avgPriceLow / 100)}
              {service.priceUnit && (
                <span className="text-ink-faint"> · {service.priceUnit}</span>
              )}
            </span>
          )}
        </div>
        {service.shortDesc && (
          <p className="mt-2 text-sm text-ink-muted line-clamp-2">{service.shortDesc}</p>
        )}
        <p className="mt-4 eyebrow group-hover:text-clay-700">Read the guide →</p>
      </div>
    </Link>
  );
}
