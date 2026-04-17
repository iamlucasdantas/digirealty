import "server-only";
import { prisma } from "./db";
import type { Lead, Business } from "@prisma/client";
import { sendLeadEmail } from "./email";

/**
 * Lead routing strategy — the money engine.
 *
 * When a lead arrives we score matching businesses and offer the lead to the
 * best ones. Tier weights: PREMIUM > FEATURED > VERIFIED > FREE.
 * Leads are exclusive by default (sold once). Configure via LEAD_EXCLUSIVE.
 */

const TIER_WEIGHT: Record<string, number> = {
  PREMIUM: 100,
  FEATURED: 60,
  VERIFIED: 25,
  FREE: 5,
};

const DEFAULT_PRICE = Number(process.env.LEAD_PRICE_DEFAULT_CENTS ?? 2500);

interface ScoredMatch {
  business: Business;
  score: number;
  priceCents: number;
}

export async function findMatches(lead: Lead, limit = 5): Promise<ScoredMatch[]> {
  if (!lead.serviceId) return [];
  const candidates = await prisma.business.findMany({
    where: {
      status: "PUBLISHED",
      services: { some: { serviceId: lead.serviceId } },
      city: lead.zip
        ? undefined
        : // soft geo fallback — same city as landing, if any
          undefined,
    },
    include: { city: true, services: true },
    take: 50,
  });

  return candidates
    .map((b) => {
      const tier = TIER_WEIGHT[b.tier] ?? 5;
      const rating = (b.ratingAvg ?? 0) * (b.ratingCount > 0 ? 4 : 0);
      const claimed = b.claimedById ? 10 : 0;
      const score = tier + rating + claimed;
      const priceCents = priceForTier(b.tier);
      return { business: b, score, priceCents };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function priceForTier(tier: string): number {
  switch (tier) {
    case "PREMIUM":
      return Math.round(DEFAULT_PRICE * 1.6);
    case "FEATURED":
      return Math.round(DEFAULT_PRICE * 1.3);
    case "VERIFIED":
      return DEFAULT_PRICE;
    default:
      return Math.round(DEFAULT_PRICE * 0.6);
  }
}

/**
 * Offer the lead to the top N matches. In exclusive mode, the first acceptor
 * wins and the rest auto-expire. In shared mode, the top K all receive it.
 */
export async function routeLead(leadId: string): Promise<number> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return 0;

  const matches = await findMatches(lead, 3);
  if (matches.length === 0) {
    await prisma.leadEvent.create({
      data: { leadId, type: "route_no_match" },
    });
    return 0;
  }

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: "ROUTED",
        businessId: matches[0].business.id,
        priceCents: matches[0].priceCents,
      },
    });
    await tx.leadAssignment.createMany({
      data: matches.map((m) => ({
        leadId,
        businessId: m.business.id,
        priceCents: m.priceCents,
        status: "offered",
      })),
    });
    await tx.leadEvent.create({
      data: { leadId, type: "routed", payload: { matches: matches.map((m) => m.business.id) } },
    });
  });

  // Best-effort notification — not in the transaction.
  for (const m of matches) {
    if (m.business.email) {
      await sendLeadEmail(m.business.email, lead, m.business).catch(() => undefined);
    }
  }

  return matches.length;
}
