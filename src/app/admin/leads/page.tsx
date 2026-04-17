import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { service: true, business: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <div className="flex items-end justify-between">
        <h1 className="font-display text-3xl font-semibold">Leads</h1>
        <Link href="/api/admin/leads.csv" className="text-sm font-semibold text-brand-700 hover:underline">
          Export CSV →
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-2">When</th>
              <th className="text-left px-4 py-2">Contact</th>
              <th className="text-left px-4 py-2">Service</th>
              <th className="text-left px-4 py-2">Routed to</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-ink/5">
                <td className="px-4 py-2 whitespace-nowrap text-xs text-ink-muted">
                  {l.createdAt.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <div className="font-medium">
                    {l.firstName} {l.lastName ?? ""}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {l.email} · {l.phone ?? "no phone"}
                  </div>
                </td>
                <td className="px-4 py-2">{l.service?.name ?? "—"}</td>
                <td className="px-4 py-2">{l.business?.name ?? "—"}</td>
                <td className="px-4 py-2">
                  <StatusPill status={l.status} />
                </td>
                <td className="px-4 py-2 text-right">{formatCurrency(l.priceCents ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "ACCEPTED" || status === "SOLD"
      ? "bg-emerald-100 text-emerald-800"
      : status === "NEW" || status === "QUALIFIED"
      ? "bg-sky-100 text-sky-800"
      : status === "ROUTED"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{status}</span>;
}
