import "server-only";
import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Placement } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  placement: Placement;
  cityId?: string;
  serviceId?: string;
  className?: string;
}

/**
 * Server component — picks the highest-priority active placement for the
 * slot & context. Records an impression in fire-and-forget mode.
 */
export async function AdSlot({ placement, cityId, serviceId, className }: Props) {
  const now = new Date();
  const ad = await prisma.adPlacement.findFirst({
    where: {
      placement,
      active: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
      OR: [
        { cityId: cityId ?? null, serviceId: serviceId ?? null },
        { cityId: null, serviceId: null },
      ],
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  if (!ad) return null;

  prisma.adPlacement
    .update({ where: { id: ad.id }, data: { impressions: { increment: 1 } } })
    .catch(() => undefined);

  return (
    <aside
      className={cn("rounded-2xl border border-amber-200 bg-amber-50 p-5", className)}
      data-placement={placement}
      data-ad-id={ad.id}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Sponsored</p>
      <h3 className="mt-1 font-display text-lg font-semibold">{ad.headline}</h3>
      {ad.subhead && <p className="mt-1 text-sm text-ink/80">{ad.subhead}</p>}
      <Link
        href={`/go/ad/${ad.id}`}
        rel="sponsored nofollow"
        className="mt-3 inline-flex rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
      >
        {ad.ctaLabel}
      </Link>
    </aside>
  );
}
