import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { MapPin } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Cities we cover",
  description:
    "Every market The Aesthetics Atlas is active in, with live provider counts. Don't see your city? Join the waitlist.",
  path: "/cities",
});

export const revalidate = 3600;

/**
 * Cities index. Principle (spec §P0.5): counts are always scoped — each
 * city's number reflects ONLY that city's live directory, never a global
 * total. Markets with 0 providers surface a waitlist CTA instead of a
 * provider grid.
 */
export default async function CitiesIndex() {
  const cities = await prisma.city.findMany({
    include: {
      market: true,
      _count: {
        select: {
          businesses: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const withProviders = cities.filter((c) => c._count.businesses > 0);
  const comingSoon = cities.filter((c) => c._count.businesses === 0);

  return (
    <div className="container py-14 max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        Cities
      </p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">
        Where we&apos;re active
      </h1>
      <p className="mt-3 text-lg text-ink-muted">
        We launch in a city only after we have a minimum coverage of verified
        providers. Markets below the line are actively being built — if you&apos;re in
        one, join the waitlist and we&apos;ll tell you the moment we&apos;re live.
      </p>

      {withProviders.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Active ({withProviders.length})
          </h2>
          <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2">
            {withProviders.map((c) => (
              <Link
                key={c.id}
                href={`/${c.slug}`}
                className="group rounded-2xl border border-ink/10 bg-white p-5 hover:border-brand-300"
              >
                <p className="flex items-center gap-2 font-display text-xl font-semibold group-hover:text-brand-700">
                  <MapPin className="h-4 w-4 text-brand-600" aria-hidden />
                  {c.name}, {c.state}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {c._count.businesses} provider{c._count.businesses === 1 ? "" : "s"}{" "}
                  in {c.market.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-12 rounded-2xl border border-dashed border-ink/15 p-8 text-center">
          <p className="font-display text-xl font-semibold">
            We haven&apos;t launched anywhere yet.
          </p>
          <p className="mt-2 text-ink-muted">
            Providers are being vetted in Quad Cities. If you&apos;d like to be
            notified, subscribe to the newsletter at the bottom of any page.
          </p>
        </section>
      )}

      {comingSoon.length > 0 && (
        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Coming soon ({comingSoon.length})
          </h2>
          <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-3">
            {comingSoon.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-ink/5 bg-slate-50 p-4 text-sm"
              >
                <p className="font-semibold">
                  {c.name}, {c.state}
                </p>
                <p className="text-xs text-ink-muted">
                  Recruiting providers
                </p>
                <Link
                  href={`/waitlist?city=${c.slug}`}
                  className="mt-2 inline-block text-xs font-semibold text-brand-700 hover:underline"
                >
                  Join waitlist →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
