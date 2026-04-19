/* eslint-disable no-console */
/**
 * Google Places → Business directory importer.
 *
 *   pnpm tsx scripts/import-google-places.ts --limit=8 --dry-run
 *   pnpm tsx scripts/import-google-places.ts              # live
 *   pnpm tsx scripts/import-google-places.ts --city=davenport-ia
 *
 * Imports businesses for every (city × seed query) combo. Each result becomes
 * a Business row with `unclaimed=true` and `importedFrom="google_places"`.
 *
 * Uses Google Places API (New) — Text Search. Requires GOOGLE_PLACES_API_KEY
 * in .env, with the key restricted to Places API + the current host/IP.
 *
 * Billing note: Text Search is $32/1k (as of 2024) — cheap at our scale. We
 * batch 1 call per (city × query). With 4 cities × 8 queries = 32 calls per
 * full run.
 *
 * Each Business gets an UnlistToken so our outreach email can one-click
 * remove the listing if the owner asks.
 */
import { PrismaClient, ListingTier, BusinessStatus } from "@prisma/client";
import { randomBytes, createHash } from "node:crypto";
import slugify from "slugify";

const prisma = new PrismaClient();
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const API_BASE = "https://places.googleapis.com/v1/places:searchText";

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"] as const;
  }),
);
const LIMIT = Number(args.get("limit") ?? 10);
const DRY = args.get("dry-run") === "true";
const ONLY_CITY = args.get("city");

// Search queries we fire per city. Each maps to the service slugs we'll
// attach to the imported business.
const SEED_QUERIES: Array<{ q: (city: string) => string; services: string[] }> = [
  { q: (c) => `med spa in ${c}`, services: ["botox", "dermal-fillers"] },
  { q: (c) => `botox clinic in ${c}`, services: ["botox"] },
  { q: (c) => `laser hair removal in ${c}`, services: ["laser-hair-removal"] },
  { q: (c) => `coolsculpting clinic in ${c}`, services: ["coolsculpting"] },
  { q: (c) => `microneedling provider in ${c}`, services: ["microneedling"] },
  { q: (c) => `IV therapy clinic in ${c}`, services: ["iv-therapy"] },
  { q: (c) => `teeth whitening in ${c}`, services: ["teeth-whitening"] },
  { q: (c) => `weight loss clinic ${c}`, services: ["semaglutide"] },
];

interface PlacesResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  location?: { latitude: number; longitude: number };
  addressComponents?: Array<{ shortText?: string; longText?: string; types: string[] }>;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
}

async function searchText(query: string, limit: number): Promise<PlacesResult[]> {
  if (!API_KEY) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.internationalPhoneNumber",
        "places.websiteUri",
        "places.rating",
        "places.userRatingCount",
        "places.location",
        "places.addressComponents",
        "places.regularOpeningHours",
      ].join(","),
    },
    body: JSON.stringify({ textQuery: query, pageSize: limit }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`places:${res.status} ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { places?: PlacesResult[] };
  return data.places ?? [];
}

function zipOf(p: PlacesResult): string | undefined {
  return p.addressComponents?.find((a) => a.types.includes("postal_code"))?.longText;
}

function hoursOf(p: PlacesResult): Record<string, string> | undefined {
  const lines = p.regularOpeningHours?.weekdayDescriptions;
  if (!lines?.length) return undefined;
  const out: Record<string, string> = {};
  for (const line of lines) {
    // "Monday: 9:00 AM – 6:00 PM"
    const [day, hours] = line.split(":");
    if (day && hours) out[day.trim().toLowerCase()] = hours.trim();
  }
  return out;
}

function makeSlug(name: string, cityState: string): string {
  const base = slugify(`${name} ${cityState}`, { lower: true, strict: true });
  return base.slice(0, 80);
}

function hashLicense(placeId: string): string {
  // Not a license — just a deterministic id suffix for dedupe / fuzzy match.
  return createHash("sha1").update(placeId).digest("hex").slice(0, 10);
}

async function run() {
  const cities = await prisma.city.findMany({
    where: ONLY_CITY ? { slug: ONLY_CITY } : undefined,
    include: { market: true },
  });
  if (cities.length === 0) {
    console.error("No cities found. Run `pnpm db:seed` first.");
    return;
  }

  const allServices = await prisma.service.findMany();
  const serviceBySlug = new Map(allServices.map((s) => [s.slug, s]));

  let created = 0;
  let skipped = 0;
  let calls = 0;

  for (const city of cities) {
    console.log(`\n━ ${city.name}, ${city.state}`);
    for (const seed of SEED_QUERIES) {
      const query = seed.q(`${city.name}, ${city.state}`);
      if (DRY) {
        console.log(`  [dry] would search: "${query}"`);
        continue;
      }
      calls += 1;
      let results: PlacesResult[] = [];
      try {
        results = await searchText(query, LIMIT);
      } catch (err) {
        console.error(`  ! ${query} -> ${(err as Error).message}`);
        continue;
      }
      process.stdout.write(`  ${seed.q(city.name)}: ${results.length} results`);

      for (const r of results) {
        if (!r.displayName?.text) continue;
        const name = r.displayName.text;
        const slug = makeSlug(name, `${city.slug}`);

        // Dedupe by googlePlaceId first, slug second.
        const existing = await prisma.business.findFirst({
          where: {
            OR: [
              { googlePlaceId: r.id },
              { slug },
            ],
          },
        });
        if (existing) {
          // Upsert service attachments only — don't overwrite user data.
          for (const svcSlug of seed.services) {
            const svc = serviceBySlug.get(svcSlug);
            if (!svc) continue;
            await prisma.businessService.upsert({
              where: { businessId_serviceId: { businessId: existing.id, serviceId: svc.id } },
              update: {},
              create: { businessId: existing.id, serviceId: svc.id },
            });
          }
          skipped += 1;
          continue;
        }

        const b = await prisma.business.create({
          data: {
            slug,
            name,
            legalName: name,
            status: BusinessStatus.PUBLISHED,
            tier: ListingTier.FREE,
            unclaimed: true,
            googlePlaceId: r.id,
            importedFrom: "google_places",
            cityId: city.id,
            address1: r.formattedAddress,
            zip: zipOf(r),
            phone: r.internationalPhoneNumber,
            website: r.websiteUri,
            latitude: r.location?.latitude,
            longitude: r.location?.longitude,
            ratingAvg: r.rating,
            ratingCount: r.userRatingCount ?? 0,
            hours: hoursOf(r),
            descShort: `Imported from public data. Owner — claim this listing to edit.`,
          },
        });

        // Attach services.
        for (const svcSlug of seed.services) {
          const svc = serviceBySlug.get(svcSlug);
          if (!svc) continue;
          await prisma.businessService.create({
            data: { businessId: b.id, serviceId: svc.id },
          });
        }

        // One-click opt-out token for outreach emails.
        await prisma.unlistToken.create({
          data: {
            businessId: b.id,
            token: randomBytes(24).toString("hex"),
          },
        });

        created += 1;
      }
      process.stdout.write(" ✓\n");

      // Gentle rate-limit to stay well under Places quota.
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.log(
    `\nDone: ${created} created, ${skipped} skipped (duplicates), ${calls} API calls.`,
  );
  console.log(`Estimated cost: $${((calls * 32) / 1000).toFixed(2)} USD`);
  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
