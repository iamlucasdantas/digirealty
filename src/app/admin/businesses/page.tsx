import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const rows = await prisma.business.findMany({
    include: { city: true, _count: { select: { leads: true, reviews: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <>
      <div className="flex items-end justify-between">
        <h1 className="font-display text-3xl font-semibold">Businesses</h1>
        <Link
          href="/admin/businesses/new"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Add business
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">City</th>
              <th className="text-left px-4 py-2">Tier</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Leads</th>
              <th className="text-right px-4 py-2">Reviews</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-ink/5">
                <td className="px-4 py-2 font-medium">{b.name}</td>
                <td className="px-4 py-2">
                  {b.city.name}, {b.city.state}
                </td>
                <td className="px-4 py-2">{b.tier}</td>
                <td className="px-4 py-2">{b.status}</td>
                <td className="px-4 py-2 text-right">{b._count.leads}</td>
                <td className="px-4 py-2 text-right">{b._count.reviews}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/business/${b.slug}`} className="text-xs text-brand-700 hover:underline">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
