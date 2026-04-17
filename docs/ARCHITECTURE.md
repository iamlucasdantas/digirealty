# Architecture

> AestheticsLeads is a SEO-first lead-generation platform for aesthetics, wellness, and
> cosmetic services. This document is the single source of truth for how the system
> is organized and why.

---

## 1. System overview

```
                             ┌───────────────────────────────────────────────────────────────┐
                             │                         Client (browser)                      │
                             │   Next.js RSC · hydrated islands · edge-cached HTML           │
                             └────────────────┬──────────────────────────────┬───────────────┘
                                              │                              │
                                        CDN / Edge                     Tracking pixels
                                              │                              │
        ┌──────────────────┐          ┌───────▼────────────┐        ┌────────▼─────────┐
        │ Search engines   │─ crawls ▶│  Next.js app       │        │  Analytics (GA4, │
        │ (Google, Bing)   │          │  (Node runtime)    │        │  PostHog)        │
        └──────────────────┘          │                    │        └──────────────────┘
                                      │  App Router        │
                                      │  - RSC pages       │
                                      │  - API routes      │
                                      │  - Middleware      │
                                      └─┬──────────┬──────┬┘
                                        │          │      │
                     ┌──────────────────▼┐  ┌──────▼────┐ │
                     │ PostgreSQL (RDS)  │  │ Resend    │ │
                     │ via Prisma        │  │ (email)   │ │
                     │ - businesses      │  └───────────┘ │
                     │ - leads           │                │
                     │ - seo_pages       │                ▼
                     │ - ads / affiliate │         ┌────────────────┐
                     └──────▲────────────┘         │ Claude API     │
                            │                      │ (content gen)  │
                ┌───────────┴─────────┐            └────────────────┘
                │ Background jobs     │
                │ (Vercel Cron / SQS) │
                │ - AI content batch  │
                │ - Sitemap ping      │
                │ - Lead re-route     │
                │ - Billing reconcile │
                └─────────────────────┘
```

### Request types

| Type                            | Surface                       | Rendering        | Cache                  |
| ------------------------------- | ----------------------------- | ---------------- | ---------------------- |
| SEO pages (service+city, blog)  | `/{service}-in-{city}`        | RSC + ISR        | Edge, 24h revalidation |
| Business profiles               | `/business/{slug}`            | RSC + ISR        | Edge, 1h revalidation  |
| Lead form                       | `/get-quotes`                 | RSC + client     | No cache               |
| API (lead, auth, tracking)      | `/api/*`                      | Node runtime     | No cache               |
| Admin                           | `/admin/*`                    | RSC, dynamic     | No cache               |

---

## 2. Folder structure

