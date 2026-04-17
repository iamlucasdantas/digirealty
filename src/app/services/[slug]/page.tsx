import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { BusinessCard } from "@/components/business-card";
import { LeadForm } from "@/components/lead-form";
import { buildMetadata, breadcrumbsJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { formatPriceRange } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await prisma.service.findUnique({ where: { slug: params.slug } });
  if (!s) return buildMetadata({ title: "Not found", description: "", noIndex: true });
  return buildMetadata({
    title: `${s.name} — costs, providers, what to expect`,
    description: s.shortDesc ?? `Compare ${s.name} providers, pricing, and what to expect. Free quotes from vetted local experts.`,
    path: `/services/${s.slug}`,
  });
}

export default async function ServiceHub({ params }: { params: { slug: string } }) {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });
  if (!service) notFound();

  const [top, cities] = await Promise.all([
    prisma.business.findMany({
      where: { status: "PUBLISHED", services: { some: { serviceId: service.id } } },
      include: { city: true },
      orderBy: [{ tier: "asc" }, { ratingAvg: "desc" }],
      take: 6,
    }),
    prisma.city.findMany({ take: 12 }),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbsJsonLd([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: service.name, url: `/services/${service.slug}` },
        ])}
      />
      <section className="border-b border-ink/5 bg-gradient-to-br from-brand-50/40 to-white">
        <div className="container py-14 grid md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {service.category.name}
            </p>
            <h1 className="mt-2 font-display text-5xl font-semibold">{service.name}</h1>
            {service.shortDesc && <p className="mt-4 text-lg text-ink-muted max-w-2xl">{service.shortDesc}</p>}
            <div className="mt-5 text-sm">
              <b>Typical cost:</b>{" "}
              {formatPriceRange(service.avgPriceLow, service.avgPriceHigh)}{" "}
              {service.priceUnit && <span className="text-ink-muted">({service.priceUnit})</span>}
            </div>
          </div>
          <div className="md:col-span-2">
            <LeadForm serviceSlug={service.slug} serviceName={service.name} />
          </div>
        </div>
      </section>

      {top.length > 0 && (
        <section className="container py-12">
          <h2 className="font-display text-3xl font-semibold">Top {service.name} providers</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {top.map((b) => (
              <BusinessCard key={b.id} business={b} ctaServiceSlug={service.slug} />
            ))}
          </div>
        </section>
      )}

      <section className="container py-12">
        <h2 className="font-display text-3xl font-semibold">Find {service.name} by city</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {cities.map((c) => (
            <Link
              key={c.id}
              href={`/${service.slug}-in-${c.slug}`}
              className="rounded-2xl border border-ink/10 p-4 hover:border-brand-300 hover:bg-brand-50/40"
            >
              <p className="font-display text-lg font-semibold">
                {c.name}, {c.state}
              </p>
              <p className="text-xs text-ink-muted">View providers</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
