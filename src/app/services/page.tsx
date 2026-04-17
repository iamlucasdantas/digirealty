import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "All treatments — browse aesthetics, wellness & cosmetic services",
  description:
    "Explore every treatment we cover: Botox, fillers, laser, CoolSculpting, microneedling, PRP, IV therapy, weight loss, cosmetic dentistry and more.",
  path: "/services",
});

export const revalidate = 3600;

export default async function ServicesIndex() {
  const categories = await prisma.category.findMany({
    include: {
      services: {
        include: { _count: { select: { businesses: true } } },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container py-14">
      <h1 className="font-display text-5xl font-semibold">All treatments</h1>
      <p className="mt-3 text-ink-muted max-w-2xl">
        Every service we track across aesthetics, wellness, and cosmetic care. Tap any treatment
        for pricing, top providers, and comparisons.
      </p>

      <div className="mt-12 space-y-12">
        {categories.map((cat) => (
          <section key={cat.id}>
            <h2 className="font-display text-3xl font-semibold">{cat.name}</h2>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {cat.services.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="rounded-2xl border border-ink/10 p-4 hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <p className="font-display text-lg font-semibold">{s.name}</p>
                  <p className="text-xs text-ink-muted">{s._count.businesses} providers</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
