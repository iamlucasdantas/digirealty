import "server-only";
import { prisma } from "../db";
import type { ListingTier } from "@prisma/client";

const TIER_ORDER: Record<ListingTier, number> = {
  PREMIUM: 0,
  FEATURED: 1,
  VERIFIED: 2,
  FREE: 3,
};

export async function listBusinessesByCityAndService({
  citySlug,
  serviceSlug,
  limit = 24,
}: {
  citySlug: string;
  serviceSlug?: string;
  limit?: number;
}) {
  const results = await prisma.business.findMany({
    where: {
      status: "PUBLISHED",
      city: { slug: citySlug },
      ...(serviceSlug
        ? { services: { some: { service: { slug: serviceSlug } } } }
        : {}),
    },
    include: {
      city: true,
      services: { include: { service: true } },
    },
    take: limit,
  });
  // Sort in memory so we can prioritize tier + rating consistently.
  return results.sort((a, b) => {
    const t = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    if (t !== 0) return t;
    const r = (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0);
    if (r !== 0) return r;
    return b.ratingCount - a.ratingCount;
  });
}

export async function getBusinessBySlug(slug: string) {
  return prisma.business.findUnique({
    where: { slug },
    include: {
      city: { include: { market: true } },
      services: { include: { service: { include: { category: true } } } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export async function listFeaturedForCity(citySlug: string, limit = 6) {
  return prisma.business.findMany({
    where: {
      status: "PUBLISHED",
      city: { slug: citySlug },
      tier: { in: ["FEATURED", "PREMIUM"] },
    },
    include: { city: true },
    take: limit,
    orderBy: [{ tier: "asc" }, { ratingAvg: "desc" }],
  });
}