```
digirealty/
├─ prisma/
│   ├─ schema.prisma         # DB source of truth
│   └─ seed.ts               # categories, services, demo data
│
├─ scripts/
│   ├─ generate-content.ts   # batch Claude content jobs
│   └─ refresh-sitemap.ts    # ping Google/Bing
│
├─ src/
│   ├─ app/
│   │   ├─ layout.tsx
│   │   ├─ page.tsx                    # home
│   │   ├─ globals.css
│   │   ├─ sitemap.ts                  # dynamic sitemap
│   │   ├─ robots.ts
│   │   │
│   │   ├─ [serviceCity]/page.tsx      # programmatic SEO + city hub
│   │   ├─ business/[slug]/page.tsx    # directory profile
│   │   ├─ compare/[slug]/page.tsx     # comparison article
│   │   ├─ services/
│   │   │   ├─ page.tsx
│   │   │   └─ [slug]/page.tsx         # service hub
│   │   ├─ get-quotes/page.tsx         # multi-step form
│   │   ├─ thanks/page.tsx
│   │   ├─ for-providers/page.tsx      # sales page
│   │   ├─ login/page.tsx
│   │   │
│   │   ├─ admin/                      # dashboard
│   │   │   ├─ layout.tsx
│   │   │   ├─ page.tsx                # KPIs
│   │   │   ├─ leads/page.tsx
│   │   │   ├─ businesses/page.tsx
│   │   │   ├─ content/page.tsx
│   │   │   └─ revenue/page.tsx
│   │   │
│   │   ├─ go/ad/[id]/route.ts         # ad click redirect
│   │   │
│   │   └─ api/
│   │       ├─ leads/route.ts               # POST new lead
│   │       ├─ leads/[id]/respond/route.ts  # provider accept/reject
│   │       ├─ auth/login|logout/route.ts
│   │       ├─ admin/businesses/route.ts    # GET/POST
│   │       ├─ affiliate/[slug]/route.ts    # click-out
│   │       └─ track/ad/route.ts            # impression/click
│   │
│   ├─ components/
│   │   ├─ site-header.tsx
│   │   ├─ site-footer.tsx
│   │   ├─ lead-form.tsx              # 4-step qualification form
│   │   ├─ business-card.tsx
│   │   ├─ ad-slot.tsx
│   │   └─ json-ld.tsx
│   │
│   ├─ lib/
│   │   ├─ db.ts                 # Prisma singleton
│   │   ├─ config.ts             # siteConfig
│   │   ├─ utils.ts              # cn, slug, currency, hashIp
│   │   ├─ seo.ts                # metadata + JSON-LD builders
│   │   ├─ validation.ts         # Zod schemas
│   │   ├─ rate-limit.ts
│   │   ├─ auth.ts               # JWT + bcrypt + cookies
│   │   ├─ email.ts              # Resend wrapper
│   │   ├─ ai.ts                 # Claude content engine
│   │   ├─ lead-routing.ts       # match + route + notify
│   │   └─ repos/
│   │       ├─ businesses.ts
│   │       └─ seo-pages.ts
│   │
│   └─ middleware.ts             # session cookie
│
├─ docs/
│   ├─ ARCHITECTURE.md           # this file
│   ├─ LEAD-FLOW.md              # step-by-step lead flow
│   ├─ SEO-STRATEGY.md
│   └─ ROADMAP.md
```

---

## 3. Data model (summary — full schema in `prisma/schema.prisma`)

```
Market 1—n City 1—n Business n—m Service m—1 Category
                                   │          │
                                   └─ Review  └─ Comparison (Service × Service)
                                   └─ Lead ──── LeadAssignment ──► Business
                                        │
                                        └─ LeadEvent (timeline)

SeoPage ──1─ Service?   ──1─ City?   ──1─ Comparison?
BlogPost  ──1─ User (author)

User ──(owns)── Business (claim flow)

AdPlacement     — sponsored content (city/service/business scoped)
AffiliateProduct + AffiliateClick  — product monetization
```

### Key indexes

- `Business(cityId, status, tier)` — for ranked city listings.
- `Lead(status, createdAt)` — admin inbox & revenue reports.
- `LeadAssignment(businessId, status)` — provider lead inbox.
- `SeoPage(type, published)` — sitemap + admin filters.
- `AdPlacement(placement, active, startsAt, endsAt)` — ad selection.

---

## 4. API design

All routes are Next.js App Router handlers. Responses are JSON unless noted.

### Public

| Method | Path                              | Purpose                                       |
| ------ | --------------------------------- | --------------------------------------------- |
| POST   | `/api/leads`                      | Submit a lead (rate-limited, honeypotted)     |
| POST   | `/api/auth/login`                 | Issue session cookie                          |
| POST   | `/api/auth/logout`                | Clear session                                 |
| POST   | `/api/track/ad`                   | Track impression / click                      |
| GET    | `/api/affiliate/{slug}`           | Log click, 302 to vendor URL                  |
| GET    | `/go/ad/{id}`                     | Log ad click, 302 to advertiser URL           |

### Authenticated (BUSINESS_OWNER / ADMIN)

