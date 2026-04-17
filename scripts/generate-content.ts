/* eslint-disable no-console */
/**
 * Batch-generate SEO pages with Claude.
 *
 *   pnpm ai:generate-content -- --type=service-city --limit=50
 *   pnpm ai:generate-content -- --type=comparison --slug=botox-vs-fillers
 *
 * Respects rate limits — sleeps between calls. Skips pages that already exist
 * unless --force is passed.
 */
import { PrismaClient, SeoPageType } from "@prisma/client";
import { generateServiceCityPage, generateComparison } from "../src/lib/ai";

const prisma = new PrismaClient();

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"] as const;
  }),
);
const TYPE = args.get("type") ?? "service-city";
const LIMIT = Number(args.get("limit") ?? 20);
const FORCE = args.get("force") === "true";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runServiceCity() {
  const [services, cities] = await Promise.all([
    prisma.service.findMany(),
    prisma.city.findMany(),
  ]);

  let made = 0;
  outer: for (const s of services) {
    for (const c of cities) {
      if (made >= LIMIT) break outer;
      const slug = `${s.slug}-in-${c.slug}`;
      const existing = await prisma.seoPage.findUnique({ where: { slug } });
      if (existing && !FORCE) continue;

      try {
        const gen = await generateServiceCityPage({
          service: { name: s.name, slug: s.slug, shortDesc: s.shortDesc },
          city: { name: c.name, state: c.state },
        });
        await prisma.seoPage.upsert({
          where: { slug },
          create: {
            slug,
            type: SeoPageType.SERVICE_CITY,
            title: gen.h1,
            h1: gen.h1,
            metaTitle: gen.metaTitle,
            metaDesc: gen.metaDesc,
            intro: gen.intro,
            body: gen.bodyMdx,
            faq: gen.faq,
            serviceId: s.id,
            cityId: c.id,
            aiGenerated: true,
            aiModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
          },
          update: {
            title: gen.h1,
            h1: gen.h1,
            metaTitle: gen.metaTitle,
            metaDesc: gen.metaDesc,
            intro: gen.intro,
            body: gen.bodyMdx,
            faq: gen.faq,
            aiGenerated: true,
          },
        });
        made += 1;
        console.log(`✓ ${slug}`);
        await sleep(750);
      } catch (err) {
        console.error(`✗ ${slug}`, err);
      }
    }
  }
  console.log(`done (service-city): ${made}`);
}

async function runComparisons() {
  const only = args.get("slug");
  const comparisons = await prisma.comparison.findMany({
    where: only ? { slug: only } : {},
    include: { serviceA: true, serviceB: true, page: true },
  });
  for (const c of comparisons) {
    if (c.page && !FORCE) continue;
    try {
      const gen = await generateComparison({
        a: { name: c.serviceA.name, shortDesc: c.serviceA.shortDesc },
        b: { name: c.serviceB.name, shortDesc: c.serviceB.shortDesc },
      });
      const slug = `compare/${c.slug}`;
      const page = await prisma.seoPage.upsert({
        where: { slug },
        create: {
          slug,
          type: SeoPageType.COMPARISON,
          title: gen.h1,
          h1: gen.h1,
          metaTitle: gen.metaTitle,
          metaDesc: gen.metaDesc,
          intro: gen.summary,
          body: gen.bodyMdx,
          faq: gen.faq,
          comparisonId: c.id,
          aiGenerated: true,
        },
        update: {
          title: gen.h1,
          metaTitle: gen.metaTitle,
          metaDesc: gen.metaDesc,
          intro: gen.summary,
          body: gen.bodyMdx,
          faq: gen.faq,
        },
      });
      await prisma.comparison.update({
        where: { id: c.id },
        data: {
          summary: gen.summary,
          pros: gen.pros,
          cons: gen.cons,
          table: gen.table,
        },
      });
      console.log(`✓ ${page.slug}`);
    } catch (err) {
      console.error(`✗ ${c.slug}`, err);
    }
  }
}

(async () => {
  if (TYPE === "service-city") await runServiceCity();
  else if (TYPE === "comparison") await runComparisons();
  else console.error(`Unknown --type=${TYPE}`);
  await prisma.$disconnect();
})();
