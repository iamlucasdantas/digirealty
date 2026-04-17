import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

/**
 * Monolithic sitemap for small-to-medium catalogs. When we cross ~40k URLs
 * switch this to a sitemap index file (`/sitemap.xml` → `/sitemaps/[part].xml`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, services, businesses, comparisons, pages, blog] = await Promise.all([
    prisma.city.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.service.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.business.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.comparison.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.seoPage.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const statics: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), priority: 1, changeFrequency: "daily" },
    { url: absoluteUrl("/services"), priority: 0.9, changeFrequency: "weekly" },
    { url: absoluteUrl("/compare"), priority: 0.8, changeFrequency: "weekly" },
    { url: absoluteUrl("/for-providers"), priority: 0.7, changeFrequency: "monthly" },
    { url: absoluteUrl("/learn"), priority: 0.6, changeFrequency: "weekly" },
  ];

  const cityEntries = cities.flatMap((c) => [
    { url: absoluteUrl(`/${c.slug}`), lastModified: c.updatedAt, priority: 0.7 },
  ]);

  const serviceEntries = services.map((s) => ({
    url: absoluteUrl(`/services/${s.slug}`),
    lastModified: s.updatedAt,
    priority: 0.8,
  }));

  // Combinatorial service × city pages — highest-intent SEO surface.
  const crossProduct: MetadataRoute.Sitemap = [];
  for (const s of services) {
    for (const c of cities) {
      crossProduct.push({
        url: absoluteUrl(`/${s.slug}-in-${c.slug}`),
        lastModified: new Date(),
        priority: 0.85,
        changeFrequency: "weekly",
      });
      crossProduct.push({
        url: absoluteUrl(`/best-${s.slug}-in-${c.slug}`),
        lastModified: new Date(),
        priority: 0.7,
        changeFrequency: "weekly",
      });
    }
  }

  const businessEntries = businesses.map((b) => ({
    url: absoluteUrl(`/business/${b.slug}`),
    lastModified: b.updatedAt,
    priority: 0.7,
  }));

  const comparisonEntries = comparisons.map((c) => ({
    url: absoluteUrl(`/compare/${c.slug}`),
    lastModified: c.updatedAt,
    priority: 0.7,
  }));

  const pageEntries = pages.map((p) => ({
    url: absoluteUrl(`/${p.slug}`),
    lastModified: p.updatedAt,
    priority: 0.75,
  }));

  const blogEntries = blog.map((p) => ({
    url: absoluteUrl(`/learn/${p.slug}`),
    lastModified: p.updatedAt,
    priority: 0.65,
  }));

  return [
    ...statics,
    ...cityEntries,
    ...serviceEntries,
    ...crossProduct,
    ...businessEntries,
    ...comparisonEntries,
    ...pageEntries,
    ...blogEntries,
  ];
}