| Method | Path                                | Purpose                          |
| ------ | ----------------------------------- | -------------------------------- |
| POST   | `/api/leads/{id}/respond`           | Accept or reject a lead offer    |

### Admin / Editor

| Method | Path                         | Purpose                        |
| ------ | ---------------------------- | ------------------------------ |
| GET    | `/api/admin/businesses`      | List businesses                |
| POST   | `/api/admin/businesses`      | Create or update business      |

### Background

- `scripts/generate-content.ts` — run from Vercel Cron or GitHub Actions.
- `scripts/refresh-sitemap.ts` — nightly ping.

---

## 5. Example pages

### Local SEO page `/{service}-in-{city}`

File: `src/app/[serviceCity]/page.tsx`

Renders:
1. **Hero** — H1 = "Botox in Davenport, IA", CTA = multi-step lead form.
2. **Top providers** — ranked by tier, rating, review count.
3. **Long-form content** — AI-generated `SeoPage.body` (editable).
4. **FAQ** — JSON-LD `FAQPage` schema emitted.
5. **Related internal links** — other services in same city, same service in other cities.
6. **Ad slot** — `CITY_SIDEBAR` placement.

Schema emitted: `BreadcrumbList`, `FAQPage`, `ItemList`.

### Business profile `/business/{slug}`

File: `src/app/business/[slug]/page.tsx`

Renders: hero (name, rating, contact), about, services with pricing,
reviews, sidebar hours + ad slot.

Schema emitted: `MedicalBusiness`, `AggregateRating`, `BreadcrumbList`.

### Comparison `/compare/{slug}`

File: `src/app/compare/[slug]/page.tsx`

Renders: hero + lead form, "at a glance" comparison table, pros/cons blocks,
long-form body, FAQ.

Schema emitted: `Article`, `FAQPage`, `BreadcrumbList`.

---

## 6. Lead flow (the money path)

Full details in [`LEAD-FLOW.md`](./LEAD-FLOW.md).

```
User clicks "Get free quotes"
  └─ Multi-step LeadForm (timeframe → budget → contact → message)
       └─ POST /api/leads
             ├─ Zod validation + honeypot
             ├─ Rate limit (5/min/IP)
             ├─ Create Lead + LeadEvent("created")
             └─ Fire-and-forget routeLead(leadId)
                   ├─ findMatches: score by (tier, rating, claimed)
                   ├─ Transaction:
                   │    - Lead.status = ROUTED
                   │    - Insert 1..N LeadAssignment rows (exclusive: first accepts)
                   │    - LeadEvent("routed")
                   └─ Send email(s) to matched providers via Resend
Provider clicks accept → POST /api/leads/{id}/respond
  ├─ Lead.status = ACCEPTED
  ├─ Expire other offered assignments
  └─ Trigger billing (Stripe usage record or invoice line)
```

Re-try / fallback: if no match within `findMatches`, we log
`LeadEvent("route_no_match")` and the admin inbox surfaces it for manual routing.

---

## 7. Monetization logic

### a) Pay-per-lead

`Lead.priceCents` is set at routing time via `priceForTier()` in
`src/lib/lead-routing.ts`:

| Tier      | Multiplier | Default price (w/ `LEAD_PRICE_DEFAULT_CENTS=2500`) |
| --------- | ---------: | -------------------------------------------------: |
| PREMIUM   | 1.6×       | $40.00                                             |
| FEATURED  | 1.3×       | $32.50                                             |
| VERIFIED  | 1.0×       | $25.00                                             |
| FREE      | 0.6×       | $15.00                                             |

Only `ACCEPTED` leads are billable. Stripe integration creates a usage record on
`/api/leads/{id}/respond`.

### b) Featured & Premium subscriptions

Stored on `Business.tier` + `Business.tierUntil`. Tier controls:
- Ranking weight on city & service pages.
- Eligibility for `FEATURED`/`PREMIUM` ad placements.
- Lead price (above).
- Claim + reply-first rights.

Billing: Stripe Checkout session → webhook updates `tier` + `tierUntil`.

