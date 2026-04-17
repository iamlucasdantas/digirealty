import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { BusinessCard } from "@/components/business-card";
import { LeadForm } from "@/components/lead-form";
import { AdSlot } from "@/components/ad-slot";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, breadcrumbsJsonLd, faqJsonLd } from "@/lib/seo";
import { formatPriceRange } from "@/lib/utils";
import { listBusinessesByCityAndService } from "@/lib/repos/businesses";
import { incrementPageView } from "@/lib/repos/seo-pages";

/**
 * Programmatic SEO: /[service]-in-[city] and /best-[service]-in-[city].
 *
 * Pattern examples that resolve here:
 *   /botox-in-davenport-ia
 *   /best-dermal-fillers-in-bettendorf-ia
 *   /coolsculpting-in-rock-island-il
 *
 * Also supports /[service]-near-me → national-level service landing.
 */

export const revalidate = 86400;
export const dynamicParams = true;

interface Parsed {
  kind: "service-city" | "best-service-city" | "service-near-me" | "city";
  serviceSlug?: string;
  citySlug?: string;
}

const CITY_SUFFIX =
  /-(ia|il|ny|ca|tx|fl|wa|or|az|ga|nc|sc|oh|pa|mi|mn|wi|ma|co|nv|ut|tn|ky|mo|ks|ne|nm|ok|la|ar|wv|va|nh|vt|me|ri|ct|nj|md|de|ak|hi|id|mt|nd|sd|wy|in|al|ms)$/;

function parse(slug: string): Parsed | null {
  const s = slug.toLowerCase();
  if (s.endsWith("-near-me")) {
    return { kind: "service-near-me", serviceSlug: s.replace(/-near-me$/, "") };
  }
  const bestMatch = s.match(/^best-(.+?)-in-(.+)$/);
  if (bestMatch) return { kind: "best-service-city", serviceSlug: bestMatch[1], citySlug: bestMatch[2] };
  const match = s.match(/^(.+?)-in-(.+)$/);
  if (match) return { kind: "service-city", serviceSlug: match[1], citySlug: match[2] };
  if (CITY_SUFFIX.test(s)) return { kind: "city", citySlug: s };
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { serviceCity: string };
}): Promise<Metadata> {
  const parsed = parse(params.serviceCity);
  if (!parsed) return buildMetadata({ title: "Not found", description: "", noIndex: true });

  if (parsed.kind === "city") {
    const city = await prisma.city.findUnique({ where: { slug: parsed.citySlug! } });
    if (!city) return buildMetadata({ title: "Not found", description: "", noIndex: true });
    return buildMetadata({
      title: `Med spas, cosmetic clinics & wellness in ${city.name}, ${city.state}`,
      description: `Compare top-rated aesthetics, wellness, and cosmetic providers in ${city.name}, ${city.state}. Free quotes, verified reviews.`,
      path: `/${params.serviceCity}`,
    });
  }

  const service = await prisma.service.findUnique({ where: { slug: parsed.serviceSlug! } });
  if (!service) return buildMetadata({ title: "Not found", description: "", noIndex: true });

  if (!parsed.citySlug) {
    return buildMetadata({
      title: `${service.name} near me — compare top providers`,
      description: `Compare top ${service.name} providers near you. Free quotes, verified reviews, and transparent pricing.`,
      path: `/${params.serviceCity}`,
    });
  }
  const city = await prisma.city.findUnique({ where: { slug: parsed.citySlug } });
  if (!city) return buildMetadata({ title: "Not found", description: "", noIndex: true });

  const h1Prefix = parsed.kind === "best-service-city" ? `Best ${service.name}` : service.name;
  return buildMetadata({
    title: `${h1Prefix} in ${city.name}, ${city.state}`,
    description: `Find the best ${service.name} providers in ${city.name}, ${city.state}. Verified reviews, transparent pricing, and free quotes from licensed local experts.`,
    path: `/${params.serviceCity}`,
  });
}

