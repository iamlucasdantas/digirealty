import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [leadsRevenue, affiliateAgg, adAgg, tierCounts] = await Promise.all([
    prisma.lead.aggregate({
      _sum: { priceCents: true },
      _count: true,
      where: { status: { in: ["ACCEPTED", "SOLD"] }, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.affiliateProduct.aggregate({
      _sum: { revenueCents: true, clicks: true, conversions: true },
    }),
    prisma.adPlacement.aggregate({
      _sum: { impressions: true, clicks: true },
    }),
    prisma.business.groupBy({ by: ["tier"], _count: true }),
  ]);

  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Revenue</h1>
      <p className="mt-1 text-sm text-ink-muted">Rolling 30-day view across all channels.</p>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Card
          title="Lead sales"
          value={formatCurrency(leadsRevenue._sum.priceCents ?? 0)}
          sub={`${leadsRevenue._count} paid leads`}
        />
        <Card
          title="Affiliate"
          value={formatCurrency(affiliateAgg._sum.revenueCents ?? 0)}
          sub={`${affiliateAgg._sum.clicks ?? 0} clicks · ${affiliateAgg._sum.conversions ?? 0} conv.`}
        />
        <Card
          title="Ad performance"
          value={`${(adAgg._sum.clicks ?? 0).toLocaleString()} clicks`}
          sub={`${(adAgg._sum.impressions ?? 0).toLocaleString()} impressions`}
        />
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">Subscribers by tier</h2>
      <ul className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        {tierCounts.map((t) => (
          <li key={t.tier} className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-ink-muted">{t.tier}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{t._count}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Card({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-ink-muted">{title}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}
