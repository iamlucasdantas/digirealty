/* eslint-disable no-console */
import { PrismaClient, ListingTier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding…");

  // Admin
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@aestheticsleads.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-now";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: { email: adminEmail, role: "ADMIN", passwordHash, name: "Admin" },
  });

  // Market + cities (Quad Cities launch)
  const qc = await prisma.market.upsert({
    where: { slug: "quad-cities" },
    update: {},
    create: {
      slug: "quad-cities",
      name: "Quad Cities",
      state: "IA",
      isActive: true,
      launchedAt: new Date(),
    },
  });

  const cities = [
    { slug: "davenport-ia", name: "Davenport", state: "IA", population: 101_724 },
    { slug: "bettendorf-ia", name: "Bettendorf", state: "IA", population: 38_500 },
    { slug: "rock-island-il", name: "Rock Island", state: "IL", population: 37_109 },
    { slug: "moline-il", name: "Moline", state: "IL", population: 42_480 },
  ];
  for (const c of cities) {
    await prisma.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, marketId: qc.id },
    });
  }

  // Categories + services
  const categories = [
    { slug: "injectables", name: "Injectables", sortOrder: 1 },
    { slug: "skin-laser", name: "Skin & Laser", sortOrder: 2 },
    { slug: "body-contouring", name: "Body contouring", sortOrder: 3 },
    { slug: "wellness", name: "Wellness & IV", sortOrder: 4 },
    { slug: "cosmetic-dentistry", name: "Cosmetic dentistry", sortOrder: 5 },
    { slug: "weight-loss", name: "Weight loss", sortOrder: 6 },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const services: Array<{
    slug: string;
    name: string;
    categorySlug: string;
    priceLow: number;
    priceHigh: number;
    priceUnit?: string;
    shortDesc?: string;
  }> = [
    { slug: "botox", name: "Botox", categorySlug: "injectables", priceLow: 10_00, priceHigh: 18_00, priceUnit: "per unit", shortDesc: "Smooths dynamic wrinkles by relaxing targeted muscles. Results typically last 3–4 months." },
    { slug: "dermal-fillers", name: "Dermal fillers", categorySlug: "injectables", priceLow: 650_00, priceHigh: 1_200_00, priceUnit: "per syringe", shortDesc: "Restores volume and contours lips, cheeks, and midface with hyaluronic acid." },
    { slug: "laser-hair-removal", name: "Laser hair removal", categorySlug: "skin-laser", priceLow: 150_00, priceHigh: 450_00, priceUnit: "per session" },
    { slug: "ipl-photofacial", name: "IPL photofacial", categorySlug: "skin-laser", priceLow: 300_00, priceHigh: 550_00 },
    { slug: "microneedling", name: "Microneedling", categorySlug: "skin-laser", priceLow: 250_00, priceHigh: 650_00 },
    { slug: "coolsculpting", name: "CoolSculpting", categorySlug: "body-contouring", priceLow: 750_00, priceHigh: 2_000_00 },
    { slug: "emsculpt", name: "EmSculpt", categorySlug: "body-contouring", priceLow: 750_00, priceHigh: 1_200_00, priceUnit: "per session" },
    { slug: "iv-therapy", name: "IV therapy", categorySlug: "wellness", priceLow: 125_00, priceHigh: 300_00 },
    { slug: "teeth-whitening", name: "Teeth whitening", categorySlug: "cosmetic-dentistry", priceLow: 300_00, priceHigh: 900_00 },
    { slug: "veneers", name: "Veneers", categorySlug: "cosmetic-dentistry", priceLow: 900_00, priceHigh: 2_500_00, priceUnit: "per tooth" },
    { slug: "semaglutide", name: "Semaglutide / GLP-1", categorySlug: "weight-loss", priceLow: 300_00, priceHigh: 650_00, priceUnit: "per month" },
    { slug: "general-aesthetics", name: "General aesthetics", categorySlug: "injectables", priceLow: 0, priceHigh: 0 },
  ];

  for (const s of services) {
    const cat = await prisma.category.findUnique({ where: { slug: s.categorySlug } });
    if (!cat) continue;
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        name: s.name,
        categoryId: cat.id,
        avgPriceLow: s.priceLow,
        avgPriceHigh: s.priceHigh,
        priceUnit: s.priceUnit,
        shortDesc: s.shortDesc,
        seoKeywords: [s.name.toLowerCase(), `${s.slug}-near-me`, `best-${s.slug}`],
        faq: [
          { q: `How much does ${s.name} cost?`, a: `Pricing varies by provider and treatment area, but typically ranges in this market. Request a quote for a personalized estimate.` },
          { q: `Is ${s.name} safe?`, a: `When performed by a licensed provider in an appropriate setting, ${s.name} has an established safety profile. Always consult a licensed professional.` },
          { q: `How soon will I see results?`, a: `Results onset varies by treatment. Your provider will walk you through a realistic timeline during consultation.` },
        ],
      },
    });
  }

  // A few demo businesses
  const davenport = await prisma.city.findUnique({ where: { slug: "davenport-ia" } });
  const bettendorf = await prisma.city.findUnique({ where: { slug: "bettendorf-ia" } });
  if (davenport && bettendorf) {
    const botox = await prisma.service.findUnique({ where: { slug: "botox" } });
    const fillers = await prisma.service.findUnique({ where: { slug: "dermal-fillers" } });
    const laser = await prisma.service.findUnique({ where: { slug: "laser-hair-removal" } });

    const businesses = [
      {
        slug: "river-bend-aesthetics",
        name: "River Bend Aesthetics",
        cityId: davenport.id,
        tier: "FEATURED" as ListingTier,
        descShort: "Board-certified injectors specializing in natural-looking Botox & filler results in downtown Davenport.",
        ratingAvg: 4.9,
        ratingCount: 142,
        phone: "(563) 555-0142",
        address1: "415 E 2nd St",
        zip: "52801",
        services: [botox, fillers].filter(Boolean),
      },
      {
        slug: "bettendorf-skin-co",
        name: "Bettendorf Skin Co.",
        cityId: bettendorf.id,
        tier: "VERIFIED" as ListingTier,
        descShort: "Modern med spa focused on medical-grade facials, laser, and Botox.",
        ratingAvg: 4.8,
        ratingCount: 98,
        phone: "(563) 555-0198",
        services: [botox, laser].filter(Boolean),
      },
      {
        slug: "mississippi-medspa",
        name: "Mississippi MedSpa",
        cityId: davenport.id,
        tier: "FREE" as ListingTier,
        descShort: "Full-service med spa with injectables, skincare, and body contouring.",
        ratingAvg: 4.6,
        ratingCount: 61,
        services: [botox, fillers, laser].filter(Boolean),
      },
    ];

    for (const b of businesses) {
      const { services: svcs, ...data } = b;
      const created = await prisma.business.upsert({
        where: { slug: b.slug },
        update: {},
        create: data,
      });
      for (const s of svcs) {
        if (!s) continue;
        await prisma.businessService.upsert({
          where: { businessId_serviceId: { businessId: created.id, serviceId: s.id } },
          update: {},
          create: { businessId: created.id, serviceId: s.id },
        });
      }
    }
  }

  // ─── Editorial team (placeholder personas) ────────────────
  await prisma.author.upsert({
    where: { slug: "morgan-ellis" },
    update: {},
    create: {
      slug: "morgan-ellis",
      name: "Morgan Ellis",
      title: "Editor-in-Chief",
      bio: "Morgan has spent a decade writing about beauty and wellness for national magazines and independent publications. She started The Aesthetics Atlas to cut through the hype around cosmetic treatments — one honest, deeply researched guide at a time. She lives in the Midwest with an embarrassingly large skincare fridge.",
      photoUrl: null,
      email: "morgan@theaestheticsatlas.com",
      twitter: "morganellis",
      instagram: "morgan.ellis",
      credentials: [
        "MA Journalism, Northwestern",
        "Former beauty editor, national lifestyle magazine",
      ],
      expertise: [
        "Injectables",
        "Laser & light therapy",
        "Skincare science",
        "Local market pricing",
      ],
      isPlaceholder: true,
    },
  });

  await prisma.medicalReviewer.upsert({
    where: { slug: "jamie-chen-pa-c" },
    update: {},
    create: {
      slug: "jamie-chen-pa-c",
      name: "Dr. Jamie Chen",
      credentialSuffix: "PA-C",
      title: "Dermatology Physician Assistant",
      bio: "Jamie is a board-certified dermatology physician assistant with eight years of clinical experience in medical and cosmetic dermatology in the Chicago area. Her clinical focus includes injectables, laser therapy, and acne care. She reviews articles for medical accuracy, appropriate risk framing, and alignment with current AAD and ASDS guidelines.",
      photoUrl: null,
      licenseState: "IL",
      yearsExperience: 8,
      affiliations: [
        "Society of Dermatology Physician Assistants (SDPA)",
        "American Academy of Dermatology Associates (AADA)",
      ],
      expertise: [
        "Injectables",
        "Laser & IPL",
        "Acne & rosacea",
        "Medical-grade skincare",
      ],
      isPlaceholder: true,
    },
  });

  // ─── Lead magnet + starter blog post ──────────────────────
  const jamie = await prisma.medicalReviewer.findUnique({
    where: { slug: "jamie-chen-pa-c" },
  });
  const morgan = await prisma.author.findUnique({ where: { slug: "morgan-ellis" } });

  if (jamie) {
    await prisma.leadMagnet.upsert({
      where: { slug: "12-questions-before-your-first-botox" },
      update: {},
      create: {
        slug: "12-questions-before-your-first-botox",
        title: "The 12 questions to ask before your first Botox appointment",
        subtitle:
          "A printable, clinician-reviewed checklist. Take it with you to the consult — and leave knowing what you'll pay, who's injecting, and whether it's right for you.",
        description: `Consults are supposed to be a conversation, not a sales pitch. But most first-timers walk in without the right questions, and walk out with a treatment plan before they've thought it through.

This 12-question checklist was put together by our editorial team and reviewed by a licensed dermatology PA. It covers provider credentials, what "units" actually means (and why "per area" pricing often costs more), what to expect on day one vs week two, what the real risks look like, and the consult red flags that should stop you from booking.

Print it, screenshot it, or bring it on your phone. No spam — just the guide and one email a week with honest, expert-reviewed aesthetics content.`,
        pageCount: 6,
        downloadUrl: "/lead-magnets/12-questions-before-botox.pdf",
        reviewedById: jamie.id,
        published: true,
      },
    });
  }

  if (morgan && jamie) {
    await prisma.blogPost.upsert({
      where: { slug: "botox-complete-guide" },
      update: {},
      create: {
        slug: "botox-complete-guide",
        title: "Botox: the complete guide (2026)",
        excerpt:
          "What Botox actually does, what it costs in 2026, who it's for, and how to find an injector worth the money.",
        body: `<h2>What Botox does — and doesn't</h2>
<p>Botox is a purified form of botulinum toxin A that temporarily relaxes the specific facial muscles you activate when you frown, squint, or raise your brows. Relaxed muscle = less creased skin = softer lines. It does not fill anything, it does not resurface skin, and it does not work on lines you have at rest (those usually need filler or resurfacing).</p>
<h2>What it costs</h2>
<p>In the US in 2026, Botox is typically priced per unit or per treatment area. Per-unit pricing ($10–18/unit) is usually the more honest way to buy it; per-area pricing feels simpler but can hide a higher effective rate.</p>
<h2>Who's a good candidate</h2>
<p>Adults with dynamic lines (lines that appear or deepen when you animate) are the best candidates. Pregnant and breastfeeding patients, people with neuromuscular conditions like myasthenia gravis, and anyone with an active infection at the injection site should not get Botox.</p>
<h2>How to choose a provider</h2>
<p>Ask about credentials (RN, NP, PA-C, MD), how many injections they do per week, what neuromodulator products they carry (Botox, Dysport, Daxxify, Xeomin each behave differently), and whether the injector — not just the medical director — is on-site for your appointment.</p>
<p><em>This guide is an early draft — full pillar version lands during our content sprint. In the meantime, the checklist linked at the top of this page will make you a sharper first-time patient.</em></p>`,
        coverImage: null,
        authorId: morgan.id,
        medicalReviewerId: jamie.id,
        reviewedAt: new Date(),
        tags: ["botox", "injectables", "pillar"],
        isPillar: true,
        readingMinutes: 9,
        published: true,
        publishedAt: new Date(),
      },
    });
  }

  // A sample comparison
  const botox = await prisma.service.findUnique({ where: { slug: "botox" } });
  const fillers = await prisma.service.findUnique({ where: { slug: "dermal-fillers" } });
  if (botox && fillers) {
    await prisma.comparison.upsert({
      where: { slug: "botox-vs-fillers" },
      update: {},
      create: {
        slug: "botox-vs-fillers",
        title: "Botox vs Dermal Fillers: Which is right for you?",
        serviceAId: botox.id,
        serviceBId: fillers.id,
        summary:
          "Botox relaxes muscles to smooth dynamic wrinkles, while fillers restore volume and contour. Many patients combine both for a balanced result.",
        pros: {
          a: ["Quick 10-minute treatment", "Prevents deeper lines over time", "No downtime", "Results in 3–7 days", "Lasts 3–4 months"],
          b: ["Instant visible results", "Restores lost volume", "Contours lips and cheeks", "Lasts 6–18 months", "Reversible (HA fillers)"],
        },
        cons: {
          a: ["Only works on dynamic wrinkles", "Temporary (~3 months)", "Can look frozen if overdone", "Not for volume loss"],
          b: ["More expensive per syringe", "Possible swelling/bruising", "Requires skilled injector", "Cost adds up for multiple areas"],
        },
        table: [
          { attribute: "Primary use", a: "Dynamic wrinkles", b: "Volume loss, contouring" },
          { attribute: "Procedure time", a: "~10 min", b: "15–45 min" },
          { attribute: "Downtime", a: "None", b: "Mild swelling 24–48h" },
          { attribute: "Onset", a: "3–7 days", b: "Immediate" },
          { attribute: "Duration", a: "3–4 months", b: "6–18 months" },
          { attribute: "Avg cost", a: "$10–18/unit", b: "$650–1,200/syringe" },
          { attribute: "Best candidate", a: "Active lines", b: "Hollowness, thin lips" },
          { attribute: "Maintenance", a: "Every 3–4 months", b: "Every 9–12 months" },
        ],
      },
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