### c) Ads (`AdPlacement`)

Placements: `HOMEPAGE_HERO`, `CITY_SIDEBAR`, `SERVICE_TOP`,
`BUSINESS_RELATED`, `BLOG_INLINE`. Selected by `AdSlot` with priority + date
window. Clicks go through `/go/ad/{id}` for attribution.

### d) Affiliate (`AffiliateProduct` + `AffiliateClick`)

Outbound affiliate links pass through `/api/affiliate/{slug}`, which logs the
click (privacy-hashed IP) then 302s to the vendor URL with our affiliate tag.
Outbound `rel="sponsored nofollow"`.

---

## 8. Scalability plan

### Geographic expansion (multi-city → nationwide)

1. **Launch market:** Quad Cities — low CPC, tight operations, manual onboarding.
2. **Tier-2 expansion:** Add cities via `Market` + `City` rows. Content is
   generated by `scripts/generate-content.ts` (batch Claude).
3. **State-level rollout:** Automate onboarding: import directory data (Google
   Places, Yelp Fusion, manual curation), then generate SEO pages.
4. **Nationwide:** Split sitemap into `/sitemaps/cities-*.xml` when URL count
   crosses ~40k. Shard PostgreSQL reads via read replicas.

### Traffic scaling

| Traffic     | Action                                                       |
| ----------- | ------------------------------------------------------------ |
| 0–100k/mo   | Single Vercel project, single Postgres (Neon / Supabase)     |
| 100k–1M     | Add Postgres read replica, enable Vercel Edge on SEO pages   |
| 1M–10M      | Move Redis rate-limit to Upstash, CDN image host (Cloudinary) |
| 10M+        | Split write-heavy tables (leads, ad_events) into TimescaleDB |

### Database scaling

- Start with a single RDS/Neon Postgres.
- Move hot analytical tables (`LeadEvent`, `AffiliateClick`, `AdPlacement`
  counters) to a separate schema. Upgrade counters to atomic `UPDATE` with
  periodic flushes — currently inline, fine to ~1M events/day.
- Consider ClickHouse for event analytics once we cross 10M events/month.

---

## 9. DevOps

### Deployment

- **Primary target:** Vercel (zero-config Next.js). Every PR gets a preview
  deployment. Production promotes from `main`.
- **Alternative:** Fly.io or Render with a Dockerfile — Next.js `output:
  "standalone"` is a trivial switch.

### Database

- **Managed Postgres** (Neon for serverless, or RDS for heavy writes).
- Use `DIRECT_URL` (bypassing PgBouncer) for Prisma migrations;
  `DATABASE_URL` (pooled) for runtime queries. `.env.example` already splits
  these.
- Automate backups. Nightly snapshot + 30-day retention minimum.

### Secrets

- Vercel Project env vars. For non-Vercel: Doppler, Infisical, or AWS Secrets
  Manager.
- Rotate `JWT_SECRET` via a short overlap window (dual-verify).

### Monitoring & observability

- Structured logs to Vercel / Datadog.
- Uptime: Checkly or Better Uptime on `/api/leads` (synthetic POST) and
  `/sitemap.xml`.
- Business metrics: PostHog for funnels; admin dashboard for real-time.

### Background jobs

- **Vercel Cron** for nightly jobs (sitemap ping, content batch).
- **QStash / SQS** for queued work once per-lead side-effects grow (lead
  enrichment, SMS, Slack notify).

### Performance budgets (Core Web Vitals)

- LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Enforced by Next.js image optimization, `next/font`, and RSC-only marketing
  pages.

### Security

- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` set in `next.config.mjs`.
- Zod validation on every mutation.
- Honeypot + rate-limit on `/api/leads`.
- Bcrypt (cost 12) for passwords, jose for JWT with HS256.
- IPs hashed with a site salt before storage — never PII-raw.

---

## 10. Future features roadmap

See [`ROADMAP.md`](./ROADMAP.md).
