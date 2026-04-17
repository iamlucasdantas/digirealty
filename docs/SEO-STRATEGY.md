# SEO strategy

The three-surface playbook that drives organic traffic.

## Surfaces

### 1. Programmatic service + city pages

URL pattern: `/{service-slug}-in-{city-slug}` (e.g. `/botox-in-davenport-ia`).

Each renders:
- H1 with the primary keyword phrase.
- Meta title ≤ 60 chars, meta description ≤ 155 chars.
- 600–900 words of unique, location-flavored copy (AI-generated, human-edited).
- Top N ranked provider cards with real pricing + review data.
- FAQ block rendered to `FAQPage` schema.
- Breadcrumbs rendered to `BreadcrumbList` schema.
- Dense internal linking to: parent service, parent city, sibling services
  in-city, same-service in sibling cities, comparisons.

Variants per city/service:
- `/{service}-in-{city}` — base.
- `/best-{service}-in-{city}` — captures "best" intent.
- `/{service}-near-me` — captures near-me intent (no city).

Output: services × cities ≈ 12 × 4 = 48 pages at launch; 500+ at first
regional expansion; 100k+ nationally.

### 2. Comparison articles

URL pattern: `/compare/{slug}` (e.g. `/compare/botox-vs-fillers`).

Captures top-of-funnel comparison intent (high-volume keywords like "botox vs
fillers", "coolsculpting vs emsculpt"). High dwell time; low bounce. Heavily
internal-linked from related service pages.

### 3. Educational blog

URL pattern: `/learn/{slug}`. Long-tail how-to + guide content:
- "How much does Botox cost in 2026"
- "What to expect your first lip filler appointment"
- "Laser hair removal sessions needed by skin type"

Cluster-oriented: every post links to a pillar (service hub) and 2–3 related
cluster posts.

## Technical SEO

- **Sitemaps:** `src/app/sitemap.ts` emits the full service × city cross-product
  plus businesses, comparisons, blog. When we cross ~40k URLs, split by type.
- **Canonicals:** every page sets `alternates.canonical` to its absolute URL.
- **Robots:** `/admin`, `/api`, `/go`, `/thanks`, `/login` disallowed.
- **Structured data:** `Organization`, `WebSite`, `LocalBusiness` (med
  business), `MedicalBusiness`, `AggregateRating`, `BreadcrumbList`,
  `FAQPage`, `Article`, `ItemList`.
- **Core Web Vitals:**
  - LCP: hero image as `next/image priority`, `font-display: swap`.
  - CLS: explicit dimensions on images; reserved space for lead form.
  - INP: lead form is the only JS-heavy island on SEO pages; everything else
    is RSC.
- **Image handling:** `next/image` + AVIF/WebP; remote domain allowlist in
  `next.config.mjs`.

## Internal linking strategy

Every SEO page links to:
1. Parent category hub (`/services/{category}`).
2. Parent service hub (`/services/{service}`).
3. Parent city hub (`/{city}`).
4. 3–5 related services in-city.
5. 3–5 same-service in sibling cities.
6. 1–2 comparison articles if the service appears in any.
7. 1 pillar blog post when clusters are published.

We'll automate this via `suggestInternalLinks()` in `src/lib/ai.ts` once
content volume passes 1k pages.

## Content refresh cadence

- Programmatic pages: regenerate sections quarterly, ping sitemap nightly.
- Comparison articles: refresh table + FAQ monthly.
- Blog: editorial calendar with a pillar + 4 cluster pieces per month.

## Tracking

- GA4 + PostHog. Key conversions:
  - `lead_submit` (every `/api/leads` success).
  - `ad_click` (`/go/ad/{id}`).
  - `affiliate_click` (`/api/affiliate/{slug}`).
- Funnel: landing page → form start → form step 2 → 3 → 4 → submit → thanks.
- Attribution dimensions: landingPath, referrer, utm_*, city, service.
