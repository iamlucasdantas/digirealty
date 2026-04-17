import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  const [leadCount, acceptedCount, revenueAgg, businessCount, pageAgg, topPages] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.count({ where: { status: "ACCEPTED", createdAt: { gte: since } } }),
    prisma.lead.aggregate({
      _sum: { priceCents: true },
      where: { status: { in: ["ACCEPTED", "SOLD"] }, createdAt: { gte: since } },
    }),
    prisma.business.count(),
    prisma.seoPage.aggregate({ _sum: { pageViews: true } }),
    prisma.seoPage.findMany({
      orderBy: { pageViews: "desc" },
      take: 10,
      select: { slug: true, type: true, pageViews: true, leadCount: true },
    }),
  ]);

  const revenueCents = revenueAgg._sum.priceCents ?? 0;
  const convRate = leadCount ? ((acceptedCount / leadCount) * 100).toFixed(1) : "0";

  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Overview</h1>
      <p className="mt-1 text-sm text-ink-muted">Last 30 days</p>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Leads" value={leadCount.toLocaleString()} />
        <Kpi label="Accepted" value={acceptedCount.toLocaleString()} sub={`${convRate}% conv.`} />
        <Kpi label="Revenue" value={formatCurrency(revenueCents)} />
        <Kpi label="Businesses" value={businessCount.toLocaleString()} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold">Top SEO pages</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2">Page</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-right px-4 py-2">Views</th>
                <th className="text-right px-4 py-2">Leads</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p) => (
                <tr key={p.slug} className="border-t border-ink/5">
                  <td className="px-4 py-2 font-mono text-xs">/{p.slug}</td>
                  <td className="px-4 py-2">{p.type}</td>
                  <td className="px-4 py-2 text-right">{p.pageViews.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{p.leadCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Total page views indexed: {(pageAgg._sum.pageViews ?? 0).toLocaleString()}
      </p>
    </>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}
