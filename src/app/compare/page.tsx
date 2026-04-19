import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Compare treatments",
  description:
    "Side-by-side comparisons of similar aesthetics and cosmetic treatments — cost, downtime, who it's for, and how to decide. Reviewed by licensed clinicians when ready.",
  path: "/compare",
});

export const revalidate = 3600;

export default async function CompareIndex() {
  const comparisons = await prisma.comparison.findMany({
    include: { serviceA: true, serviceB: true, page: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-14 max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        Compare
      </p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">
        Treatment comparisons
      </h1>
      <p className="mt-3 text-lg text-ink-muted">
        When two treatments target the same concern, picking between them comes
        down to candidacy, downtime, cost over time, and maintenance. These
        guides lay out the trade-offs without steering you toward the more
        expensive option.
      </p>

      {comparisons.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-ink/15 p-10 text-center">
          <p className="font-display text-xl">No comparisons published yet.</p>
          <p className="mt-2 text-ink-muted">
            Our first cohort lands during the launch content sprint.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {comparisons.map((c) => (
            <li key={c.id}>
              <Link
                href={`/compare/${c.slug}`}
                className="block rounded-2xl border border-ink/10 bg-white p-5 hover:border-brand-300"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Comparison
                </p>
                <p className="mt-1 font-display text-xl font-semibold">
                  {c.title}
                </p>
                {c.summary && (
                  <p className="mt-2 text-sm text-ink-muted line-clamp-3">{c.summary}</p>
                )}
                <p className="mt-3 text-xs text-ink-muted">
                  {c.serviceA.name} · {c.serviceB.name}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
