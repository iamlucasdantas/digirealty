# Roadmap

A pragmatic, stage-gated plan. Each stage has an explicit **exit criteria** — don't
skip ahead until the previous stage is profitable on its own terms.

## Stage 0 — Launch (weeks 0-6) · Quad Cities MVP

- [x] Next.js + Prisma + Postgres scaffold.
- [x] Programmatic SEO handler (`/{service}-in-{city}`).
- [x] Business directory + profiles.
- [x] Multi-step lead form + rate limiting + honeypot.
- [x] Lead routing engine (tier + rating scoring).
- [x] Admin dashboard (overview, leads, businesses, content, revenue).
- [x] Sitemap + robots + structured data.
- [x] Claude content engine + batch generator.
- [ ] Seed 50 real businesses via manual curation.
- [ ] Generate 200 service × city SEO pages.
- [ ] Ship 6 comparison articles.
- [ ] Install GA4 + PostHog + Search Console.

**Exit:** 10 paying providers, 50+ accepted leads/month.

---

## Stage 1 — Growth (weeks 6-16)

- [ ] Provider portal: magic-link auth, lead inbox, accept/reject UI, billing
      setup (Stripe Customer Portal).
- [ ] Stripe integration:
      - Subscriptions for Verified / Featured / Premium tiers.
      - Usage-based billing for pay-per-lead.
- [ ] Review ingestion: Google Places + Yelp Fusion APIs (nightly sync).
- [ ] Review moderation admin.
- [ ] Email sequences (nurture + provider response reminders).
- [ ] SMS notifications for providers (Twilio) — response time matters.
- [ ] SEO content velocity: 500 programmatic pages, 20 comparisons, 30 blogs.

**Exit:** $15k MRR; 500 accepted leads/month; Domain Rating ≥ 25.

---

## Stage 2 — Regional expansion (months 4-8)

- [ ] Onboarding pipeline: bulk import cities, businesses, services via CSV.
- [ ] Marketplace UX: map view, filters, saved searches.
- [ ] Claim-your-business flow with verification (Google Business Profile
      OAuth, phone OTP).
- [ ] A/B testing framework (GrowthBook or in-house).
- [ ] Conversion rate optimization on the 4-step form.
- [ ] Blog editorial calendar: 4 pillar + 16 cluster posts/month.
- [ ] SEO: launch state-level hubs (`/iowa-medspas`, `/illinois-injectors`).

**Exit:** 5 metros, 3000 businesses, $60k MRR.

---

## Stage 3 — National platform (months 8-18)

- [ ] Data platform: ClickHouse for events, dbt for transformations.
- [ ] Programmatic ads automation (Google Ads API) on high-intent queries.
- [ ] Affiliate storefront (supplements, at-home devices, skincare).
- [ ] Mobile web redesign (PWA-lite).
- [ ] Multi-region Postgres read replicas.
- [ ] Edge-cached sitemaps sharded by type.
- [ ] AI-powered "find my treatment" quiz → lead.
- [ ] Provider dashboard analytics (lead funnel, response time, CPC
      comparison).

**Exit:** 50+ metros, $500k+ MRR, 100k+ monthly organic sessions.

---

## Stage 4 — Platform + data products (year 2+)

- [ ] Verified pricing data API (sell anonymized pricing benchmarks to
      manufacturers).
- [ ] White-label for larger practice groups.
- [ ] Vertical expansion: cosmetic dentistry, hair restoration, weight loss
      clinics.
- [ ] AI concierge: SMS/chat bot that runs the quiz + books consultations.
- [ ] Paid-social managed service (we run ads on behalf of providers).

---

## Engineering debt to pay down continuously

- Replace in-memory rate limit with Upstash Redis once multi-region.
- Split sitemap when URL count crosses ~40k.
- Add Playwright e2e coverage for lead form + admin routes.
- Move ad impression/click counters to batched increments once we exceed
  500 rps on high-traffic ads.
- Introduce a feature-flag layer (GrowthBook) before shipping tier changes.