export default async function ServiceCityPage({
  params,
}: {
  params: { serviceCity: string };
}) {
  const parsed = parse(params.serviceCity);
  if (!parsed) notFound();

  if (parsed.kind === "city") {
    return <CityHub citySlug={parsed.citySlug!} slug={params.serviceCity} />;
  }

  const service = await prisma.service.findUnique({
    where: { slug: parsed.serviceSlug! },
    include: { category: true },
  });
  if (!service) notFound();

  const city = parsed.citySlug
    ? await prisma.city.findUnique({
        where: { slug: parsed.citySlug },
        include: { market: true },
      })
    : null;
  if (parsed.citySlug && !city) notFound();

  const businesses = await listBusinessesByCityAndService({
    citySlug: parsed.citySlug ?? "_",
    serviceSlug: parsed.serviceSlug,
    limit: 20,
  });

  // Try the pre-generated SEO content if present.
  const seoPage = await prisma.seoPage.findFirst({
    where: {
      type: parsed.kind === "best-service-city" ? "BEST_SERVICE_CITY" : "SERVICE_CITY",
      serviceId: service.id,
      ...(city ? { cityId: city.id } : {}),
      published: true,
    },
  });
  if (seoPage) incrementPageView(seoPage.id);

  const title = city
    ? `${parsed.kind === "best-service-city" ? "Best " : ""}${service.name} in ${city.name}, ${city.state}`
    : `${service.name} near me`;

  const faq = pickFaq(seoPage?.faq, service.faq);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: service.category.name, url: `/services/${service.category.slug}` },
    { name: service.name, url: `/services/${service.slug}` },
    ...(city ? [{ name: `${city.name}, ${city.state}`, url: `/${city.slug}` }] : []),
    { name: title, url: `/${params.serviceCity}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbsJsonLd(breadcrumbs),
          faqJsonLd(faq),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: businesses.slice(0, 10).map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `/business/${b.slug}`,
              name: b.name,
            })),
          },
        ]}
      />
      {/* Hero */}
      <section className="border-b border-ink/5 bg-gradient-to-br from-brand-50 via-white to-white">
        <div className="container py-14 md:py-20 grid md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold">{title}</h1>
            <p className="mt-4 text-lg text-ink-muted">
              {seoPage?.intro ??
                (city
                  ? `Compare top-rated ${service.name} providers in ${city.name} with verified reviews and transparent pricing. Get free quotes in minutes.`
                  : `Compare top ${service.name} providers near you. Verified reviews and transparent pricing.`)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-ink-muted">
              {service.avgPriceLow && (
                <Chip>Typical cost: {formatPriceRange(service.avgPriceLow, service.avgPriceHigh)} {service.priceUnit ? `(${service.priceUnit})` : ""}</Chip>
              )}
              <Chip>{businesses.length}+ providers listed</Chip>
              {city?.market && <Chip>Serving {city.market.name}</Chip>}
            </div>
          </div>
          <div className="md:col-span-2">
            <LeadForm
              serviceSlug={service.slug}
              serviceName={service.name}
              citySlug={city?.slug}
            />
          </div>
        </div>
      </section>

      {/* Businesses */}
      <section className="container py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold">
            Top {service.name} providers{city ? ` in ${city.name}` : " near you"}
          </h2>
          <Link href="/get-quotes" className="text-sm font-semibold text-brand-700 hover:underline">
            Get all 3 quotes at once →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b, i) => (
            <BusinessCard key={b.id} business={b} rank={i + 1} ctaServiceSlug={service.slug} />
          ))}
          {businesses.length === 0 && (
            <div className="md:col-span-3 rounded-2xl border border-dashed border-ink/15 p-10 text-center">
              <p className="font-display text-xl">No providers listed yet.</p>
              <p className="mt-2 text-ink-muted">We're expanding to new cities every week. Request quotes and we'll still match you.</p>
            </div>
          )}
        </div>

        <div className="mt-10">
          <AdSlot placement="SERVICE_TOP" serviceId={service.id} cityId={city?.id} />
        </div>
      </section>

      {/* Body content */}
      {(seoPage?.body || service.longDesc) && (
        <section className="container py-8 grid md:grid-cols-3 gap-10">
          <article className="md:col-span-2 prose-al max-w-none">
            <div dangerouslySetInnerHTML={{ __html: seoPage?.body ?? service.longDesc ?? "" }} />
          </article>
          <aside className="space-y-5">
            <AdSlot placement="CITY_SIDEBAR" cityId={city?.id} />
            <RelatedLinks serviceSlug={service.slug} citySlug={city?.slug} />
          </aside>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="container py-14 max-w-3xl">
          <h2 className="font-display text-3xl font-semibold">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
            {faq.map((f, i) => (
              <details key={i} className="group p-5">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-ink/80">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/70 border border-ink/10 px-3 py-1 font-medium">
      {children}
    </span>
  );
}

function Breadcrumbs({ items }: { items: Array<{ name: string; url: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-ink-muted">
      {items.map((b, i) => (
        <span key={b.url}>
          <Link href={b.url} className="hover:text-ink">
            {b.name}
          </Link>
          {i < items.length - 1 && <span className="mx-1.5">/</span>}
        </span>
      ))}
    </nav>
  );
}

async function RelatedLinks({ serviceSlug, citySlug }: { serviceSlug: string; citySlug?: string }) {
  const [relatedServices, nearbyCities] = await Promise.all([
    prisma.service.findMany({ where: { NOT: { slug: serviceSlug } }, take: 6 }),
    citySlug
      ? prisma.city.findMany({ where: { NOT: { slug: citySlug } }, take: 6 })
      : Promise.resolve([]),
  ]);
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Related</p>
      <ul className="mt-3 space-y-2 text-sm">
        {relatedServices.map((s) => (
          <li key={s.id}>
            <Link href={citySlug ? `/${s.slug}-in-${citySlug}` : `/services/${s.slug}`} className="hover:underline">
              {s.name}{citySlug ? ` in ${prettyCity(citySlug)}` : ""}
            </Link>
          </li>
        ))}
        {nearbyCities.map((c) => (
          <li key={c.id}>
            <Link href={`/${serviceSlug}-in-${c.slug}`} className="hover:underline">
              {prettyService(serviceSlug)} in {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function prettyCity(slug: string): string {
  return slug
    .split("-")
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(" ");
}
function prettyService(slug: string): string {
  return slug
    .split("-")
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(" ");
}

async function CityHub({ citySlug, slug }: { citySlug: string; slug: string }) {
  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
    include: { market: true },
  });
  if (!city) notFound();

  const [businesses, services] = await Promise.all([
    prisma.business.findMany({
      where: { status: "PUBLISHED", cityId: city.id },
      include: { city: true },
      orderBy: [{ tier: "asc" }, { ratingAvg: "desc" }],
      take: 24,
    }),
    prisma.service.findMany({
      include: { _count: { select: { businesses: true } } },
      take: 20,
    }),
  ]);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: city.market.name, url: "/cities" },
    { name: `${city.name}, ${city.state}`, url: `/${slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(breadcrumbs)} />
      <section className="border-b border-ink/5 bg-gradient-to-br from-brand-50/40 to-white">
        <div className="container py-16">
          <h1 className="font-display text-5xl font-semibold">
            Aesthetics & wellness in {city.name}, {city.state}
          </h1>
          <p className="mt-4 text-lg text-ink-muted max-w-3xl">
            Browse top-rated providers in {city.name}. Compare services, read real reviews, and
            request free quotes from vetted local experts.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="font-display text-3xl font-semibold">Popular services in {city.name}</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}-in-${city.slug}`}
              className="rounded-2xl border border-ink/10 p-4 hover:border-brand-300 hover:bg-brand-50/40"
            >
              <p className="font-display text-lg font-semibold">{s.name}</p>
              <p className="text-xs text-ink-muted">{s._count.businesses} providers</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container py-12">
        <h2 className="font-display text-3xl font-semibold">Top providers in {city.name}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b, i) => (
            <BusinessCard key={b.id} business={b} rank={i + 1} />
          ))}
        </div>
      </section>
    </>
  );
}

function pickFaq(pageFaq: unknown, serviceFaq: unknown): Array<{ q: string; a: string }> {
  const isList = (x: unknown): x is Array<{ q: string; a: string }> =>
    Array.isArray(x) && x.every((i) => i && typeof i === "object" && "q" in i && "a" in i);
  if (isList(pageFaq)) return pageFaq;
  if (isList(serviceFaq)) return serviceFaq;
  return [];
}
