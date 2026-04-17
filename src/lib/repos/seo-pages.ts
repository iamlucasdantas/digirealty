import "server-only";
import { prisma } from "../db";

export async function getServiceCityPage(serviceSlug: string, citySlug: string) {
  return prisma.seoPage.findFirst({
    where: {
      type: "SERVICE_CITY",
      service: { slug: serviceSlug },
      city: { slug: citySlug },
      published: true,
    },
    include: { service: true, city: { include: { market: true } } },
  });
}

export async function getBestServiceCityPage(serviceSlug: string, citySlug: string) {
  return prisma.seoPage.findFirst({
    where: {
      type: "BEST_SERVICE_CITY",
      service: { slug: serviceSlug },
      city: { slug: citySlug },
      published: true,
    },
    include: { service: true, city: { include: { market: true } } },
  });
}

export async function getComparisonPage(slug: string) {
  return prisma.seoPage.findFirst({
    where: { type: "COMPARISON", slug, published: true },
    include: {
      comparison: { include: { serviceA: true, serviceB: true } },
    },
  });
}

export async function incrementPageView(pageId: string): Promise<void> {
  // Fire-and-forget; we don't await on page render.
  prisma.seoPage
    .update({ where: { id: pageId }, data: { pageViews: { increment: 1 } } })
    .catch(() => undefined);
}

export async function listPublishedSeoPages() {
  return prisma.seoPage.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true, type: true },
    orderBy: { updatedAt: "desc" },
    take: 50_000, // hard cap; split the sitemap above this
  });
}
