import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata, breadcrumbsJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { formatPriceRange } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const c = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!c) return buildMetadata({ title: "Not found", description: "", noIndex: true });
  return buildMetadata({
    title: `${c.name} — treatments, costs & what to expect`,
    description: `Guide to ${c.name.toLowerCase()} treatments we cover — what each one does, typical costs, and how to choose a provider.`,
    path: `/services/category/${c.slug}`,
  });
}

export default async function CategoryHub({
  params,
}: {
  params: { slug: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      services: {
        include: {
          _count: { select: { businesses: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  });
  if (!category) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbsJsonLd([
          { name: "Home", url: "/" },
          { name: "Treatments", url: "/services" },
          { name: category.name, url: `/services/category/${category.slug}` },
        ])}
      />

      <section className="border-b border-ink/5 bg-gradient-to-br from-brand-50/40 to-white">
        <div className="container py-14 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {category.name}
          </p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">
            {category.name} treatments
          </h1>
          <p className="mt-4 text-lg text-ink-muted">
            The treatments that fall under &ldquo;{category.name}&rdquo; — with typical cost
            ranges and how to choose between them. We add editorial context and
            clinical review as each guide is written.
          </p>
        </div>
      </section>

      <section className="container py-12 max-w-3xl">
        {category.services.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink/15 p-10 text-center text-ink-muted">
            No treatments in this category yet.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {category.services.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/services/${s.slug}`}
                  className="block rounded-2xl border border-ink/10 bg-white p-5 hover:border-brand-300"
                >
                  <p className="font-display text-xl font-semibold">{s.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Typical cost: {formatPriceRange(s.avgPriceLow, s.avgPriceHigh)}
                  </p>
                  {s.shortDesc && (
                    <p className="mt-2 text-sm line-clamp-2">{s.shortDesc}</p>
                  )}
                  <p className="mt-3 text-xs text-ink-muted">
                    {s._count.businesses} provider
                    {s._count.businesses === 1 ? "" : "s"} across active cities
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
